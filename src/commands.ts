// media-viewer.* commands — the headless projection of the file viewers. An agent
// can ask which extensions this plugin handles and which viewer would open a file,
// without mounting a view. Same source as the viewers: the catalog (mirrors the
// manifest the core routes on). Declared 1:1 with contributes.commands.
import type { PluginContext } from "./host";
import { VIEWERS, extOf, viewerForExt } from "./catalog";

const ID = "soksak-plugin-media-viewer";

export function registerCommands(ctx: PluginContext): void {
  const app = ctx.app;
  if (!app.commands) return;
  const reg = (name: string, spec: Parameters<typeof app.commands.register>[1]) =>
    ctx.subscriptions.push(app.commands!.register(name, spec));
  // message resolves the display locale (human surface {en,ko} — docs/I18N.md); non-ko falls back to en.
  const loc = () => (typeof app.locale === "function" ? app.locale() : "en");
  const msg = (en: string, ko: string) => (loc() === "ko" ? ko : en);

  reg("viewers", {
    description:
      "List the file viewers this plugin registers — each with its media kind, the file extensions the core routes to it, and priority. The headless catalog behind what the viewers render.",
    triggers: { ko: "미디어 뷰어 지원 확장자 종류 목록 조회" },
    returns: "{ viewers: [{ id, kind, extensions, priority }] }",
    message: (d) => {
      const kinds = (d.viewers ?? []).map((v: { kind: string }) => v.kind).join(", ");
      return msg(
        `${(d.viewers ?? []).length} file viewer(s): ${kinds}.`,
        `파일 뷰어 ${(d.viewers ?? []).length}종: ${kinds}.`,
      );
    },
    examples: [`sok plugin.${ID}.viewers`],
    hint: (d) =>
      d.ok && (d.viewers ?? []).length > 0
        ? [{ cmd: `plugin.${ID}.classify`, why: "특정 파일이 어느 뷰어로 열리는지 확인할 수 있습니다" }]
        : [],
    handler: () => ({ ok: true, viewers: VIEWERS }),
  });

  reg("classify", {
    description:
      "Resolve which viewer would handle a file — pass a path or a bare extension and get the matching viewer id and kind, or null when this plugin does not handle it. Mirrors the core's extension routing without opening a view.",
    triggers: { ko: "파일 확장자 뷰어 판별 라우팅 처리 여부 조회" },
    params: {
      path: { type: "string", description: "File path to classify by its extension" },
      ext: { type: "string", description: "Bare file extension (leading dot optional) when no path is available" },
    },
    returns: "{ ext, handled, viewer: { id, kind } | null }",
    message: (d) =>
      d.handled
        ? msg(`.${d.ext} opens in the ${d.viewer.kind} viewer.`, `.${d.ext} 파일은 ${d.viewer.kind} 뷰어로 열립니다.`)
        : msg(`No media viewer handles .${d.ext}.`, `.${d.ext} 파일을 처리하는 미디어 뷰어가 없습니다.`),
    examples: [
      `sok plugin.${ID}.classify '{"path":"/Users/me/pic.png"}'`,
      `sok plugin.${ID}.classify '{"ext":"mp4"}'`,
    ],
    handler: (p) => {
      const raw =
        typeof p.path === "string" && p.path
          ? p.path
          : typeof p.ext === "string"
            ? p.ext
            : "";
      if (!raw) return { ok: false, code: "BAD_PARAMS", message: "path or ext required" };
      const ext = extOf(raw);
      const v = viewerForExt(ext);
      return { ok: true, ext, handled: !!v, viewer: v ? { id: v.id, kind: v.kind } : null };
    },
  });
}
