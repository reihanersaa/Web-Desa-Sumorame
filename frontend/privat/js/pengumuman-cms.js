(() => {
  "use strict";
  const root = document.getElementById("announcementEditor");
  if (!root) return;
  const get = (id) => document.getElementById(id);
  const list = get("announcementAdminList");
  const title = get("announcementAdminTitle");
  const files = get("announcementAdminFiles");
  const status = get("announcementAdminStatus");
  const add = get("announcementAdminAdd");
  const reload = get("announcementAdminReload");
  const endpoint = `${window.API_BASE_URL}/cmsprofil/pengumuman`;
  let busy = false;
  const token = () => window.AdminSession?.get()?.token || localStorage.getItem("token");
  function lock(value) {
    busy = value;
    root.querySelectorAll("button, input").forEach((element) => { element.disabled = value; });
    root.setAttribute("aria-busy", String(value));
  }
  async function request(url, options = {}) {
    // Never replay writes automatically: avoid duplicated announcements after a timeout.
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || "Pengumuman gagal diproses.");
    return data;
  }
  async function load() {
    const result = await request(endpoint);
    if (!Array.isArray(result.data)) throw new Error("Daftar pengumuman tidak valid.");
    list.replaceChildren();
    result.data.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "border rounded-xl p-3 bg-white flex flex-col gap-3";
      const image = document.createElement("img");
      image.className = "w-full h-40 object-contain rounded-lg bg-gray-50";
      image.alt = item.judul || "Pengumuman";
      image.loading = "lazy";
      if (/^https?:\/\//i.test(item.gambar_url || "")) image.src = item.gambar_url;
      image.addEventListener("error", () => {
        const label = document.createElement("p");
        label.textContent = "Gambar tidak dapat dimuat.";
        image.replaceWith(label);
      }, { once: true });
      const heading = document.createElement("p");
      heading.className = "text-sm font-semibold break-words";
      heading.textContent = `${index + 1}. ${item.judul}`;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "text-sm text-red-700 border border-red-200 rounded-lg p-2 mt-auto";
      remove.textContent = "Hapus Pengumuman";
      remove.addEventListener("click", async () => {
        if (busy || !window.confirm(`Hapus pengumuman “${item.judul}” dari popup beranda?`)) return;
        lock(true);
        try {
          const result = await request(`${endpoint}/${encodeURIComponent(item.id)}`, { method: "DELETE", headers: { Authorization: `Bearer ${token() || ""}` } });
          await load();
          status.textContent = result.warning || "Pengumuman berhasil dihapus.";
        } catch (error) { status.textContent = `${error.message} Klik Muat Ulang Daftar untuk memeriksa hasil terbaru.`; }
        finally { lock(false); }
      });
      card.append(image, heading, remove);
      list.appendChild(card);
    });
    if (!result.data.length) list.textContent = "Belum ada pengumuman. Popup tidak akan tampil sampai gambar ditambahkan.";
  }
  add.addEventListener("click", async () => {
    if (busy) return;
    const selected = Array.from(files.files);
    const heading = title.value.trim();
    if (!heading || !selected.length) { status.textContent = "Isi judul dan pilih minimal satu gambar."; return; }
    if (selected.some((file) => file.size > 2 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type))) {
      status.textContent = "Setiap gambar harus JPG, PNG, atau WEBP dan maksimal 2 MB."; return;
    }
    if (!token()) { status.textContent = "Sesi admin tidak tersedia. Silakan login kembali."; return; }
    lock(true);
    let saved = 0;
    try {
      for (const file of selected) {
        status.textContent = `Mengunggah gambar ${saved + 1} dari ${selected.length}…`;
        const body = new FormData();
        body.append("judul", selected.length > 1 ? `${heading} (${saved + 1})` : heading);
        body.append("gambar", file);
        await request(endpoint, { method: "POST", headers: { Authorization: `Bearer ${token() || ""}` }, body });
        saved++;
      }
      status.textContent = `${saved} pengumuman berhasil ditambahkan.`;
    } catch (error) {
      status.textContent = `${saved} pengumuman terkonfirmasi tersimpan. ${error.message} Periksa daftar sebelum memilih ulang gambar yang belum tersimpan.`;
    } finally {
      files.value = "";
      try { await load(); } catch (_) { status.textContent += " Daftar gagal dimuat; klik Muat Ulang Daftar sebelum mengunggah lagi."; }
      lock(false);
    }
  });
  async function refresh() {
    if (busy) return;
    lock(true); status.textContent = "Memuat pengumuman…";
    try { await load(); status.textContent = "Daftar pengumuman terbaru sudah dimuat."; }
    catch (error) { status.textContent = error.message; }
    finally { lock(false); }
  }
  reload.addEventListener("click", refresh);
  // This editor sits inside the existing profile form, but saves independently.
  root.addEventListener("keydown", (event) => { if (event.key === "Enter" && event.target === title) event.preventDefault(); });
  refresh();
})();
