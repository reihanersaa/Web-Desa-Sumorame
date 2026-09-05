const assert = require("node:assert/strict");
const test = require("node:test");
const express = require("express");
const sharp = require("sharp");
const { createUploadRouter } = require("../src/routes/upload");

function createFakeSupabase({ failUpload = false } = {}) {
  const state = { uploads: [] };
  const bucketApi = {
    async upload(storagePath, buffer, options) {
      state.uploads.push({ storagePath, buffer, options });
      return failUpload
        ? { error: new Error("storage unavailable") }
        : { data: { path: storagePath }, error: null };
    },
    getPublicUrl(storagePath) {
      return {
        data: { publicUrl: `https://example.supabase.co/storage/v1/object/public/images/${storagePath}` },
      };
    },
  };

  return {
    state,
    client: { storage: { from: () => bucketApi } },
  };
}

function createTestApp(supabaseClient) {
  const app = express();
  app.use("/api/upload", createUploadRouter(supabaseClient));
  return app;
}

async function withServer(supabaseClient, run) {
  const app = createTestApp(supabaseClient);
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();

  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
}

test("POST /api/upload mengompresi gambar menjadi WebP", async () => {
  const supabase = createFakeSupabase();
  await withServer(supabase.client, async (baseUrl) => {
    const source = await sharp({
      create: { width: 2400, height: 1200, channels: 3, background: "#006633" },
    })
      .jpeg({ quality: 95 })
      .toBuffer();
    const form = new FormData();
    form.append("image", new Blob([source], { type: "image/jpeg" }), "desa.jpg");

    const response = await fetch(`${baseUrl}/api/upload`, { method: "POST", body: form });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.success, true);
    assert.match(body.data.path, /^uploads\/[0-9a-f-]+\.webp$/);
    assert.match(body.data.url, /^https:\/\/example\.supabase\.co\//);
    assert.equal(body.data.bucket, "images");
    assert.equal(body.data.width, 1920);
    assert.equal(body.data.height, 960);
    assert.equal(supabase.state.uploads.length, 1);
    assert.equal(supabase.state.uploads[0].options.contentType, "image/webp");
    assert.ok(supabase.state.uploads[0].buffer.length > 0);
  });
});

test("POST /api/upload menolak tipe file yang tidak didukung", async () => {
  const supabase = createFakeSupabase();
  await withServer(supabase.client, async (baseUrl) => {
    const form = new FormData();
    form.append("image", new Blob(["bukan gambar"], { type: "text/plain" }), "data.txt");

    const response = await fetch(`${baseUrl}/api/upload`, { method: "POST", body: form });
    const body = await response.json();

    assert.equal(response.status, 415);
    assert.equal(body.code, "UNSUPPORTED_IMAGE_TYPE");
  });
});

test("POST /api/upload menolak gambar korup", async () => {
  const supabase = createFakeSupabase();
  await withServer(supabase.client, async (baseUrl) => {
    const form = new FormData();
    form.append("image", new Blob(["konten palsu"], { type: "image/png" }), "rusak.png");

    const response = await fetch(`${baseUrl}/api/upload`, { method: "POST", body: form });
    const body = await response.json();

    assert.equal(response.status, 422);
    assert.equal(body.code, "IMAGE_PROCESSING_FAILED");
  });
});

test("POST /api/upload mengembalikan 503 saat Supabase gagal", async () => {
  const supabase = createFakeSupabase({ failUpload: true });
  await withServer(supabase.client, async (baseUrl) => {
    const source = await sharp({
      create: { width: 100, height: 100, channels: 3, background: "#006633" },
    })
      .png()
      .toBuffer();
    const form = new FormData();
    form.append("image", new Blob([source], { type: "image/png" }), "desa.png");

    const response = await fetch(`${baseUrl}/api/upload`, { method: "POST", body: form });
    const body = await response.json();

    assert.equal(response.status, 503);
    assert.equal(body.code, "IMAGE_STORAGE_FAILED");
  });
});
