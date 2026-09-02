// Local-only tests: fake Supabase, actual Express/Multer/JWT middleware. No .env or database access.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const express = require("express");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("node:crypto");
const root = path.resolve(__dirname, "..");
function load(file, overrides = {}, env = process.env) {
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, file), "utf8"), {
    module, exports: module.exports, Buffer, console,
    process: { env }, require: (name) => name in overrides ? overrides[name] : require(name),
  }, { filename: file });
  return module.exports;
}

function setup() {
  const state = { rows: [], removed: [], uploads: [], failDb: false, failUpload: false, failRemove: false };
  const supabase = {
    from() {
      let action = "select", payload, filter;
      const query = {
        select() { return this; }, order() { return this; }, limit() { return this; },
        eq(key, value) { filter = [key, value]; return this; },
        insert(value) { action = "insert"; payload = value; return this; },
        delete() { action = "delete"; return this; },
        async result(single = false) {
          if (state.failDb) return { error: new Error("database unavailable") };
          let data = state.rows.filter((row) => !filter || row[filter[0]] === filter[1]);
          if (action === "insert") { data = [{ id: randomUUID(), ...payload }]; state.rows.push(...data); }
          if (action === "delete") state.rows = state.rows.filter((row) => !data.includes(row));
          return { data: single ? data[0] || null : data };
        },
        single() { return this.result(true); }, maybeSingle() { return this.result(true); },
        then(resolve, reject) { return this.result().then(resolve, reject); },
      };
      return query;
    },
    storage: { from() { return {
      async upload(name) { state.uploads.push(name); return state.failUpload ? { error: new Error("upload unavailable") } : {}; },
      getPublicUrl(name) { return { data: { publicUrl: `https://test.invalid/storage/v1/object/public/cms-profil/${name}` } }; },
      async remove(names) { state.removed.push(...names); return state.failRemove ? { error: new Error("remove unavailable") } : {}; },
    }; } },
  };
  const controller = load("src/controllers/pengumumanController.js", { "../config/supabase": supabase });
  const auth = load("src/middleware/authMiddleware.js", {
    "../services/adminSessionService": { validateSession: async (payload) => {
      if (payload.sid !== "valid-session") { const e = new Error("revoked"); e.status = 401; throw e; }
      return {};
    } },
  }, { JWT_SECRET: "test-only-not-production" });
  const uploadSecurity = load("src/middleware/uploadSecurityMiddleware.js");
  const router = load("src/routes/cmsprofilRoutes.js", {
    "../controllers/pengumumanController": controller,
    "../controllers/cmsprofilController": Object.fromEntries(["getCmsProfil", "createCmsProfil", "updateCmsProfil", "deleteCmsProfil"].map((key) => [key, (req, res) => res.status(418).end()])),
    "../middleware/authMiddleware": auth,
    "../middleware/uploadSecurityMiddleware": uploadSecurity,
  });
  const app = express(); app.use("/api/cmsprofil", router);
  return { state, controller, app };
}

test("Announcement endpoints, real HTTP and authorization", async (t) => {
  const { state, controller, app } = setup();
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => { server.closeAllConnections(); server.close(); });
  const base = `http://127.0.0.1:${server.address().port}/api/cmsprofil/pengumuman`;
  const token = (role, sid = "valid-session") => jwt.sign({ role, sid }, "test-only-not-production", { expiresIn: "1h" });
  const upload = (auth = token("admin"), title = "Pengumuman", bytes = Buffer.from([137,80,78,71,13,10,26,10]), type = "image/png") => {
    const body = new FormData(); body.append("judul", title); body.append("gambar", new Blob([bytes], { type }), "gambar.png");
    return fetch(base, { method: "POST", headers: auth ? { Authorization: `Bearer ${auth}` } : {}, body });
  };
  await t.test("public empty list succeeds with no-store", async () => {
    const res = await fetch(base); assert.equal(res.status, 200); assert.match(res.headers.get("cache-control"), /no-store/); assert.deepEqual((await res.json()).data, []);
  });
  await t.test("guest and warga cannot create or delete", async () => {
    assert.equal((await upload(null)).status, 401);
    assert.equal((await upload(token("warga"))).status, 403);
    assert.equal((await fetch(`${base}/${randomUUID()}`, { method: "DELETE" })).status, 401);
    assert.equal((await fetch(`${base}/${randomUUID()}`, { method: "DELETE", headers: { Authorization: `Bearer ${token("warga")}` } })).status, 403);
    assert.equal(state.uploads.length, 0);
  });
  await t.test("revoked/invalid admin tokens rejected", async () => {
    assert.equal((await upload(token("admin", "revoked"))).status, 401);
    assert.equal((await upload("forged")).status, 401);
  });
  await t.test("blank title, mismatched signature, and oversized file rejected", async () => {
    assert.equal((await upload(token("admin"), " ")).status, 400);
    assert.equal((await upload(token("admin"), "test", Buffer.from("fake image"))).status, 400);
    assert.equal((await upload(token("admin"), "test", Buffer.alloc(2 * 1024 * 1024 + 1))).status, 400);
    assert.equal(state.uploads.length, 0);
  });
  await t.test("admin uploads multiple independent records", async () => {
    assert.equal((await upload()).status, 201); assert.equal((await upload()).status, 201);
    assert.equal(state.rows.length, 2); assert.notEqual(state.rows[0].storage_path, state.rows[1].storage_path);
    assert.match(state.rows[0].storage_path, /^pengumuman\/.+\.png$/);
  });
  await t.test("failed insert cleans newly uploaded object", async () => {
    state.failDb = true; const res = await upload(); state.failDb = false;
    assert.equal(res.status, 503); assert.ok(state.removed.includes(state.uploads.at(-1))); assert.equal(state.rows.length, 2);
  });
  await t.test("database failures are generic 503 and cleanup keeps referenced files", async () => {
    state.failDb = true; const res = await fetch(base);
    assert.equal(res.status, 503); assert.ok(!JSON.stringify(await res.json()).includes("database unavailable"));
    assert.equal(await controller.isReferencedAnnouncementImage("https://test.invalid/image.png"), true);
    state.failDb = false;
    assert.equal(await controller.isReferencedAnnouncementImage(state.rows[0].gambar_url), true);
    assert.equal(await controller.isReferencedAnnouncementImage("https://test.invalid/unused.png"), false);
  });
  await t.test("admin delete removes only announcement-owned storage files", async () => {
    const row = state.rows[0];
    const res = await fetch(`${base}/${row.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token("admin")}` } });
    assert.equal(res.status, 200); assert.ok(state.removed.includes(row.storage_path)); assert.equal(state.rows.length, 1);
    assert.equal((await fetch(`${base}/${row.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token("admin")}` } })).status, 404);
  });
  await t.test("legacy/shared storage is preserved on delete", async () => {
    const id = randomUUID(); state.rows.push({ id, storage_path: null }); const before = state.removed.length;
    assert.equal((await fetch(`${base}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token("admin")}` } })).status, 200);
    assert.equal(state.removed.length, before);
  });
  await t.test("storage cleanup error does not falsely report whole delete failed", async () => {
    state.failRemove = true;
    const res = await fetch(`${base}/${state.rows[0].id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token("admin")}` } });
    assert.equal(res.status, 200); assert.ok((await res.json()).warning); assert.equal(state.rows.length, 0);
  });
});
