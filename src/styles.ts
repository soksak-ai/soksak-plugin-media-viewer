// media-viewer 전역 CSS — 단일 <style> 1회 주입. .sk-mv 스코프, 호스트 CSS 변수 상속.
export const GLOBAL_CSS = `
.sk-mv {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: 16px;
  background: var(--bg, #1e1e1e);
  color: var(--fg2, #bbb);
}
.sk-mv-img { max-width: 100%; max-height: 100%; object-fit: contain; }
.sk-mv-embed, .sk-mv-video { width: 100%; height: 100%; border: 0; }
.sk-mv-msg { color: var(--fg3, #888); font-size: 13px; }
`;
