// media-viewer i18n — 사람 UI 텍스트. 호스트 표시 언어로 해소.
type Dict = Record<string, string>;

const EN: Dict = {
  loading: "Loading…",
  imgFail: "Failed to load image",
  binFail: "Failed to load file",
};

const KO: Dict = {
  loading: "불러오는 중…",
  imgFail: "이미지를 불러오지 못했습니다",
  binFail: "파일을 불러오지 못했습니다",
};

export function t(key: string, lang: string): string {
  const dict = lang === "ko" ? KO : EN;
  return dict[key] ?? EN[key] ?? key;
}
