import { useStore } from '@nanostores/react';
import { Icon } from '@iconify/react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from 'react-resizable-panels';
import {
  CodeMirrorEditor,
  type EditorDocument,
  type EditorSettings,
  type OnChangeCallback as OnEditorChange,
  type OnSaveCallback as OnEditorSave,
  type OnScrollCallback as OnEditorScroll,
} from '@/app/(builder)/website-builder/components/editor/codemirror/CodeMirrorEditor';
import { IconButton } from '@/app/(builder)/website-builder/components/ui/IconButton';
import { PanelHeader } from '@/app/(builder)/website-builder/components/ui/PanelHeader';
import { PanelHeaderButton } from '@/app/(builder)/website-builder/components/ui/PanelHeaderButton';
import { shortcutEventEmitter } from '@/app/(builder)/website-builder/lib/hooks';
import type { FileMap } from '@/app/(builder)/website-builder/lib/stores/files';
import { themeStore } from '@/app/(builder)/website-builder/lib/stores/theme';
import { workbenchStore } from '@/app/(builder)/website-builder/lib/stores/workbench';
import { classNames } from '@/app/(builder)/website-builder/utils/classNames';
import { WORK_DIR } from '@/app/(builder)/website-builder/utils/constants';
import { renderLogger } from '@/app/(builder)/website-builder/utils/logger';
import { isMobile } from '@/app/(builder)/website-builder/utils/mobile';
import { FileBreadcrumb } from './FileBreadcrumb';
import { FileTree } from './FileTree';
import { Terminal, type TerminalRef } from './terminal/Terminal';

interface EditorPanelProps {
  files?: FileMap;
  unsavedFiles?: Set<string>;
  editorDocument?: EditorDocument;
  selectedFile?: string | undefined;
  isStreaming?: boolean;
  onEditorChange?: OnEditorChange;
  onEditorScroll?: OnEditorScroll;
  onFileSelect?: (value?: string) => void;
  onFileSave?: OnEditorSave;
  onFileReset?: () => void;
}

const MAX_TERMINALS = 3;
const DEFAULT_TERMINAL_SIZE = 25;
const DEFAULT_EDITOR_SIZE = 100 - DEFAULT_TERMINAL_SIZE;

const editorSettings: EditorSettings = { tabSize: 2 };

export const EditorPanel = memo(
  ({
    files,
    unsavedFiles,
    editorDocument,
    selectedFile,
    isStreaming,
    onFileSelect,
    onEditorChange,
    onEditorScroll,
    onFileSave,
    onFileReset,
  }: EditorPanelProps) => {
    renderLogger.trace('EditorPanel');

    const theme = useStore(themeStore);
    const showTerminal = useStore(workbenchStore.showTerminal);

    const terminalRefs = useRef<Array<TerminalRef | null>>([]);
    const terminalPanelRef = useRef<ImperativePanelHandle>(null);
    const terminalToggledByShortcut = useRef(false);

    const [activeTerminal, setActiveTerminal] = useState(0);
    const [terminalCount, setTerminalCount] = useState(1);

    const activeFileSegments = useMemo(() => {
      if (!editorDocument) {
        return undefined;
      }

      return editorDocument.filePath.split('/');
    }, [editorDocument]);

    const activeFileUnsaved = useMemo(() => {
      return editorDocument !== undefined && unsavedFiles?.has(editorDocument.filePath);
    }, [editorDocument, unsavedFiles]);

    useEffect(() => {
      const unsubscribeFromEventEmitter = shortcutEventEmitter.on('toggleTerminal', () => {
        terminalToggledByShortcut.current = true;
      });

      const unsubscribeFromThemeStore = themeStore.subscribe(() => {
        for (const ref of Object.values(terminalRefs.current)) {
          ref?.reloadStyles();
        }
      });

      return () => {
        unsubscribeFromEventEmitter();
        unsubscribeFromThemeStore();
      };
    }, []);

    useEffect(() => {
      const { current: terminal } = terminalPanelRef;

      if (!terminal) {
        return;
      }

      const isCollapsed = terminal.isCollapsed();

      if (!showTerminal && !isCollapsed) {
        terminal.collapse();
      } else if (showTerminal && isCollapsed) {
        terminal.resize(DEFAULT_TERMINAL_SIZE);
      }

      terminalToggledByShortcut.current = false;
    }, [showTerminal]);

    const addTerminal = () => {
      if (terminalCount < MAX_TERMINALS) {
        setTerminalCount(terminalCount + 1);
        setActiveTerminal(terminalCount);
      }
    };

    const removeTerminal = (indexToRemove: number) => {
      if (terminalCount > 1) {
        setTerminalCount(terminalCount - 1);

        // If removing the active terminal, switch to the previous one
        if (activeTerminal === indexToRemove) {
          setActiveTerminal(Math.max(0, indexToRemove - 1));
        } else if (activeTerminal > indexToRemove) {
          setActiveTerminal(activeTerminal - 1);
        }
      }
    };

    return (
      <PanelGroup direction="vertical">
        <Panel defaultSize={showTerminal ? DEFAULT_EDITOR_SIZE : 100} minSize={20}>
          <PanelGroup direction="horizontal">
            <Panel defaultSize={20} minSize={10} collapsible>
              <div className="flex flex-col border-r border-surface h-full bg-surface-0">
                <PanelHeader>
                  <Icon icon="ph:tree-structure-duotone" className="shrink-0 text-lg" />
                  Files
                </PanelHeader>
                <FileTree
                  className="h-full"
                  files={files}
                  hideRoot
                  unsavedFiles={unsavedFiles}
                  rootFolder={WORK_DIR}
                  selectedFile={selectedFile}
                  onFileSelect={onFileSelect}
                />
              </div>
            </Panel>
            <PanelResizeHandle />
            <Panel className="flex flex-col" defaultSize={80} minSize={20}>
              <PanelHeader className="overflow-x-auto">
                {activeFileSegments?.length && (
                  <div className="flex items-center flex-1 text-sm">
                    <FileBreadcrumb pathSegments={activeFileSegments} files={files} onFileSelect={onFileSelect} />
                    {activeFileUnsaved && (
                      <div className="flex gap-1 ml-auto -mr-1.5">
                        <PanelHeaderButton onClick={onFileSave}>
                          <Icon icon="ph:floppy-disk-duotone" />
                          Save
                        </PanelHeaderButton>
                        <PanelHeaderButton onClick={onFileReset}>
                          <Icon icon="ph:clock-counter-clockwise-duotone" />
                          Reset
                        </PanelHeaderButton>
                      </div>
                    )}
                  </div>
                )}
              </PanelHeader>
              <div className="h-full flex-1 overflow-hidden">
                <CodeMirrorEditor
                  theme={theme}
                  editable={!isStreaming && editorDocument !== undefined}
                  settings={editorSettings}
                  doc={editorDocument}
                  autoFocusOnDocumentChange={!isMobile()}
                  onScroll={onEditorScroll}
                  onChange={onEditorChange}
                  onSave={onFileSave}
                />
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle />
        <Panel
          ref={terminalPanelRef}
          defaultSize={showTerminal ? DEFAULT_TERMINAL_SIZE : 0}
          minSize={10}
          collapsible
          onExpand={() => {
            if (!terminalToggledByShortcut.current) {
              workbenchStore.toggleTerminal(true);
            }
          }}
          onCollapse={() => {
            if (!terminalToggledByShortcut.current) {
              workbenchStore.toggleTerminal(false);
            }
          }}
        >
          <div className="h-full">
            <div className="bg-surface-0 h-full flex flex-col">
              <div className="flex items-center bg-surface-b border-y border-surface gap-1.5 min-h-[34px] p-2">
                {Array.from({ length: terminalCount }, (_, index) => {
                  const isActive = activeTerminal === index;

                  return (
                    <button
                      key={index}
                      className={classNames(
                        'flex items-center text-sm cursor-pointer gap-1 px-2 py-1.5 h-full whitespace-nowrap rounded-full transition-colors group',
                        {
                          'bg-primary/10 text-primary': isActive,
                          'bg-transparent text-text-secondary hover:bg-surface-c': !isActive,
                        },
                      )}
                      onClick={() => setActiveTerminal(index)}
                    >
                      <Icon icon="ph:terminal-window-duotone" className="text-base" />
                      <span className="text-xs">Terminal {terminalCount > 1 && index + 1}</span>
                      {terminalCount > 1 && (
                        <button
                          className="ml-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTerminal(index);
                          }}
                        >
                          <Icon icon="ph:x" className="text-xs" />
                        </button>
                      )}
                    </button>
                  );
                })}
                {terminalCount < MAX_TERMINALS && (
                  <IconButton icon="ph:plus" size="md" onClick={addTerminal} />
                )}
                <IconButton
                  className="ml-auto"
                  icon="ph:caret-down"
                  title="Close"
                  size="md"
                  onClick={() => workbenchStore.toggleTerminal(false)}
                />
              </div>
              {Array.from({ length: terminalCount }, (_, index) => {
                const isActive = activeTerminal === index;

                return (
                  <Terminal
                    key={index}
                    className={classNames('h-full overflow-hidden', {
                      hidden: !isActive,
                    })}
                    ref={(ref) => {
                      terminalRefs.current.push(ref);
                    }}
                    onTerminalReady={(terminal) => workbenchStore.attachTerminal(terminal)}
                    onTerminalResize={(cols, rows) => workbenchStore.onTerminalResize(cols, rows)}
                    theme={theme}
                  />
                );
              })}
            </div>
          </div>
        </Panel>
      </PanelGroup>
    );
  },
);
