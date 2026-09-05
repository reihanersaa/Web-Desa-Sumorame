(() => {
  "use strict";
  const container = document.getElementById("turnstileWidget");
  const status = document.getElementById("turnstileStatus");
  const form = document.getElementById("loginForm");
  const submit = form?.querySelector('button[type="submit"]');
  if (!container || !form || !submit) return;

  let siteKey = "";
  let widgetId = null;
  let configReady = false;
  let initialized = false;
  let initError = null;
  submit.disabled = true;

  function setStatus(message, isError = false) {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("turnstile-error", isError);
  }

  function tryRender() {
    if (initialized || !configReady || !window.turnstile?.render) return;
    try {
      widgetId = window.turnstile.render(container, {
        sitekey: siteKey,
        action: container.dataset.action,
        theme: "auto",
        language: "id",
        "refresh-expired": "auto",
        callback: () => setStatus("Verifikasi keamanan berhasil."),
        "expired-callback": () => setStatus("Verifikasi kedaluwarsa; silakan ulangi.", true),
        "error-callback": () => { setStatus("Verifikasi keamanan gagal dimuat. Silakan muat ulang halaman.", true); return true; },
      });
      initialized = true;
      submit.disabled = false;
      setStatus("Selesaikan verifikasi keamanan sebelum masuk.");
    } catch (error) {
      initError = error;
      setStatus("Verifikasi keamanan gagal dimuat. Silakan muat ulang halaman.", true);
    }
  }

  window.onTurnstileApiReady = tryRender;
  const configPromise = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`${window.API_BASE_URL}/auth/security-config`, {
        cache: "no-store",
        signal: controller.signal,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success || typeof result.turnstileSiteKey !== "string" || !result.turnstileSiteKey.trim()) {
        throw new Error(result.message || "Konfigurasi keamanan tidak tersedia.");
      }
      siteKey = result.turnstileSiteKey.trim();
      configReady = true;
      tryRender();
    } catch (error) {
      initError = error;
      setStatus("Layanan verifikasi keamanan belum tersedia. Silakan coba lagi nanti.", true);
    } finally {
      clearTimeout(timeout);
    }
  })();

  window.LoginSecurity = {
    async getToken() {
      await configPromise;
      tryRender();
      if (initError || widgetId === null || !window.turnstile) throw new Error("Verifikasi keamanan belum siap.");
      const token = window.turnstile.getResponse(widgetId);
      if (!token) throw new Error("Selesaikan verifikasi keamanan terlebih dahulu.");
      return token;
    },
    reset() {
      if (widgetId !== null && window.turnstile) {
        window.turnstile.reset(widgetId);
        setStatus("Selesaikan verifikasi keamanan sebelum mencoba lagi.");
      }
    },
  };
})();
