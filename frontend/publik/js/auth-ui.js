(function initializePublicAuth() {
  "use strict";

  const AUTH_KEYS = ["token", "login", "user_nama", "user_nik", "user_role"];
  function decodeJwtPayload(token) {
    try {
      const payload = token.split(".")[1];
      if (!payload) return null;
      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
      return JSON.parse(atob(padded));
    } catch (_error) {
      return null;
    }
  }

  function getSession() {
    const token = localStorage.getItem("token");
    const payload = token ? decodeJwtPayload(token) : null;
    const isExpired = !payload?.exp || payload.exp * 1000 <= Date.now();
    const isWarga = payload?.role === "warga";

    if (!token || isExpired || !isWarga) {
      AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
      return null;
    }

    localStorage.setItem("login", "true");
    localStorage.setItem("user_role", payload.role);
    return {
      token,
      role: payload.role,
      nik: payload.nik || localStorage.getItem("user_nik") || "",
      nama: localStorage.getItem("user_nama") || "Warga",
    };
  }

  function safeReturnPath(path) {
    if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//")) {
      return "/index.html";
    }
    return path;
  }

  function requireLogin(returnPath) {
    localStorage.setItem("redirectAfterLogin", safeReturnPath(returnPath));
    window.location.replace("/login.html");
  }

  function logout() {
    AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem("redirectAfterLogin");
    localStorage.removeItem("redirectAduan");
    localStorage.removeItem("jenisDipilih");
    window.location.href = "/index.html";
  }

  function injectAccountMenuStyles() {
    if (document.getElementById("auth-menu-styles")) return;

    const style = document.createElement("style");
    style.id = "auth-menu-styles";
    style.textContent = `
      .auth-navigation { cursor: pointer; }
      .auth-account-menu {
        position: fixed;
        z-index: 1000;
        width: min(18rem, calc(100vw - 2rem));
        padding: 0.75rem;
        border: 1px solid #d1fae5;
        border-radius: 0.9rem;
        background: #ffffff;
        box-shadow: 0 18px 45px rgba(6, 78, 59, 0.2);
        color: #064e3b;
      }
      .auth-account-menu[hidden] { display: none; }
      .auth-account-heading { padding: 0.35rem 0.5rem 0.75rem; border-bottom: 1px solid #e5e7eb; }
      .auth-account-label { display: block; color: #6b7280; font-size: 0.75rem; }
      .auth-account-name { display: block; margin-top: 0.15rem; font-size: 0.95rem; overflow-wrap: anywhere; }
      .auth-account-actions { display: grid; gap: 0.35rem; padding-top: 0.6rem; }
      .auth-account-action {
        display: flex;
        align-items: center;
        gap: 0.55rem;
        width: 100%;
        min-height: 2.5rem;
        padding: 0.55rem 0.65rem;
        border: 0;
        border-radius: 0.65rem;
        background: transparent;
        color: #065f46;
        font: inherit;
        text-align: left;
        text-decoration: none;
      }
      .auth-account-action:hover, .auth-account-action:focus-visible { background: #ecfdf5; outline: none; }
      .auth-account-action.logout { color: #b91c1c; }
      .auth-account-action.logout:hover, .auth-account-action.logout:focus-visible { background: #fef2f2; }
      @media (max-width: 767px) { .auth-account-menu { display: none !important; } }
    `;
    document.head.appendChild(style);
  }

  function createAccountMenu(link, session) {
    const menu = document.createElement("div");
    menu.className = "auth-account-menu";
    menu.hidden = true;
    menu.setAttribute("role", "menu");

    const heading = document.createElement("div");
    heading.className = "auth-account-heading";
    const label = document.createElement("span");
    label.className = "auth-account-label";
    label.textContent = "Akun warga terverifikasi";
    const name = document.createElement("strong");
    name.className = "auth-account-name";
    name.textContent = session.nama;
    heading.append(label, name);

    const actions = document.createElement("div");
    actions.className = "auth-account-actions";
    const home = document.createElement("a");
    home.className = "auth-account-action";
    home.href = "/index.html";
    home.setAttribute("role", "menuitem");
    home.innerHTML = '<span class="material-symbols-outlined">home</span><span>Beranda</span>';

    const logoutButton = document.createElement("button");
    logoutButton.type = "button";
    logoutButton.className = "auth-account-action logout";
    logoutButton.setAttribute("role", "menuitem");
    logoutButton.innerHTML = '<span class="material-symbols-outlined">logout</span><span>Keluar</span>';
    logoutButton.addEventListener("click", logout);
    actions.append(home, logoutButton);
    menu.append(heading, actions);
    document.body.appendChild(menu);

    const closeMenu = () => {
      menu.hidden = true;
      link.setAttribute("aria-expanded", "false");
    };

    link.setAttribute("role", "button");
    link.setAttribute("aria-haspopup", "menu");
    link.setAttribute("aria-expanded", "false");
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const willOpen = menu.hidden;
      if (!willOpen) {
        closeMenu();
        return;
      }

      const rect = link.getBoundingClientRect();
      menu.style.top = `${Math.min(window.innerHeight - 16, rect.bottom + 10)}px`;
      menu.style.right = `${Math.max(16, window.innerWidth - rect.right)}px`;
      menu.hidden = false;
      link.setAttribute("aria-expanded", "true");
    });

    document.addEventListener("click", (event) => {
      if (!menu.hidden && !menu.contains(event.target) && !link.contains(event.target)) {
        closeMenu();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", closeMenu, { passive: true });
  }

  function renderAuthNavigation() {
    const session = getSession();
    injectAccountMenuStyles();
    const authLinks = document.querySelectorAll('a[href="/login.html"], [data-auth-navigation]');

    authLinks.forEach((link) => {
      const icon = link.querySelector(".material-symbols-outlined");
      const isIconOnly = Boolean(icon) && link.textContent.trim() === icon.textContent.trim();

      link.dataset.authNavigation = "true";
      link.classList.add("auth-navigation");

      if (session) {
        link.href = "#";
        link.title = isIconOnly
          ? `Akun ${session.nama}. Buka menu akun.`
          : `Masuk sebagai ${session.nama}. Klik untuk keluar.`;
        link.setAttribute(
          "aria-label",
          isIconOnly
            ? `Buka menu akun ${session.nama}`
            : `Keluar dari akun ${session.nama}`,
        );
        if (icon) icon.textContent = "account_circle";
        if (!isIconOnly) link.textContent = `Keluar (${session.nama})`;
        if (isIconOnly) {
          createAccountMenu(link, session);
        } else {
          link.addEventListener("click", (event) => {
            event.preventDefault();
            logout();
          });
        }
      } else {
        link.href = "/login.html";
        link.title = "Masuk sebagai warga";
        link.setAttribute("aria-label", "Masuk sebagai warga");
        if (icon) icon.textContent = "login";
        if (!isIconOnly) link.textContent = "Masuk Warga";
      }
    });
  }

  window.AuthSession = Object.freeze({
    get: getSession,
    isAuthenticated: () => Boolean(getSession()),
    requireLogin,
    logout,
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderAuthNavigation, { once: true });
  } else {
    renderAuthNavigation();
  }
})();
