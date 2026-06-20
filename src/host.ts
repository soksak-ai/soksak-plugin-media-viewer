// 코어 플러그인 API 중 media-viewer 가 쓰는 표면만 선언(별도 repo — 코어 소스 비의존, A7).
// soksak-plugin-spec v1 의 app.* 와 동형. 미선언 권한 표면은 런타임에 undefined.

export interface Disposable {
  dispose(): void;
}

// 코어 fileViewerRegistry.FileViewerContext 와 동형 — 코어가 넘기는 유일한 채널(계약 A2).
export interface FileViewerContext {
  viewId: string;
  path: string;
  projectId: string;
  root: string | null;
  setDirty: (dirty: boolean) => void;
}

export interface FileViewerProvider {
  mount(container: HTMLElement, ctx: FileViewerContext): void;
  unmount?(container: HTMLElement): void;
}

export interface PluginApi {
  pluginId: string;
  locale: () => string;
  events: {
    on: (event: string, fn: (payload: unknown) => void) => Disposable;
  };
  ui?: {
    registerFileViewer: (
      viewerId: string,
      provider: FileViewerProvider,
    ) => Disposable;
  };
  fs?: {
    readBinary?: (path: string) => Promise<{ mime: string; base64: string }>;
  };
}

export interface PluginContext {
  app: PluginApi;
  manifest: unknown;
  dir: string;
  subscriptions: Disposable[];
}
