(function () {
  const header = document.getElementById("mainHeader");

  if (!header) return;

  let lastScrollY = Math.max(window.scrollY, 0);
  let ticking = false;

  header.style.transition = "transform 0.3s ease";

  function updateHeader() {
    const currentScrollY = Math.max(window.scrollY, 0);

    if (currentScrollY <= 0 || currentScrollY < lastScrollY) {
      header.classList.remove("header-hidden");
      header.style.transform = "translateY(0)";
    } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
      header.classList.add("header-hidden");
      header.style.transform = "translateY(-100%)";
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    },
    { passive: true },
  );

  header.classList.remove("header-hidden");
  header.style.transform = "translateY(0)";
})();
