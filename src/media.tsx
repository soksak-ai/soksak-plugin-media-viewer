// 미디어 뷰어 — 이미지/PDF/영상/오디오. 코어 표준 app.fs.url 로 webview 로드 URL(blob) 렌더(읽기 전용 —
// dirty 없음). data URL 인라인이 아니라 blob URL 이라 영상/오디오 seek 가능 + 같은 path 멱등.
// 코드/텍스트는 에디터 플러그인 몫(이 플러그인은 정확 확장자로 미디어만 가져간다).
import { useEffect, useState } from "react";
import { t as translate } from "./i18n";
import type { FileViewerContext, PluginApi } from "./host";
import type { MediaKind } from "./catalog";

export type { MediaKind };

export function MediaViewer({
  app,
  ctx,
  kind,
}: {
  app: PluginApi;
  ctx: FileViewerContext;
  kind: MediaKind;
}) {
  const lang = app.locale();
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setUrl(null);
    setError(null);
    const toUrl = app.fs?.url;
    if (!toUrl) {
      setError("fs:read 권한 없음");
      return;
    }
    toUrl(ctx.path)
      .then((u) => {
        if (!cancelled) setUrl(u);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [app, ctx.path]);

  if (error) {
    return (
      <div className="sk-mv">
        <span className="sk-mv-msg">
          {translate(kind === "image" ? "imgFail" : "binFail", lang)} — {error}
        </span>
      </div>
    );
  }
  if (!url) {
    return (
      <div className="sk-mv">
        <span className="sk-mv-msg">{translate("loading", lang)}</span>
      </div>
    );
  }
  if (kind === "image") {
    return (
      <div className="sk-mv">
        <img className="sk-mv-img" src={url} alt="" />
      </div>
    );
  }
  if (kind === "pdf") {
    return (
      <div className="sk-mv">
        <embed className="sk-mv-embed" src={url} type="application/pdf" />
      </div>
    );
  }
  if (kind === "video") {
    return (
      <div className="sk-mv">
        <video className="sk-mv-video" src={url} controls />
      </div>
    );
  }
  return (
    <div className="sk-mv">
      <audio src={url} controls />
    </div>
  );
}
