import type { WebContainer } from '@webcontainer/api';
import { atom } from 'nanostores';

export interface PreviewInfo {
  port: number;
  ready: boolean;
  baseUrl: string;
}

export class PreviewsStore {
  #availablePreviews = new Map<number, PreviewInfo>();
  #webcontainer: Promise<WebContainer>;

  previews = atom<PreviewInfo[]>([]);

  constructor(webcontainerPromise: Promise<WebContainer>) {
    this.#webcontainer = webcontainerPromise;

    this.#init();
  }

  async #init() {
    const webcontainer = await this.#webcontainer;

    if (!webcontainer) {
      console.error('[PreviewsStore] WebContainer is undefined!');
      return;
    }

    webcontainer.on('port', (port, type, url) => {
      console.log('[PreviewsStore] Port event:', { port, type, url });
      let previewInfo = this.#availablePreviews.get(port);

      if (type === 'close' && previewInfo) {
        console.log('[PreviewsStore] Closing preview on port:', port);
        this.#availablePreviews.delete(port);
        this.previews.set(
          this.previews.get().filter((preview) => preview.port !== port)
        );

        return;
      }

      const previews = this.previews.get();

      if (!previewInfo) {
        console.log('[PreviewsStore] Creating new preview for port:', port);
        previewInfo = { port, ready: type === 'open', baseUrl: url };
        this.#availablePreviews.set(port, previewInfo);
        previews.push(previewInfo);
      }

      previewInfo.ready = type === 'open';
      previewInfo.baseUrl = url;

      console.log('[PreviewsStore] Updated previews:', previews);
      this.previews.set([...previews]);
    });
  }
}
