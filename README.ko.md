# soksak-plugin-media-viewer

soksak 미디어 파일 뷰어: 이미지·PDF·영상·오디오. soksak 파일 뷰어로 등록되어, 코어가 미디어 파일을
확장자로 매칭해 해당 뷰어로 라우팅합니다(엔진 중립, 계약 A13). 코드·텍스트 파일은 에디터 플러그인 몫.

## 제공 기능

파일 뷰어(`fileViewers`):
- image — png/jpg/jpeg/gif/webp/bmp/ico/avif/apng
- pdf
- video — mp4/webm/mov/m4v/ogv/mkv
- audio — mp3/wav/ogg/flac/m4a/aac

각각 `app.fs.readBinary`로 읽어 native HTML(`<img>`/`<embed>`/`<video>`/`<audio>`)로 읽기 전용
렌더. 테마는 호스트 CSS 변수 추종.

## 권한

`ui`, `fs:read`

## 빌드

```
npm install
npm run build   # → main.js
```
