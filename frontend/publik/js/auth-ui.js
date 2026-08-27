(function initializePublicAuth() {
  "use strict";

  const AUTH_KEYS = ["token", "login", "user_nama", "user_nik", "user_role"];
  const PROTECTED_PAGES = new Set(["/Aduan.html", "/AdminP.html"]);

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

  function renderAuthNavigation() {
    const session = getSession();
    const authLinks = document.querySelectorAll('a[href="/login.html"], [data-auth-navigation]');

    authLinks.forEach((link) => {
      const icon = link.querySelector(".material-symbols-outlined");
      const isIconOnly = Boolean(icon) && link.textContent.trim() === icon.textContent.trim();

      link.dataset.authNavigation = "true";
      link.classList.add("auth-navigation");

      if (session) {
        link.href = "#";
        link.title = `Masuk sebagai ${session.nama}. Klik untuk keluar.`;
        link.setAttribute("aria-label", `Akun ${session.nama}. Klik untuk keluar`);
        if (icon) icon.textContent = "account_circle";
        if (!isIconOnly) link.textContent = `Keluar (${session.nama})`;
        link.addEventListener("click", (event) => {
          event.preventDefault();
          logout();
        });
      } else {
        link.href = "/login.html";
        link.title = "Masuk sebagai warga";
        link.setAttribute("aria-label", "Masuk sebagai warga");
        if (icon) icon.textContent = "login";
        if (!isIconOnly) link.textContent = "Masuk Warga";
      }
    });
  }

  const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
  if (PROTECTED_PAGES.has(currentPath) && !getSession()) {
    requireLogin(`${window.location.pathname}${window.location.search}${window.location.hash}`);
    return;
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
