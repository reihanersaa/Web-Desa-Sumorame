(function configureApi() {
  const localHosts = new Set(["localhost", "127.0.0.1"]);
  window.API_BASE_URL = localHosts.has(window.location.hostname)
    ? "http://localhost:3000/api"
    : "https://web-desa-sumorame-backend.vercel.app/api";
})();
