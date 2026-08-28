(function configureApi() {
  const localHosts = new Set(["localhost", "127.0.0.1"]);
  window.API_BASE_URL = localHosts.has(window.location.hostname)
    ? "http://localhost:3000/api"
    : "https://web-desa-sumorame-backend.vercel.app/api";

  const isLoginPage = /\/LoginAdmin(?:\.html)?$/i.test(window.location.pathname);
  const clearAdminSession = () => {
    ["token", "user", "admin", "login"].forEach((key) => localStorage.removeItem(key));
  };

  if (!isLoginPage) {
    try {
      const token = localStorage.getItem("token");
      const payloadPart = token?.split(".")[1];
      const normalized = payloadPart?.replace(/-/g, "+").replace(/_/g, "/");
      const payload = normalized
        ? JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")))
        : null;
      const expired = !payload?.exp || payload.exp * 1000 <= Date.now();

      if (!token || payload?.role !== "admin" || expired) {
        clearAdminSession();
        window.location.replace("/admin/LoginAdmin");
        return;
      }
    } catch (error) {
      clearAdminSession();
      window.location.replace("/admin/LoginAdmin");
      return;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document
      .querySelectorAll('a[href="/admin/LoginAdmin"], #btnLogout')
      .forEach((element) => {
        element.addEventListener("click", () => clearAdminSession());
      });
  });
})();
