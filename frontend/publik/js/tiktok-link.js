(function () {
  "use strict";

  const TIKTOK_WEB_URL =
    "https://www.tiktok.com/search?q=pemdes%20sumorame";
  const TIKTOK_SEARCH_TERM = "pemdes sumorame";
  // Paket TikTok yang didistribusikan untuk wilayah Asia, termasuk Indonesia.
  const TIKTOK_INDONESIA_ANDROID_PACKAGE = "com.ss.android.ugc.trill";
  const TIKTOK_APP_SCHEME = "snssdk1233";

  function isAndroid() {
    return /Android/i.test(navigator.userAgent);
  }

  function isIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  function openTikTok(event) {
    if (!isAndroid() && !isIOS()) return;

    event.preventDefault();

    if (isAndroid()) {
      const fallbackUrl = encodeURIComponent(TIKTOK_WEB_URL);
      window.location.href =
        `intent://search?keyword=${encodeURIComponent(TIKTOK_SEARCH_TERM)}` +
        `#Intent;scheme=${TIKTOK_APP_SCHEME};` +
        `package=${TIKTOK_INDONESIA_ANDROID_PACKAGE};` +
        `S.browser_fallback_url=${fallbackUrl};end`;
      return;
    }

    let appOpened = false;
    const markAppOpened = function () {
      if (document.hidden) appOpened = true;
    };

    document.addEventListener("visibilitychange", markAppOpened, { once: true });
    window.location.href =
      `${TIKTOK_APP_SCHEME}://search?keyword=${encodeURIComponent(TIKTOK_SEARCH_TERM)}`;

    window.setTimeout(function () {
      document.removeEventListener("visibilitychange", markAppOpened);
      if (!appOpened && !document.hidden) window.location.href = TIKTOK_WEB_URL;
    }, 1500);
  }

  document
    .querySelectorAll('a[href*="tiktok.com"]')
    .forEach(function (link) {
      link.setAttribute("aria-label", "Buka TikTok Pemdes Sumorame");
      link.addEventListener("click", openTikTok);
    });
})();
