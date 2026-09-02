// ==========================================
// KOMPONEN FOOTER DINAMIS (GLOBAL)
// ==========================================
async function loadGlobalFooter() {
  // 1. Cari atau buat wadah footer di halaman
  let footerEl = document.getElementById("globalFooter") || document.getElementById("footer");
  
  if (!footerEl) {
    // Jika tag <footer> belum ada id-nya di HTML, buat secara otomatis di bawah body
    footerEl = document.createElement("footer");
    footerEl.id = "footer";
    footerEl.className = "bg-green-900 text-white mt-16 px-6 py-10";
    document.body.appendChild(footerEl);
  }

  // Footer tetap terlihat tanpa bergantung pada animasi halaman.
  footerEl.classList.remove("opacity-0", "translate-y-10");

  // 2. Render struktur HTML Footer
  footerEl.innerHTML = `
    <div class="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 break-words">
      <div class="footer-item">
        <div class="inline-flex flex-col items-center">
          <img alt="Logo Desa" class="w-16 mb-3" src="img/logo3.png" />
          <h3 class="text-lg font-bold">Desa Sumorame</h3>
        </div>
        <p class="text-sm text-gray-300">
          Desa mandiri berbasis teknologi untuk masa depan yang lebih baik.
        </p>
      </div>
      <div class="footer-item">
        <h4 class="kontak-item mb-3 font-semibold">
          Kontak
        </h4>
        <p class="kontak-item flex items-start gap-2 text-sm text-gray-300 mb-2">
          <span class="material-symbols-outlined text-lg mt-[2px]">location_on</span>
          <span>Jl. Singokarso No.01, Kerawean, Sumorame, Kec. Candi, Kabupaten Sidoarjo, Jawa Timur 61271</span>
        </p>
        <p class="kontak-item flex items-center gap-2 text-sm text-gray-300 mb-2">
          <span class="material-symbols-outlined text-lg"> call </span>
          <span id="noTelpFooter">Gunakan menu Aduan untuk menyampaikan laporan.</span>
        </p>
        <p class="kontak-item flex items-center gap-2 text-sm text-gray-300">
          <span class="material-symbols-outlined text-lg"> mail </span>
          <span id="emailFooter">PemdesSumorame@gmail.com</span>
        </p>
      </div>
      <div class="footer-item">
        <h4 class="font-semibold mb-3">Ikuti Kami</h4>
        <div class="flex gap-4 items-center">
          <a class="hover:scale-125 transition duration-300" href="https://www.tiktok.com/search?q=pemdes%20sumorame&amp;t=1785759591160" target="_blank">
            <img alt="TikTok" class="w-6 h-6 invert" src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tiktok.svg"/>
          </a>
          <a class="hover:scale-125 transition duration-300" href="https://www.instagram.com/pemdes_sumorame02/" target="_blank">
            <img alt="Instagram" class="w-6 h-6 invert" src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg"/>
          </a>
          <a class="hover:scale-125 transition duration-300" href="https://www.youtube.com/@pemdes.sumorame" target="_blank">
            <img alt="YouTube" class="w-6 h-6 invert" src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/youtube.svg"/>
          </a>
        </div>
      </div>
    </div>
    <div class="text-center mt-8 text-sm text-gray-400">
      &copy;2026 Instalasi Teknologi Komunikasi Dan Informasi, Kantor Desa Sumorame.
    </div>
  `;

  // 3. Ambil data dari API CMS Profil untuk mengisi Email & No Telp secara dinamis
  try {
    const baseUrl = window.API_BASE_URL || "http://localhost:3000/api";
    const response = await fetch(`${baseUrl}/cmsprofil`);
    if (!response.ok) throw new Error("Gagal memuat kontak desa");
    const result = await response.json();

    if (result.success && result.data && result.data.length > 0) {
      const dataUtama = result.data[0];
      
      const emailEl = document.getElementById("emailFooter");
      const telpEl = document.getElementById("noTelpFooter");

      if (emailEl) emailEl.textContent = dataUtama.email_desa || "PemdesSumorame@gmail.com";
      if (telpEl) telpEl.textContent = dataUtama.no_telp_desa || "Gunakan menu Aduan untuk menyampaikan laporan.";
    }
  } catch (err) {
    console.error("Gagal memuat data footer:", err);
  }
}

// Jalankan saat halaman siap
if (document.body) {
  loadGlobalFooter();
} else {
  document.addEventListener("DOMContentLoaded", loadGlobalFooter, { once: true });
}
