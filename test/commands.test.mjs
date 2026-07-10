// Command-surface conformance test — the headless gate for C2 transparency
// (a plugin with features exposes commands). Runs under node --test alone
// (no app, socket, or DOM). Four axes:
//   ① The manifest declares a non-empty contributes.commands.
//   ② Declared ≡ registered, both directions (conformance) — the names activate()
//      registers equal the names the manifest declares.
//   ③ Every command spec carries description, examples, ko triggers, message, and
//      handler; examples name the fully-qualified command.
//   ④ The viewers command reports exactly the manifest's fileViewers (id, extensions,
//      priority) — the command is the headless projection of what the core routes on.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(join(here, "..", "plugin.json"), "utf8"));
const FULL = (name) => `plugin.${manifest.id}.${name}`;

// Drive activate() against a mock host — capture command and file-viewer
// registrations; stub the view mount.
async function loadPlugin(overrides = {}) {
  const commands = new Map();
  const viewers = new Map();
  const app = {
    pluginId: manifest.id,
    locale: () => overrides.locale ?? "en",
    events: { on: () => ({ dispose() {} }) },
    commands: {
      register: (name, spec) => {
        commands.set(name, spec);
        return { dispose() {} };
      },
    },
    ui: {
      registerFileViewer: (id) => {
        viewers.set(id, true);
        return { dispose() {} };
      },
    },
    fs: { url: overrides.fsUrl ?? (async (p) => `blob:${p}`) },
  };
  const mod = (await import("../main.js")).default;
  mod.activate({ app, manifest, dir: here, subscriptions: [] });
  return { commands, viewers };
}

async function specOf(name, overrides) {
  const { commands } = await loadPlugin(overrides);
  const spec = commands.get(name);
  assert.ok(spec, `command not registered: ${name}`);
  return spec;
}

test("manifest declares a command surface (C2 — zero commands = violation)", () => {
  const cmds = manifest.contributes?.commands;
  assert.ok(Array.isArray(cmds) && cmds.length > 0, "contributes.commands is empty");
  for (const c of cmds) {
    assert.ok(typeof c.name === "string" && c.name.length > 0, "command name missing");
    assert.ok(c.title?.en && c.title?.ko, `command ${c.name} title.{en,ko} missing`);
  }
});

test("declared ≡ registered, both directions (command conformance)", async () => {
  const declared = (manifest.contributes?.commands ?? []).map((c) => c.name).sort();
  const { commands } = await loadPlugin();
  const actual = [...commands.keys()].sort();
  assert.deepEqual(actual, declared);
});

test("declared ≡ registered file viewers (viewer conformance)", async () => {
  const declared = (manifest.contributes?.fileViewers ?? []).map((v) => v.id).sort();
  const { viewers } = await loadPlugin();
  const actual = [...viewers.keys()].sort();
  assert.deepEqual(actual, declared);
});

test("every command spec carries description, examples, ko triggers, message, handler", async () => {
  const { commands } = await loadPlugin();
  assert.ok(commands.size > 0, "no commands registered");
  for (const [name, spec] of commands) {
    assert.ok(typeof spec.description === "string" && spec.description.length > 0, `${name}: description missing`);
    assert.ok(Array.isArray(spec.examples) && spec.examples.length >= 1, `${name}: examples missing`);
    assert.ok(typeof spec.triggers?.ko === "string" && spec.triggers.ko.length > 0, `${name}: ko triggers missing`);
    assert.ok(typeof spec.message === "function", `${name}: message missing`);
    assert.ok(typeof spec.handler === "function", `${name}: handler missing`);
    for (const ex of spec.examples) assert.ok(ex.includes(FULL(name)), `${name}: example omits the full command name`);
  }
});

test("viewers: reports the registered file viewers with kind, extensions, priority", async () => {
  const spec = await specOf("viewers");
  const res = await spec.handler({});
  assert.equal(res.ok, true);
  assert.ok(Array.isArray(res.viewers) && res.viewers.length > 0);
  for (const v of res.viewers) {
    assert.ok(typeof v.id === "string" && v.id.length > 0);
    assert.ok(typeof v.kind === "string" && v.kind.length > 0);
    assert.ok(Array.isArray(v.extensions) && v.extensions.length > 0);
    assert.equal(typeof v.priority, "number");
  }
  assert.ok(typeof spec.message(res) === "string" && spec.message(res).length > 0);
});

test("viewers ≡ manifest fileViewers (id, extensions, priority) — same routing truth", async () => {
  const spec = await specOf("viewers");
  const res = await spec.handler({});
  const norm = (arr) =>
    arr
      .map((v) => ({ id: v.id, extensions: [...v.extensions].sort(), priority: v.priority }))
      .sort((a, b) => a.id.localeCompare(b.id));
  assert.deepEqual(norm(res.viewers), norm(manifest.contributes.fileViewers));
});

test("classify: resolves a path to its viewer kind", async () => {
  const spec = await specOf("classify");
  const res = await spec.handler({ path: "/Users/me/holiday.PNG" });
  assert.equal(res.ok, true);
  assert.equal(res.ext, "png");
  assert.equal(res.handled, true);
  assert.equal(res.viewer.kind, "image");
  assert.ok(typeof spec.message(res) === "string" && spec.message(res).length > 0);
});

test("classify: accepts a bare extension (with or without a dot)", async () => {
  const spec = await specOf("classify");
  const dot = await spec.handler({ ext: ".mp4" });
  assert.equal(dot.handled, true);
  assert.equal(dot.viewer.kind, "video");
  const bare = await spec.handler({ ext: "flac" });
  assert.equal(bare.handled, true);
  assert.equal(bare.viewer.kind, "audio");
});

test("classify: unhandled extension yields handled=false, viewer=null", async () => {
  const spec = await specOf("classify");
  const res = await spec.handler({ path: "notes.txt" });
  assert.equal(res.ok, true);
  assert.equal(res.ext, "txt");
  assert.equal(res.handled, false);
  assert.equal(res.viewer, null);
  assert.ok(typeof spec.message(res) === "string" && spec.message(res).length > 0);
});

test("classify: missing path and ext returns an ok:false envelope with code", async () => {
  const spec = await specOf("classify");
  const res = await spec.handler({});
  assert.equal(res.ok, false);
  assert.equal(res.code, "BAD_PARAMS");
  assert.ok(typeof res.message === "string" && res.message.length > 0);
});
