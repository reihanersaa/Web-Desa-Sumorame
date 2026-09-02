// DOM/timer simulation, not a visual browser test. No network or production data.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");
const frontend = path.resolve(__dirname, "../../frontend");

class Element {
  constructor(id = "") { this.id = id; this.events = {}; this.hidden = false; this.open = false; this.attributes = {}; this.children = []; this.style = {}; this.isConnected = true; this.value = ""; }
  addEventListener(type, fn) { (this.events[type] ||= []).push(fn); }
  async emit(type, event = {}) { for (const fn of this.events[type] || []) await fn({ target: this, preventDefault() {}, ...event }); }
  setAttribute(name, value) { this.attributes[name] = value; }
  showModal() { this.open = true; }
  close() { this.open = false; this.emit("close"); }
  focus() { this.focused = true; }
  getBoundingClientRect() { return { left: 100, right: 700, top: 50, bottom: 650 }; }
  replaceChildren(...children) { this.children = children; }
  append(...children) { this.children.push(...children); }
  appendChild(child) { this.children.push(child); }
  replaceWith(child) { this.replaced = child; }
  set src(value) { this.source = value; queueMicrotask(() => this.emit("load")); }
  get src() { return this.source; }
}
function environment(script, fetch, reduced = false) {
  const source = fs.readFileSync(path.join(frontend, script), "utf8");
  const ids = [...source.matchAll(/(?:get|document.getElementById)\("([^"]+)"\)/g)].map((match) => match[1]);
  const elements = Object.fromEntries(ids.map((id) => [id, new Element(id)]));
  const doc = new Element(); doc.body = new Element(); doc.body.style.overflow = "auto"; doc.activeElement = new Element(); doc.hidden = false;
  doc.getElementById = (id) => elements[id]; doc.createElement = () => new Element();
  if (elements.announcementEditor) elements.announcementEditor.querySelectorAll = () => Object.values(elements).concat(elements.announcementAdminList.children.flatMap((card) => card.children));
  const win = new Element(); win.API_BASE_URL = "https://api.example.test/api";
  const motion = new Element(); motion.matches = reduced; win.matchMedia = () => motion;
  win.confirm = () => true;
  const timers = new Map(); let now = 0, serial = 0;
  win.setTimeout = (fn, ms) => { timers.set(++serial, { fn, due: now + ms }); return serial; };
  win.clearTimeout = (id) => timers.delete(id);
  win.AdminSession = { get: () => ({ token: "latest-token" }) };
  vm.runInNewContext(source, { window: win, document: doc, URL, AbortController, FormData, console: { warn() {} }, fetch,
    localStorage: { getItem: () => "legacy-token" } }, { filename: script });
  async function flush() { await new Promise((resolve) => setImmediate(resolve)); }
  async function advance(ms) {
    const until = now + ms;
    while (true) {
      const next = [...timers].filter(([, t]) => t.due <= until).sort((a, b) => a[1].due - b[1].due)[0];
      if (!next) break;
      timers.delete(next[0]); now = next[1].due; next[1].fn(); await flush();
    }
    now = until; await flush();
  }
  return { elements, doc, win, motion, timers, advance, flush };
}
const rows = [1, 2, 3].map((id) => ({ id, judul: `Pengumuman ${id}`, gambar_url: `https://images.example.test/${id}.png` }));
async function popup(data = rows, options = {}) {
  const env = environment("publik/js/pengumuman-slider.js", async () => ({ ok: !options.fail, json: async () => ({ success: true, data }) }), options.reduced);
  await env.flush(); await env.advance(800); return env;
}
test("Public popup: empty/failed response stays closed; one image has no carousel", async () => {
  for (const env of [await popup([]), await popup(rows, { fail: true }), await popup([{ gambar_url: "javascript:alert(1)" }])]) {
    assert.equal(env.elements.announcementDialog.open, false); assert.equal(env.timers.size, 0);
  }
  const env = await popup([rows[0]]); assert.equal(env.elements.announcementDialog.open, true); assert.equal(env.elements.announcementControls.hidden, true);
  await env.advance(18000); assert.equal(env.elements.announcementCounter.textContent, "1 / 1");
});
test("Public popup: 6-second automatic rotation, wrap, previous and next", async () => {
  const env = await popup(); const el = env.elements;
  assert.equal(el.announcementImage.src, rows[0].gambar_url);
  await env.advance(5999); assert.equal(el.announcementCounter.textContent, "1 / 3");
  await env.advance(1); assert.equal(el.announcementCounter.textContent, "2 / 3");
  await env.advance(12000); assert.equal(el.announcementCounter.textContent, "1 / 3");
  await el.announcementPrev.emit("click"); assert.equal(el.announcementCounter.textContent, "3 / 3");
  await el.announcementNext.emit("click"); assert.equal(el.announcementCounter.textContent, "1 / 3");
});
test("Public popup: pause/resume, reduced motion and hidden tab stop timers", async () => {
  const env = await popup(); const el = env.elements;
  await el.announcementPause.emit("click"); await env.advance(18000); assert.equal(el.announcementCounter.textContent, "1 / 3");
  await el.announcementPause.emit("click"); await env.advance(6000); assert.equal(el.announcementCounter.textContent, "2 / 3");
  env.doc.hidden = true; await env.doc.emit("visibilitychange"); await env.advance(60000); assert.equal(el.announcementCounter.textContent, "2 / 3");
  env.doc.hidden = false; await env.doc.emit("visibilitychange"); await env.advance(6000); assert.equal(el.announcementCounter.textContent, "3 / 3");
  const reduced = await popup(rows, { reduced: true }); await reduced.advance(12000);
  assert.equal(reduced.elements.announcementCounter.textContent, "1 / 3"); assert.equal(reduced.elements.announcementPause.textContent, "Putar otomatis");
});
test("Public popup: mouse hover pauses and leaving resumes", async () => {
  const env = await popup(); const el = env.elements;
  await el.announcementDialog.emit("pointerenter", { pointerType: "mouse" }); await env.advance(12000);
  assert.equal(el.announcementCounter.textContent, "1 / 3");
  await el.announcementDialog.emit("pointerleave", { pointerType: "mouse" }); await env.advance(6000);
  assert.equal(el.announcementCounter.textContent, "2 / 3");
});
test("Public popup: close cancels timer, restores scroll/focus; backdrop works", async () => {
  const env = await popup(); const el = env.elements;
  assert.equal(env.doc.body.style.overflow, "hidden");
  await el.announcementClose.emit("click"); await env.advance(60000);
  assert.equal(el.announcementDialog.open, false); assert.equal(env.doc.body.style.overflow, "auto"); assert.ok(env.doc.activeElement.focused); assert.equal(env.timers.size, 0);
  const backdrop = await popup(); await backdrop.elements.announcementDialog.emit("click", { clientX: 0, clientY: 0 }); assert.equal(backdrop.elements.announcementDialog.open, false);
});
test("Public popup: URL validation/deduplication and failed image fallback", async () => {
  const env = await popup([...rows, rows[0], { gambar_url: "" }, { gambar_url: "https://secret:pass@example.test/x" }, { gambar_url: "data:image/png;base64,abc" }]);
  assert.equal(env.elements.announcementCounter.textContent, "1 / 3");
  await env.elements.announcementImage.emit("error"); assert.equal(env.elements.announcementImageError.hidden, false);
  await env.elements.announcementNext.emit("click"); assert.equal(env.elements.announcementImageError.hidden, true); assert.equal(env.elements.announcementImage.hidden, false);
});
test("Public popup: keyboard and touch navigation; titles use text not HTML", async () => {
  const env = await popup([{ ...rows[0], judul: '<img src=x onerror="alert(1)">' }, ...rows.slice(1)]);
  const el = env.elements; assert.equal(el.announcementTitle.textContent, '<img src=x onerror="alert(1)">');
  await el.announcementDialog.emit("keydown", { key: "ArrowRight" }); await env.advance(18000);
  assert.equal(el.announcementCounter.textContent, "2 / 3");
  await el.announcementStage.emit("touchstart", { touches: [{ clientX: 200, clientY: 80 }] });
  await el.announcementStage.emit("touchend", { changedTouches: [{ clientX: 100, clientY: 85 }] });
  assert.equal(el.announcementCounter.textContent, "3 / 3");
});
test("CMS: multiple files upload sequentially with latest token, explicit delete", async () => {
  const stored = [], calls = [];
  const env = environment("privat/js/pengumuman-cms.js", async (url, options = {}) => {
    calls.push({ url, ...options });
    if (options.method === "POST") stored.push({ id: String(stored.length + 1), judul: options.body.get("judul"), gambar_url: "https://test.invalid/x.png" });
    if (options.method === "DELETE") stored.shift();
    return { ok: true, json: async () => ({ success: true, data: stored }) };
  });
  await env.flush(); const el = env.elements;
  el.announcementAdminTitle.value = "Info desa";
  el.announcementAdminFiles.files = [new File(["image"], "a.png", { type: "image/png" }), new File(["image"], "b.png", { type: "image/png" })];
  await el.announcementAdminAdd.emit("click");
  assert.equal(stored.length, 2); assert.equal(stored[0].judul, "Info desa (1)"); assert.equal(stored[1].judul, "Info desa (2)");
  assert.ok(calls.filter((c) => c.method === "POST").every((c) => c.headers.Authorization === "Bearer latest-token"));
  assert.match(el.announcementAdminStatus.textContent, /2 pengumuman berhasil/);
  const deleteButton = el.announcementAdminList.children[0].children[2]; await deleteButton.emit("click");
  assert.equal(stored.length, 1); assert.equal(calls.filter((c) => c.method === "DELETE").length, 1);
});
test("CMS: failed partial upload is not replayed, preserves successful records", async () => {
  let attempts = 0;
  const env = environment("privat/js/pengumuman-cms.js", async (_, options = {}) => {
    if (options.method === "POST" && ++attempts === 2) throw new Error("offline");
    return { ok: true, json: async () => ({ success: true, data: [] }) };
  });
  await env.flush(); const el = env.elements; el.announcementAdminTitle.value = "Info";
  el.announcementAdminFiles.files = [1,2,3].map((i) => new File(["image"], `${i}.png`, { type: "image/png" }));
  await el.announcementAdminAdd.emit("click");
  assert.equal(attempts, 2); assert.match(el.announcementAdminStatus.textContent, /1 pengumuman terkonfirmasi/); assert.equal(el.announcementAdminAdd.disabled, false);
});
test("HTML wiring: all required IDs exist, no old CTA and no nested form", () => {
  for (const [script, html] of [["publik/js/pengumuman-slider.js", "publik/index.html"], ["privat/js/pengumuman-cms.js", "privat/CMSProfil.html"]]) {
    const source = fs.readFileSync(path.join(frontend, script), "utf8"); const page = fs.readFileSync(path.join(frontend, html), "utf8");
    for (const match of source.matchAll(/(?:get|document.getElementById)\("([^"]+)"\)/g)) assert.ok(page.includes(`id="${match[1]}"`), match[1]);
    assert.ok(page.includes(path.basename(script))); assert.ok(!page.includes('id="inputGambarModal"'));
  }
  const html = fs.readFileSync(path.join(frontend, "publik/index.html"), "utf8");
  assert.ok(!html.includes("LIHAT PENGUMUMAN")); assert.ok(html.includes('<dialog id="announcementDialog"'));
});
