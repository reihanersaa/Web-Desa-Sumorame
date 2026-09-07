document.addEventListener("DOMContentLoaded", () => {
  const token = () => localStorage.getItem("token") || "";
  const esc = (value = "") => {
    const element = document.createElement("div");
    element.textContent = String(value ?? "");
    return element.innerHTML;
  };
  const api = async (path, options = {}) => {
    const response = await fetch(`${window.API_BASE_URL}${path}`, {
      ...options,
      headers: { Authorization: `Bearer ${token()}`, ...(options.headers || {}) },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "Permintaan belum dapat diproses.");
    return result;
  };

  const categories = ["Dapat diupayakan musyawarah/mediasi desa", "Memerlukan konsultasi hukum lebih lanjut", "Memerlukan rujukan ke FH UMAHA/LBH Maarif", "Memerlukan rujukan ke instansi/lembaga berwenang", "Memerlukan tindakan segera (potensi keselamatan/tindak pidana)", "Lain-lain"];
  const followups = ["Konsultasi awal", "Musyawarah", "Mediasi para pihak", "Penjadwalan pertemuan", "Koordinasi dengan Pemerintah Desa", "Koordinasi dengan FH UMAHA/LBH Maarif", "Rujukan ke instansi lain", "Perkara selesai", "Masih dalam proses"];
  const finals = ["Selesai melalui musyawarah", "Selesai melalui mediasi", "Dirujuk ke FH UMAHA/LBH Maarif", "Dirujuk ke instansi berwenang", "Masih dalam proses", "Tidak dapat dilanjutkan"];
  const checks = (id, name, items, type = "checkbox") => {
    document.getElementById(id).innerHTML = items.map((value) => `<label><input type="${type}" name="${name}" value="${esc(value)}"><span>${esc(value)}</span></label>`).join("");
  };
  checks("categoryChecks", "kategori_identifikasi", categories);
  checks("followupChecks", "tindak_lanjut", followups);
  checks("finalStatusRadios", "status_akhir", finals, "radio");

  let complaints = [];
  const complaintRows = document.getElementById("complaintRows");
  const statusFilter = document.getElementById("statusFilter");
  const complaintSearch = document.getElementById("searchInput");
  const detailModal = document.getElementById("detailModal");
  const handlingForm = document.getElementById("handlingForm");
  const badge = (status) => `<span class="status-badge ${status === "Menunggu" ? "status-Menunggu" : status === "Selesai" ? "status-Selesai" : "status-default"}">${esc(status)}</span>`;

  function renderComplaints() {
    const query = complaintSearch.value.toLowerCase();
    const visible = complaints.filter((item) => (!statusFilter.value || item.status === statusFilter.value)
      && `${item.nomor_register} ${item.nama_lengkap} ${(item.jenis_permasalahan || []).join(" ")}`.toLowerCase().includes(query));
    complaintRows.innerHTML = visible.length ? visible.map((item) => `<tr><td class="font-semibold">${esc(item.nomor_register)}</td><td>${esc(item.nama_lengkap)}</td><td>${new Date(item.tanggal_pengaduan).toLocaleDateString("id-ID")}</td><td>${esc((item.jenis_permasalahan || []).join(", "))}</td><td>${badge(item.status)}</td><td><button class="detail-button" data-complaint-id="${esc(item.id)}">Lihat detail</button></td></tr>`).join("") : '<tr><td colspan="6" class="py-10 text-center text-gray-500">Tidak ada pengaduan yang sesuai.</td></tr>';
    document.getElementById("tableInfo").textContent = `${visible.length} pengaduan ditampilkan`;
  }

  async function loadComplaints() {
    complaintRows.innerHTML = '<tr><td colspan="6" class="py-10 text-center text-gray-500">Memuat data rahasia...</td></tr>';
    try {
      const result = await api("/posbankum/admin");
      complaints = result.data || [];
      renderComplaints();
    } catch (error) {
      complaintRows.innerHTML = `<tr><td colspan="6" class="py-10 text-center text-red-600">${esc(error.message)}</td></tr>`;
    }
  }

  statusFilter.addEventListener("change", renderComplaints);
  complaintSearch.addEventListener("input", renderComplaints);
  const val = (label, value) => `<div class="detail-item"><span>${esc(label)}</span><p>${esc(value || "-")}</p></div>`;

  async function openComplaint(id) {
    try {
      const result = await api(`/posbankum/admin/${encodeURIComponent(id)}`);
      const item = result.data;
      const related = item.pihak_terkait || {};
      const birth = [item.tempat_lahir, item.tanggal_lahir].filter(Boolean).join(", ");
      const address = item.dusun ? `${item.dusun}, RT ${item.rt || "-"}, RW ${item.rw || "-"}` : item.alamat;
      document.getElementById("complaintDetail").innerHTML = `<section class="detail-section"><h3>${esc(item.nomor_register)}</h3><div class="detail-grid">${val("Jenis layanan", item.jenis_layanan === "litigasi" ? "Pendampingan Litigasi" : "Konsultasi (Non-Litigasi)")}${val("Nama Pengadu", item.nama_lengkap)}${val("NIK", item.nik)}${val("Tempat/Tanggal Lahir", birth)}${val("Jenis Kelamin", item.jenis_kelamin)}${val("No. HP/WhatsApp", item.no_hp)}${val("Pekerjaan", item.pekerjaan)}${val("Status dalam permasalahan", item.status_dalam_permasalahan)}${val("Alamat", address)}</div></section><section class="detail-section"><h3>Pihak Terkait</h3><div class="detail-grid">${val("Nama", related.nama)}${val("No. HP", related.no_hp)}${val("Hubungan", related.hubungan)}${val("Alamat", related.alamat)}</div></section><section class="detail-section"><h3>Permasalahan dan Upaya</h3><div class="detail-grid">${val("Jenis", (item.jenis_permasalahan || []).join(", "))}${val("Waktu", item.waktu_kejadian)}${val("Tempat", item.tempat_kejadian)}${val("Upaya", (item.upaya_dilakukan || []).join(", "))}${val("Hasil upaya", item.hasil_upaya)}${val("Harapan", item.harapan_pengadu)}</div><div class="detail-item mt-4"><span>Uraian</span><p>${esc(item.uraian || "-")}</p></div></section><section class="detail-section documents"><h3>Dokumen/Bukti</h3>${(item.dokumen || []).length ? item.dokumen.map((doc) => doc.url ? `<a href="${esc(doc.url)}" target="_blank" rel="noopener noreferrer">${esc(doc.name)}</a>` : `<p>${esc(doc.name)} (tautan tidak tersedia)</p>`).join("") : "<p>Tidak ada dokumen.</p>"}</section>`;
      handlingForm.elements.id.value = item.id;
      handlingForm.elements.status.value = item.status;
      handlingForm.elements.catatan_petugas.value = item.catatan_petugas || "";
      handlingForm.elements.kategori_lainnya.value = item.kategori_lainnya || "";
      handlingForm.elements.tanggal_tindak_lanjut.value = item.tanggal_tindak_lanjut || "";
      handlingForm.elements.petugas_penanggung_jawab.value = item.petugas_penanggung_jawab || "";
      handlingForm.elements.hasil_penanganan.value = item.hasil_penanganan || "";
      document.querySelectorAll('#handlingForm input[type="checkbox"], #handlingForm input[type="radio"]').forEach((input) => {
        const values = input.name === "kategori_identifikasi" ? item.kategori_identifikasi || [] : input.name === "tindak_lanjut" ? item.tindak_lanjut || [] : [item.status_akhir];
        input.checked = values.includes(input.value);
      });
      document.getElementById("otherCategory").classList.toggle("hidden", !(item.kategori_identifikasi || []).includes("Lain-lain"));
      detailModal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    } catch (error) {
      Swal.fire("Gagal", error.message, "error");
    }
  }

  complaintRows.addEventListener("click", (event) => {
    const button = event.target.closest("[data-complaint-id]");
    if (button) openComplaint(button.dataset.complaintId);
  });
  document.getElementById("categoryChecks").addEventListener("change", () => {
    const other = document.querySelector('input[name="kategori_identifikasi"][value="Lain-lain"]');
    document.getElementById("otherCategory").classList.toggle("hidden", !other.checked);
  });
  document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", () => {
    detailModal.classList.add("hidden");
    document.body.style.overflow = "";
  }));
  handlingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(handlingForm);
    const body = {};
    ["kategori_identifikasi", "tindak_lanjut"].forEach((name) => { body[name] = data.getAll(name); });
    ["status", "status_akhir", "kategori_lainnya", "catatan_petugas", "tanggal_tindak_lanjut", "petugas_penanggung_jawab", "hasil_penanganan"].forEach((name) => { body[name] = data.get(name) || null; });
    try {
      const result = await api(`/posbankum/admin/${encodeURIComponent(data.get("id"))}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      await Swal.fire("Berhasil", result.message, "success");
      detailModal.classList.add("hidden");
      document.body.style.overflow = "";
      loadComplaints();
    } catch (error) {
      Swal.fire("Gagal", error.message, "error");
    }
  });

  let referenceResidents = [];
  let referencesLoaded = false;
  const referenceRows = document.getElementById("referenceRows");
  const referenceSearch = document.getElementById("referenceSearch");
  const referenceModal = document.getElementById("referenceModal");
  const referenceForm = document.getElementById("referenceForm");

  function renderReferences() {
    const query = referenceSearch.value.toLowerCase();
    const visible = referenceResidents.filter((item) => `${item.nomor_register} ${item.nama_lengkap} ${item.nik} ${item.dusun} ${item.rt} ${item.rw}`.toLowerCase().includes(query));
    referenceRows.innerHTML = visible.length ? visible.map((item) => `<tr><td class="font-semibold reference-register">${esc(item.nomor_register)}</td><td>${esc(item.nama_lengkap)}</td><td class="reference-nik">${esc(item.nik)}</td><td>${esc(item.dusun)}</td><td>${esc(item.rt)}</td><td>${esc(item.rw)}</td><td><span class="account-badge ${item.user_id ? "linked" : "unlinked"}">${item.user_id ? "Terhubung" : "Belum daftar"}</span></td><td><button class="detail-button" data-reference-id="${esc(item.id)}">Edit</button></td></tr>`).join("") : '<tr><td colspan="8" class="py-10 text-center text-gray-500">Tidak ada data Kartu LBH yang sesuai.</td></tr>';
    const linked = referenceResidents.filter((item) => item.user_id).length;
    document.getElementById("referenceInfo").textContent = `${visible.length} data ditampilkan · ${linked} dari ${referenceResidents.length} NIK sudah terhubung ke akun warga`;
  }

  async function loadReferences() {
    referenceRows.innerHTML = '<tr><td colspan="8" class="py-10 text-center text-gray-500">Memuat data rahasia...</td></tr>';
    try {
      const result = await api("/posbankum/admin/warga-rujukan");
      referenceResidents = result.data || [];
      referencesLoaded = true;
      renderReferences();
    } catch (error) {
      referenceRows.innerHTML = `<tr><td colspan="8" class="py-10 text-center text-red-600">${esc(error.message)}</td></tr>`;
    }
  }

  function openReference(item = null) {
    referenceForm.reset();
    referenceForm.elements.id.value = item?.id || "";
    referenceForm.elements.nama_lengkap.value = item?.nama_lengkap || "";
    referenceForm.elements.nik.value = item?.nik || "";
    referenceForm.elements.dusun.value = item?.dusun || "";
    referenceForm.elements.rt.value = item?.rt || "";
    referenceForm.elements.rw.value = item?.rw || "";
    referenceForm.elements.sumber_data.value = item?.sumber_data || "Input CMS Posbankum";
    document.getElementById("referenceModalTitle").textContent = item ? "Edit Data Kartu LBH" : "Tambah Data Kartu LBH";
    referenceModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    referenceForm.elements.nama_lengkap.focus();
  }

  function closeReference() {
    referenceModal.classList.add("hidden");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".posbankum-tab").forEach((button) => button.addEventListener("click", () => {
    document.querySelectorAll(".posbankum-tab").forEach((tab) => {
      const active = tab === button;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".posbankum-panel").forEach((panel) => panel.classList.toggle("hidden", panel.id !== button.dataset.panel));
    if (button.dataset.panel === "referencePanel" && !referencesLoaded) loadReferences();
  }));
  referenceSearch.addEventListener("input", renderReferences);
  document.getElementById("addReferenceButton").addEventListener("click", () => openReference());
  document.querySelectorAll("[data-close-reference]").forEach((button) => button.addEventListener("click", closeReference));
  referenceRows.addEventListener("click", (event) => {
    const button = event.target.closest("[data-reference-id]");
    if (!button) return;
    const item = referenceResidents.find((entry) => entry.id === button.dataset.referenceId);
    if (item) openReference(item);
  });
  referenceForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(referenceForm));
    const id = data.id;
    delete data.id;
    try {
      const result = await api(id ? `/posbankum/admin/warga-rujukan/${encodeURIComponent(id)}` : "/posbankum/admin/warga-rujukan", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await Swal.fire("Berhasil", result.message, "success");
      closeReference();
      await loadReferences();
    } catch (error) {
      Swal.fire("Gagal", error.message, "error");
    }
  });

  loadComplaints();
});
