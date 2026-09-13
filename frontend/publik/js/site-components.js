(function registerPublicSiteComponents() {
  "use strict";

  const navigation = [
    { label: "Profile Desa", href: "/" },
    { label: "PPID", href: "/PPID" },
    { label: "Lembaga", href: "/Lembaga" },
    { label: "Informasi", href: "/Informasi" },
    { label: "POSBANKUM", href: "/posbankum" },
    { label: "Administrasi Persuratan", href: "/AdminP" },
    { label: "Aduan", href: "/Aduan" },
    { label: "Publikasi", href: "/Publikasi" },
  ];

  function normalizedPath(path) {
    const normalized = String(path || "/")
      .split(/[?#]/, 1)[0]
      .replace(/\/index\.html$/i, "/")
      .replace(/\.html$/i, "")
      .replace(/\/$/, "");
    return (normalized || "/").toLowerCase();
  }

  function isActiveLink(href) {
    return normalizedPath(window.location.pathname) === normalizedPath(href);
  }

  function desktopNavigation() {
    return navigation
      .map((item, index) => {
        const active = isActiveLink(item.href);
        const separator = index
          ? '<div aria-hidden="true" class="h-5 w-px bg-gray-400"></div>'
          : "";
        return `${separator}<a class="nav-item relative px-3 font-bold${active ? " text-green-800" : ""}" href="${item.href}"${active ? ' aria-current="page"' : ""}>${item.label}</a>`;
      })
      .join("");
  }

  function mobileNavigation() {
    return navigation
      .map((item) => {
        const active = isActiveLink(item.href);
        return `<a class="py-4 px-6 border-b border-gray-300 font-semibold text-emerald-900 hover:bg-gray-100 transition${active ? " bg-emerald-50" : ""}" href="${item.href}"${active ? ' aria-current="page"' : ""}>${item.label}</a>`;
      })
      .join("");
  }

  class SiteHeader extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready === "true") return;
      this.dataset.ready = "true";
      this.style.display = "contents";
      this.innerHTML = `
        <header class="bg-gradient-to-r from-green-200/70 via-gray-200/70 to-teal-200/70 backdrop-blur-xl fixed top-0 w-full z-50 shadow-md" id="mainHeader">
          <div class="flex justify-between items-center max-w-7xl mx-auto px-6 h-16">
            <a class="flex items-center gap-3 shrink-0" href="/" aria-label="Beranda Desa Sumorame">
              <img alt="Logo Desa Sumorame" height="36" src="/img/logo3.png" width="40" />
              <span class="font-headline text-xl font-bold text-emerald-900">Desa Sumorame</span>
            </a>
            <nav aria-label="Navigasi utama" class="hidden md:flex items-center font-medium text-green-900">
              ${desktopNavigation()}
            </nav>
            <a class="nav-item hidden md:flex items-center text-black hover:text-emerald-800 transition" href="/login" data-auth-navigation>
              <span class="material-symbols-outlined text-2xl">login</span>
            </a>
            <button class="md:hidden material-symbols-outlined text-emerald-900 text-3xl" id="menuBtn" type="button" aria-controls="mobileMenu" aria-expanded="false" aria-label="Buka menu navigasi">menu</button>
          </div>
        </header>
        <nav aria-label="Navigasi seluler" class="flex flex-col bg-white md:hidden fixed top-16 left-0 w-full z-40 shadow-md max-h-0 overflow-hidden opacity-0 transition-all duration-300" id="mobileMenu">
          ${mobileNavigation()}
          <a class="py-4 px-6 font-semibold text-red-600 hover:bg-gray-100 transition" href="/login" data-auth-navigation>Masuk Warga</a>
        </nav>`;

      this.initializeMenu();
      this.initializeScrollBehavior();
      this.animateNavigation();
    }

    initializeMenu() {
      const button = this.querySelector("#menuBtn");
      const menu = this.querySelector("#mobileMenu");
      if (!button || !menu) return;

      const setOpen = (open) => {
        menu.classList.toggle("max-h-0", !open);
        menu.classList.toggle("opacity-0", !open);
        menu.classList.toggle("max-h-[600px]", open);
        menu.classList.toggle("opacity-100", open);
        button.textContent = open ? "close" : "menu";
        button.setAttribute("aria-expanded", String(open));
        button.setAttribute("aria-label", open ? "Tutup menu navigasi" : "Buka menu navigasi");
      };

      button.addEventListener("click", (event) => {
        event.stopPropagation();
        setOpen(button.getAttribute("aria-expanded") !== "true");
      });
      document.addEventListener("click", (event) => {
        if (!this.contains(event.target)) setOpen(false);
      });
      menu.addEventListener("click", (event) => {
        if (event.target.closest("a")) setOpen(false);
      });
      window.addEventListener("resize", () => {
        if (window.innerWidth >= 768) setOpen(false);
      }, { passive: true });
    }

    initializeScrollBehavior() {
      const header = this.querySelector("#mainHeader");
      const update = () => {
        const hero = document.getElementById("heroSection");
        const atTop = Boolean(hero) && window.scrollY <= 0;
        header?.classList.toggle("header-hidden", atTop);
        hero?.classList.toggle("hero-top", atTop);
      };
      window.addEventListener("scroll", update, { passive: true });
      update();
    }

    animateNavigation() {
      this.querySelectorAll(".nav-item").forEach((item, index) => {
        window.setTimeout(() => {
          item.style.opacity = "1";
          item.style.transform = "translateY(0)";
        }, index * 75);
      });
    }
  }

  class SiteFooter extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready === "true") return;
      this.dataset.ready = "true";
      this.style.display = "contents";
      this.innerHTML = `
        <footer class="w-full bg-green-900 text-white mt-16 px-6 py-10" id="footer">
          <div class="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 break-words">
            <div class="footer-item">
              <div class="inline-flex flex-col items-center">
                <img alt="Logo Desa Sumorame" class="w-16 mb-3" height="58" loading="lazy" src="/img/logo3.png" width="64" />
                <h2 class="text-lg font-bold">Desa Sumorame</h2>
              </div>
              <p class="text-sm text-gray-300">Makmur dan Unggul.</p>
            </div>
            <div class="footer-item">
              <h2 class="kontak-item mb-3 font-semibold">Kontak</h2>
              <p class="kontak-item flex items-start gap-2 text-sm text-gray-300 mb-2">
                <span class="material-symbols-outlined text-lg mt-0.5" aria-hidden="true">location_on</span>
                <span>Jl. Singokarso No.01, Kerawean, Sumorame, Kec. Candi, Kabupaten Sidoarjo, Jawa Timur 61271</span>
              </p>
              <p class="kontak-item flex items-center gap-2 text-sm text-gray-300 mb-2">
                <span class="material-symbols-outlined text-lg" aria-hidden="true">call</span>
                <span id="noTelpFooter">Gunakan menu Aduan untuk menyampaikan laporan.</span>
              </p>
              <p class="kontak-item flex items-center gap-2 text-sm text-gray-300">
                <span class="material-symbols-outlined text-lg" aria-hidden="true">mail</span>
                <span id="emailFooter">PemdesSumorame@gmail.com</span>
              </p>
            </div>
            <div class="footer-item">
              <h2 class="font-semibold mb-3">Ikuti Kami</h2>
              <div class="flex gap-4 items-center">
                <a class="hover:scale-125 transition duration-300" href="https://www.tiktok.com/search?q=pemdes%20sumorame" rel="noopener noreferrer" target="_blank" aria-label="TikTok Desa Sumorame"><img alt="" class="w-6 h-6 invert" height="24" loading="lazy" src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tiktok.svg" width="24" /></a>
                <a class="hover:scale-125 transition duration-300" href="https://www.instagram.com/pemdes_sumorame02/" rel="noopener noreferrer" target="_blank" aria-label="Instagram Desa Sumorame"><img alt="" class="w-6 h-6 invert" height="24" loading="lazy" src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg" width="24" /></a>
                <a class="hover:scale-125 transition duration-300" href="https://www.youtube.com/@pemdes.sumorame" rel="noopener noreferrer" target="_blank" aria-label="YouTube Desa Sumorame"><img alt="" class="w-6 h-6 invert" height="24" loading="lazy" src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/youtube.svg" width="24" /></a>
              </div>
            </div>
          </div>
          <div class="text-center mt-8 text-sm text-gray-400">&copy;2026 Instalasi Teknologi Komunikasi dan Informasi, Kantor Desa Sumorame.</div>
        </footer>`;
      this.loadContact();
    }

    async loadContact() {
      try {
        const baseUrl = window.API_BASE_URL || "http://localhost:3000/api";
        const response = await fetch(`${baseUrl}/cmsprofil`);
        if (!response.ok) return;
        const result = await response.json();
        const profile = result?.success && result?.data?.length ? result.data[0] : null;
        if (!profile) return;
        const email = this.querySelector("#emailFooter");
        const phone = this.querySelector("#noTelpFooter");
        if (email) email.textContent = profile.email_desa || email.textContent;
        if (phone) phone.textContent = profile.no_telp_desa || phone.textContent;
      } catch (error) {
        console.warn("Kontak footer menggunakan data bawaan:", error.message);
      }
    }
  }

  if (!customElements.get("site-header")) customElements.define("site-header", SiteHeader);
  if (!customElements.get("site-footer")) customElements.define("site-footer", SiteFooter);
})();
