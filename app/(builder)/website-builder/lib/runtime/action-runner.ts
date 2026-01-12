import { WebContainer } from '@webcontainer/api';
import { map, type MapStore } from 'nanostores';
import * as nodePath from 'path-browserify';
import type { BuilderAction } from '@/app/(builder)/website-builder/types/actions';
import { createScopedLogger } from '@/app/(builder)/website-builder/utils/logger';
import { unreachable } from '@/app/(builder)/website-builder/utils/unreachable';
import type { ActionCallbackData } from './message-parser';

const logger = createScopedLogger('ActionRunner');

export type ActionStatus =
  | 'pending'
  | 'running'
  | 'complete'
  | 'aborted'
  | 'failed';

export type BaseActionState = BuilderAction & {
  status: Exclude<ActionStatus, 'failed'>;
  abort: () => void;
  executed: boolean;
  abortSignal: AbortSignal;
};

export type FailedActionState = BuilderAction &
  Omit<BaseActionState, 'status'> & {
    status: Extract<ActionStatus, 'failed'>;
    error: string;
  };

export type ActionState = BaseActionState | FailedActionState;

type BaseActionUpdate = Partial<
  Pick<BaseActionState, 'status' | 'abort' | 'executed'>
>;

export type ActionStateUpdate =
  | BaseActionUpdate
  | (Omit<BaseActionUpdate, 'status'> & { status: 'failed'; error: string });

type ActionsMap = MapStore<Record<string, ActionState>>;

export class ActionRunner {
  #webcontainer: Promise<WebContainer>;
  #currentExecutionPromise: Promise<void> = Promise.resolve();

  actions: ActionsMap = map({});

  constructor(webcontainerPromise: Promise<WebContainer>) {
    this.#webcontainer = webcontainerPromise;
  }

  addAction(data: ActionCallbackData) {
    const { actionId } = data;

    const actions = this.actions.get();
    const action = actions[actionId];

    if (action) {
      // action already added
      return;
    }

    const abortController = new AbortController();

    this.actions.setKey(actionId, {
      ...data.action,
      status: 'pending',
      executed: false,
      abort: () => {
        abortController.abort();
        this.#updateAction(actionId, { status: 'aborted' });
      },
      abortSignal: abortController.signal,
    });

    this.#currentExecutionPromise.then(() => {
      this.#updateAction(actionId, { status: 'running' });
    });
  }

  async runAction(data: ActionCallbackData) {
    const { actionId } = data;
    const action = this.actions.get()[actionId];

    if (!action) {
      unreachable(`Action ${actionId} not found`);
    }

    if (action.executed) {
      return;
    }

    this.#updateAction(actionId, { ...action, ...data.action, executed: true });

    this.#currentExecutionPromise = this.#currentExecutionPromise
      .then(() => {
        return this.#executeAction(actionId);
      })
      .catch((error) => {
        console.error('Action failed:', error);
      });
  }

  async #executeAction(actionId: string) {
    const action = this.actions.get()[actionId];

    console.log(
      `[ActionRunner] Executing action ${actionId}, type: ${action.type}`
    );
    console.time(`[ActionRunner] Action ${actionId}`);

    this.#updateAction(actionId, { status: 'running' });

    try {
      switch (action.type) {
        case 'shell': {
          await this.#runShellAction(action);
          break;
        }
        case 'file': {
          await this.#runFileAction(action);
          break;
        }
      }

      console.timeEnd(`[ActionRunner] Action ${actionId}`);
      this.#updateAction(actionId, {
        status: action.abortSignal.aborted ? 'aborted' : 'complete',
      });
    } catch (error) {
      console.timeEnd(`[ActionRunner] Action ${actionId}`);
      console.error(`[ActionRunner] Action ${actionId} failed:`, error);
      this.#updateAction(actionId, {
        status: 'failed',
        error: 'Action failed',
      });

      // re-throw the error to be caught in the promise chain
      throw error;
    }
  }

  async #runShellAction(action: ActionState): Promise<void> {
    if (action.type !== 'shell') {
      unreachable('Expected shell action');
    }

    console.log('[ActionRunner] Shell command:', action.content);
    console.time('[ActionRunner] WebContainer await');
    const webcontainer = await this.#webcontainer;
    console.timeEnd('[ActionRunner] WebContainer await');

    const process = await webcontainer.spawn('jsh', ['-c', action.content], {
      env: { npm_config_yes: true },
    });

    action.abortSignal.addEventListener('abort', () => {
      process.kill();
    });

    // check if this is a dev server command
    const isDevServer = this.#isDevServerCommand(action.content);
    let devServerStarted = false;
    let outputBuffer = '';
    let missingDependencyDetected = false;
    let syntaxErrorDetected = false;
    let buildErrorDetected = false;
    let portConflictDetected = false;

    process.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log(data);

          const str = data.toString();
          outputBuffer += str.toLowerCase();

          // Detect various error types
          if (str.includes('command not found') || str.includes('not found:')) {
            missingDependencyDetected = true;
          }

          if (str.match(/SyntaxError|Unexpected token|Parse error/i)) {
            syntaxErrorDetected = true;
            logger.error('Syntax error detected in generated code');
          }

          if (str.match(/Failed to compile|Build failed|compilation error/i)) {
            buildErrorDetected = true;
            logger.error('Build error detected');
          }

          if (str.match(/EADDRINUSE|port.*already in use/i)) {
            portConflictDetected = true;
            logger.warn('Port conflict detected');
          }

          // accumulate output for dev server detection
          if (isDevServer && !devServerStarted) {
            // outputBuffer handled above
          }
        },
      })
    );

    // for dev servers, monitor output and mark complete when started
    if (isDevServer) {
      const startDetectionPromise = new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.#detectDevServerStart(outputBuffer)) {
            devServerStarted = true;
            clearInterval(checkInterval);
            // safe to clear timeout if it exists, though here we use a race
            logger.debug('Dev server detected as started');
            resolve();
          }
        }, 100);

        // global timeout handled by race now, but good to have cleanup
      });

      const processExitPromise = process.exit.then((code) => {
        if (code !== 0) {
          throw new Error(`Process exited with code ${code}`);
        }
      });

      try {
        await Promise.race([startDetectionPromise, processExitPromise]);
      } catch (error) {
        // If process exited with error, check if we should recover
        if (missingDependencyDetected) {
          logger.info(
            'Detected missing dependency. Attempting auto-recovery with npm install...'
          );

          // Notify user (via terminal output mostly)
          const installProcess = await webcontainer.spawn('npm', ['install']);
          installProcess.output.pipeTo(
            new WritableStream({
              write(data) {
                console.log(data);
              },
            })
          );
          await installProcess.exit;

          logger.info('Auto-recovery complete. Retrying original command...');
          return this.#runShellAction(action);
        }

        // Log other error types for visibility
        if (syntaxErrorDetected) {
          logger.error(
            'Syntax error in code - manual fix required or AI regeneration needed'
          );
        }

        if (buildErrorDetected) {
          logger.error('Build error detected - check generated code quality');
        }

        if (portConflictDetected) {
          logger.warn('Port conflict - dev server may need manual restart');
        }

        throw error;
      }

      console.log('[ActionRunner] Dev server started!');

      return;
    }

    // for non-dev-server commands, wait for exit as before
    const exitCode = await process.exit;

    // Auto-recovery for non-dev commands too
    if (exitCode !== 0 && missingDependencyDetected) {
      logger.info(
        'Detected missing dependency on non-dev command. Installing...'
      );
      const installProcess = await webcontainer.spawn('npm', ['install']);
      installProcess.output.pipeTo(
        new WritableStream({
          write(d) {
            console.log(d);
          },
        })
      );
      await installProcess.exit;

      // Retry
      logger.info('Retrying original command...');
      return this.#runShellAction(action);
    }

    logger.debug(`Process terminated with code ${exitCode}`);
  }

  #isDevServerCommand(command: string): boolean {
    const devPatterns = [
      /npm\s+run\s+dev/,
      /npm\s+run\s+start/,
      /npm\s+start/,
      /yarn\s+dev/,
      /yarn\s+start/,
      /pnpm\s+dev/,
      /pnpm\s+start/,
      /vite/,
      /next\s+dev/,
      /astro\s+dev/,
    ];

    return devPatterns.some((pattern) => pattern.test(command));
  }

  #detectDevServerStart(output: string): boolean {
    const successPatterns = [
      /local:\s*http/,
      /localhost:/,
      /:\d{4,5}/, // port numbers like :5173, :3000
      /ready in/,
      /server running/,
      /compiled successfully/,
      /built in/,
      /listening on/,
    ];

    return successPatterns.some((pattern) => pattern.test(output));
  }

  async #runFileAction(action: ActionState) {
    if (action.type !== 'file') {
      unreachable('Expected file action');
    }

    console.time(`[ActionRunner] Write file: ${action.filePath}`);
    const webcontainer = await this.#webcontainer;

    let folder = nodePath.dirname(action.filePath);

    // remove trailing slashes
    folder = folder.replace(/\/+$/g, '');

    if (folder !== '.') {
      try {
        await webcontainer.fs.mkdir(folder, { recursive: true });
        logger.debug('Created folder', folder);
      } catch (error) {
        logger.error('Failed to create folder\n\n', error);
      }
    }

    try {
      await webcontainer.fs.writeFile(action.filePath, action.content);
      console.timeEnd(`[ActionRunner] Write file: ${action.filePath}`);
      logger.debug(`File written ${action.filePath}`);
    } catch (error) {
      console.timeEnd(`[ActionRunner] Write file: ${action.filePath}`);
      logger.error('Failed to write file\n\n', error);
    }
  }

  #updateAction(id: string, newState: ActionStateUpdate) {
    const actions = this.actions.get();

    this.actions.setKey(id, { ...actions[id], ...newState });
  }
}
