// soksak media-viewer 플러그인 엔트리 — loader 가 blob-URL 로 import 하는 단일 ESM(esbuild 번들).
// image/pdf/video/audio 파일 뷰어를 app.ui.registerFileViewer 로 등록 → 코어가 확장자 매칭해 마운트.
// 렌더는 native HTML(img/embed/video/audio) — 읽기 전용. 코드/텍스트는 에디터 플러그인 몫.
import { createRoot, type Root } from "react-dom/client";
import { MediaViewer } from "./media";
import { VIEWERS } from "./catalog";
import { registerCommands } from "./commands";
import { GLOBAL_CSS } from "./styles";
import type { FileViewerContext, PluginContext } from "./host";

const STYLE_ID = "sk-media-viewer-style";

function ensureStyle(): void {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = GLOBAL_CSS;
  document.head.appendChild(s);
}

const roots = new WeakMap<HTMLElement, Root>();

function unmountContainer(container: HTMLElement): void {
  const root = roots.get(container);
  if (root) {
    root.unmount();
    roots.delete(container);
  }
  container.replaceChildren();
}

export default {
  activate(ctx: PluginContext) {
    const app = ctx.app;

    // Headless surface first — command registration touches no DOM.
    registerCommands(ctx);

    if (app.ui?.registerFileViewer) {
      for (const { id, kind } of VIEWERS) {
        ctx.subscriptions.push(
          app.ui.registerFileViewer(id, {
            mount(container: HTMLElement, fctx: FileViewerContext) {
              ensureStyle();
              unmountContainer(container);
              container.style.position = "relative";
              const host = document.createElement("div");
              host.style.position = "absolute";
              host.style.inset = "0";
              container.appendChild(host);
              const root = createRoot(host);
              root.render(<MediaViewer app={app} ctx={fctx} kind={kind} />);
              roots.set(container, root);
            },
            unmount(container: HTMLElement) {
              unmountContainer(container);
            },
          }),
        );
      }
    }
  },
  deactivate() {
    document.getElementById(STYLE_ID)?.remove();
  },
};
