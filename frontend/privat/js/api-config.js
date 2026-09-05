(function configureAdminApi() {
  "use strict";
  const localHosts = new Set(["localhost", "127.0.0.1"]);
  window.API_BASE_URL = localHosts.has(window.location.hostname)
    ? "http://localhost:3000/api"
    : "https://web-desa-sumorame-backend.vercel.app/api";
  const api = new URL(window.API_BASE_URL);
  const KEY = "sumorame_admin_session";
  const LOGIN_URL = "/admin/LoginAdmin";
  const isLoginPage = /\/LoginAdmin(?:\.html)?\/?$/i.test(window.location.pathname);
  const nativeFetch = window.fetch.bind(window);
  const RENEW_EVERY = 10 * 60 * 1000;
  const ACTIVE_WINDOW = 20 * 60 * 1000;
  let lastActivity = Date.now();
  let lastAttempt = 0;
  let renewing = null;
  let loggingOut = false;

  function decode(token) {
    try {
      const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(part.padEnd(Math.ceil(part.length / 4) * 4, "=")));
    } catch (_) { return null; }
  }

  function read() {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY));
      const payload = decode(stored?.token);
      return ["admin", "petugas_posbankum"].includes(payload?.role) && payload.type === "admin_access" && payload.sid
        ? { ...stored, payload } : null;
    } catch (_) { return null; }
  }

  function get() {
    const session = read();
    return session?.payload.exp * 1000 > Date.now() ? session : null;
  }

  // Legacy aliases keep existing CMS modules compatible WITHOUT changing their files.
  // Only this dedicated key is authoritative; public pages never clear it.
  function mirror(session) {
    const legacy = localStorage.getItem("token");
    if (decode(legacy)?.role === "warga" && !localStorage.getItem("warga_token")) {
      localStorage.setItem("warga_token", legacy);
    }
    localStorage.setItem("token", session.token);
    localStorage.setItem("user", JSON.stringify(session.data || {}));
    localStorage.setItem("admin", JSON.stringify(session.data || {}));
  }

  function clear() {
    localStorage.removeItem(KEY);
    if (["admin", "petugas_posbankum"].includes(decode(localStorage.getItem("token"))?.role)) {
      localStorage.removeItem("token");
    }
    localStorage.removeItem("admin");
    localStorage.removeItem("user");
  }

  function notice(message, loginRequired = false) {
    if (isLoginPage) return;
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", () => notice(message, loginRequired), { once: true });
      return;
    }
    let bar = document.getElementById("admin-session-notice");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "admin-session-notice";
      bar.setAttribute("role", "alert");
      bar.style.cssText = "position:fixed;bottom:16px;left:16px;right:16px;z-index:10000;padding:14px 18px;background:#fff7ed;border:1px solid #fdba74;border-radius:12px;color:#7c2d12;font:14px/1.5 sans-serif;box-shadow:0 6px 24px #0002";
      document.body.appendChild(bar);
    }
    bar.replaceChildren(document.createTextNode(message));
    if (loginRequired) {
      const link = document.createElement("a");
      link.href = LOGIN_URL;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = " Login di tab baru";
      link.style.cssText = "font-weight:bold;text-decoration:underline;margin-left:8px";
      bar.appendChild(link);
    }
  }

  function removeNotice() { document.getElementById("admin-session-notice")?.remove(); }

  function limitPosbankumNavigation(session) {
    if (session?.payload?.role !== "petugas_posbankum") return;
    const hideAdminOnlyLinks = () => {
      document.querySelectorAll(
        '#sidebar > nav > a[href]:not([href="/admin/Posbankum"]), #sidebar > nav > .nav-item',
      ).forEach((element) => {
        element.hidden = true;
        element.style.display = "none";
      });
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", hideAdminOnlyLinks, { once: true });
    } else {
      hideAdminOnlyLinks();
    }
  }

  function saveLogin(result) {
    const payload = decode(result?.token);
    if (!["admin", "petugas_posbankum"].includes(payload?.role) || payload.type !== "admin_access" || !payload.sid ||
        !(payload.exp * 1000 > Date.now())) throw new Error("Sesi admin dari server tidak valid.");
    const stored = { token: result.token, data: result.data,
      expires_at: result.expires_at, absolute_expires_at: result.absolute_expires_at };
    localStorage.setItem(KEY, JSON.stringify(stored));
    mirror(stored);
    removeNotice();
    return stored;
  }

  function invalidate(sentToken) {
    // A delayed response must not delete a newer login/renewal from another tab.
    if (read()?.token !== sentToken) return;
    clear();
    notice("Sesi admin berakhir atau dicabut. Form di halaman ini tidak dihapus.", true);
  }

  async function renewIfDue() {
    if (renewing) return renewing;
    const current = get();
    if (!current || loggingOut || document.visibilityState === "hidden" ||
        Date.now() - lastActivity > ACTIVE_WINDOW ||
        Date.now() - current.payload.iat * 1000 < RENEW_EVERY ||
        Date.now() - lastAttempt < 60000) return current;
    lastAttempt = Date.now();
    renewing = (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await nativeFetch(`${api.href}/auth/admin/session/renew`, {
          method: "POST", cache: "no-store", signal: controller.signal,
          headers: { Authorization: `Bearer ${current.token}` },
        });
        if (response.status === 401) { invalidate(current.token); return null; }
        if (!response.ok) throw new Error("Renewal sementara gagal");
        const result = await response.json();
        const latest = read();
        const next = decode(result.token);
        if (!loggingOut && latest?.payload.sid === current.payload.sid &&
            next?.sid === latest.payload.sid && next.exp >= latest.payload.exp) {
          saveLogin({ ...result, data: { ...latest.data, ...result.data } });
        }
        return get();
      } catch (_) {
        // Offline, timeouts, 429 and 5xx must not log the user out.
        notice("Perpanjangan sesi sementara tertunda. Periksa koneksi; akun dan form tidak dihapus.");
        return get();
      } finally { clearTimeout(timeout); }
    })().finally(() => { renewing = null; });
    return renewing;
  }

  async function logout() {
    if (loggingOut) return;
    const current = read();
    if (!current) { clear(); window.location.assign(LOGIN_URL); return; }
    loggingOut = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await nativeFetch(`${api.href}/auth/admin/session/logout`, {
        method: "POST", cache: "no-store", signal: controller.signal,
        headers: { Authorization: `Bearer ${current.token}` },
      });
      if (!response.ok && response.status !== 401) throw new Error("Logout belum tercatat di server");
      if (read()?.payload.sid === current.payload.sid) clear();
      window.location.assign(LOGIN_URL);
    } catch (_) {
      notice("Logout belum berhasil dikonfirmasi server. Periksa koneksi dan tekan Logout kembali.");
    } finally { clearTimeout(timeout); loggingOut = false; }
  }

  // Use current token even when an old CMS module captured a token at page load.
  // Intercept only authenticated requests to the configured backend, never third parties.
  window.fetch = async function adminFetch(input, options) {
    const isRequest = input instanceof Request;
    const url = new URL(isRequest ? input.url : input, window.location.href);
    const headers = new Headers(options?.headers !== undefined ? options.headers : (isRequest ? input.headers : undefined));
    const belongsToApi = url.origin === api.origin && url.pathname.startsWith(`${api.pathname}/`);
    if (!belongsToApi || !headers.has("Authorization")) return nativeFetch(input, options);
    await renewIfDue();
    const current = get();
    if (!current) {
      notice("Sesi admin berakhir. Login kembali tanpa menutup form ini.", true);
      return new Response(JSON.stringify({ success: false, message: "Sesi admin berakhir. Silakan login kembali." }),
        { status: 401, headers: { "Content-Type": "application/json" } });
    }
    headers.set("Authorization", `Bearer ${current.token}`);
    const response = await nativeFetch(input, { ...options, headers });
    if (response.status === 401) invalidate(current.token);
    // Never automatically repeat POST/PUT/DELETE; avoid duplicate submissions.
    return response;
  };

  window.AdminSession = Object.freeze({ get, saveLogin, renew: renewIfDue, logout });

  if (!isLoginPage) {
    const current = get();
    if (!current) {
      clear();
      window.location.replace(LOGIN_URL);
      return;
    }
    mirror(current);
    limitPosbankumNavigation(current);
    if (current.payload.role === "petugas_posbankum" &&
        !/\/Posbankum(?:\.html)?\/?$/i.test(window.location.pathname)) {
      window.location.replace("/admin/Posbankum");
      return;
    }
    void renewIfDue();
    ["pointerdown", "keydown", "scroll", "touchstart"].forEach((event) => {
      document.addEventListener(event, () => {
        if (Date.now() - lastActivity < 15000) return;
        lastActivity = Date.now();
        void renewIfDue();
      }, { passive: true });
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        lastActivity = Date.now();
        if (get()) void renewIfDue();
        else notice("Sesi admin sudah berakhir. Form tidak dihapus; silakan login kembali.", true);
      }
    });
    setInterval(() => {
      if (get()) void renewIfDue();
      else notice("Sesi admin sudah berakhir. Form tidak dihapus; silakan login kembali.", true);
    }, 60000);
  }

  window.addEventListener("storage", (event) => {
    if (event.key !== KEY) return;
    const current = get();
    if (current) { mirror(current); removeNotice(); }
    else notice("Sesi admin berakhir atau sudah logout dari tab lain.", true);
  });

  document.addEventListener("click", (event) => {
    const element = event.target.closest?.('a[href="/admin/LoginAdmin"], a[href="/admin/LoginAdmin.html"], #btnLogout');
    if (!element || isLoginPage || element.closest("#admin-session-notice")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    void logout();
  }, true);
})();
