(() => {
  "use strict";
  const dialog = document.getElementById("announcementDialog");
  if (!dialog || typeof dialog.showModal !== "function") return;
  const get = (id) => document.getElementById(id);
  const image = get("announcementImage");
  const stage = get("announcementStage");
  const title = get("announcementTitle");
  const counter = get("announcementCounter");
  const controls = get("announcementControls");
  const pause = get("announcementPause");
  const close = get("announcementClose");
  const imageError = get("announcementImageError");
  const AUTO_SLIDE_MS = 6000;
  let slides = [], current = 0, timer = null, openTimer = null;
  let paused = false, imageReady = false, previousFocus, oldOverflow;

  function stop() { window.clearTimeout(timer); timer = null; }
  function schedule() {
    stop();
    if (!dialog.open || slides.length < 2 || !imageReady || paused || document.hidden) return;
    timer = window.setTimeout(() => show(current + 1), AUTO_SLIDE_MS);
  }
  function updatePause() {
    pause.textContent = paused ? "Putar otomatis" : "Jeda otomatis";
    pause.setAttribute("aria-pressed", String(paused));
    counter.setAttribute("aria-live", paused ? "polite" : "off");
    schedule();
  }
  function show(index) {
    current = (index + slides.length) % slides.length;
    const slide = slides[current];
    imageReady = false;
    imageError.hidden = true;
    image.hidden = false;
    image.alt = slide.judul || "Pengumuman Pelayanan";
    image.src = slide.gambar_url;
    // Gambar cache dapat siap sebelum event load diterima.
    imageReady = image.complete && image.naturalWidth > 0;
    title.textContent = image.alt;
    counter.textContent = `${current + 1} / ${slides.length}`;
    stage.setAttribute("aria-label", `Pengumuman ${current + 1} dari ${slides.length}`);
    // Only the current image is requested; no large carousel library or eager image list.
    schedule();
  }
  // Give each loaded picture a full reading interval, including on slower mobile networks.
  image.addEventListener("load", () => { imageReady = true; schedule(); });
  image.addEventListener("error", () => { image.hidden = true; imageError.hidden = false; imageReady = true; schedule(); });
  function manualStep(delta) { show(current + delta); }
  get("announcementPrev").addEventListener("click", () => manualStep(-1));
  get("announcementNext").addEventListener("click", () => manualStep(1));
  pause.addEventListener("click", () => { paused = !paused; updatePause(); });
  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener("close", () => {
    stop();
    document.body.style.overflow = oldOverflow;
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      manualStep(event.key === "ArrowLeft" ? -1 : 1);
    }
  });
  // Navigasi manual mengganti slide lalu menjadwalkan rotasi berikutnya.
  let touchStart = null;
  stage.addEventListener("touchstart", (event) => {
    touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
    stop();
  }, { passive: true });
  stage.addEventListener("touchend", (event) => {
    if (touchStart && event.changedTouches[0]) {
      const dx = event.changedTouches[0].clientX - touchStart.x;
      const dy = event.changedTouches[0].clientY - touchStart.y;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) manualStep(dx < 0 ? 1 : -1);
    }
    touchStart = null; schedule();
  }, { passive: true });
  stage.addEventListener("touchcancel", () => { touchStart = null; schedule(); }, { passive: true });
  document.addEventListener("visibilitychange", schedule);
  window.addEventListener("pagehide", () => { stop(); window.clearTimeout(openTimer); });
  window.addEventListener("pageshow", schedule);

  async function load() {
    const abort = new AbortController();
    const timeout = window.setTimeout(() => abort.abort(), 12000);
    try {
      const response = await fetch(`${window.API_BASE_URL}/cmsprofil/pengumuman`, { signal: abort.signal });
      if (!response.ok) throw new Error("API pengumuman belum tersedia.");
      const result = await response.json();
      if (!result.success || !Array.isArray(result.data)) throw new Error("Data pengumuman tidak valid.");
      const seen = new Set();
      slides = result.data.filter((item) => {
        if (typeof item?.gambar_url !== "string" || !/^https?:\/\//i.test(item.gambar_url.trim())) return false;
        try {
          const url = new URL(item.gambar_url.trim());
          if (url.username || url.password || seen.has(url.href)) return false;
          item.gambar_url = url.href;
          seen.add(url.href);
          return true;
        } catch (_) { return false; }
      });
      if (!slides.length) return;
      controls.hidden = slides.length < 2;
      show(0);
      openTimer = window.setTimeout(() => {
        previousFocus = document.activeElement;
        oldOverflow = document.body.style.overflow;
        dialog.showModal();
        document.body.style.overflow = "hidden";
        close.focus({ preventScroll: true });
        updatePause();
      }, 800);
    } catch (error) {
      // No fake/old announcement fallback: an intentionally empty CMS stays empty.
      console.warn("Popup pengumuman tidak ditampilkan:", error.message);
    } finally { window.clearTimeout(timeout); }
  }
  load();
})();
