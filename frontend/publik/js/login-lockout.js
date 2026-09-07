(function () {
  "use strict";
  const form = document.getElementById("loginForm");
  const button = form?.querySelector('button[type="submit"]');
  if (!form || !button) return;

  const originalLabel = button.textContent.trim();
  let timer = null;

  function lock(seconds) {
    const until = Date.now() + Math.max(1, Number(seconds) || 120) * 1000;
    clearInterval(timer);
    form.querySelectorAll("input, button").forEach((control) => { control.disabled = true; });
    const update = function () {
      const remaining = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      button.textContent = remaining ? `Coba lagi dalam ${remaining} detik` : originalLabel;
      if (!remaining) {
        clearInterval(timer);
        form.querySelectorAll("input, button").forEach((control) => { control.disabled = false; });
      }
    };
    update();
    timer = setInterval(update, 1000);
  }

  window.LoginLockout = { lock, isLocked: () => button.disabled && /^Coba lagi/.test(button.textContent) };
})();
