# soksak-plugin-media-viewer

Media file viewers for soksak: image, PDF, video, and audio. Registers as soksak file
viewers, so the core routes a media file to the matching viewer by extension (engine
neutrality, contract A13). Code and text files are handled by the editor plugin.

## What it provides

File viewers (`fileViewers`) for:
- image — png/jpg/jpeg/gif/webp/bmp/ico/avif/apng
- pdf
- video — mp4/webm/mov/m4v/ogv/mkv
- audio — mp3/wav/ogg/flac/m4a/aac

Each renders read-only via native HTML (`<img>`/`<embed>`/`<video>`/`<audio>`) from
`app.fs.readBinary`. Theme follows the host via CSS variables.

## Permissions

`ui`, `fs:read`

## Build

```
npm install
npm run build   # → main.js
```
