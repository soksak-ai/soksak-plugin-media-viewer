// Viewer catalog — the single source of truth for the file viewers this plugin
// registers. plugin-entry registers viewers from it; the commands report from it.
// It must mirror plugin.json contributes.fileViewers; test/commands.test.mjs asserts
// the viewers command output equals the manifest (id, extensions, priority).

export type MediaKind = "image" | "pdf" | "video" | "audio";

export interface ViewerEntry {
  id: string;
  kind: MediaKind;
  extensions: string[];
  priority: number;
}

export const VIEWERS: ViewerEntry[] = [
  {
    id: "image",
    kind: "image",
    extensions: ["png", "jpg", "jpeg", "gif", "webp", "bmp", "ico", "avif", "apng"],
    priority: 10,
  },
  { id: "pdf", kind: "pdf", extensions: ["pdf"], priority: 10 },
  { id: "video", kind: "video", extensions: ["mp4", "webm", "mov", "m4v", "ogv", "mkv"], priority: 10 },
  { id: "audio", kind: "audio", extensions: ["mp3", "wav", "ogg", "flac", "m4a", "aac"], priority: 10 },
];

// Pure: normalize a path or a bare extension to a lowercase extension token (no dot).
export function extOf(input: string): string {
  const s = String(input).trim().toLowerCase();
  const base = s.split(/[?#]/)[0];
  const dot = base.lastIndexOf(".");
  const ext = dot >= 0 ? base.slice(dot + 1) : base;
  return ext.replace(/^\.+/, "");
}

// Pure: the viewer that handles this extension, or null when none does.
export function viewerForExt(ext: string): ViewerEntry | null {
  const e = ext.toLowerCase();
  return VIEWERS.find((v) => v.extensions.includes(e)) ?? null;
}
