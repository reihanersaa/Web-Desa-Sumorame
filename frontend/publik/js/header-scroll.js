(function () {
  const header = document.getElementById("mainHeader");

  if (!header) return;

  const hero = document.getElementById("heroSection");

  function updateHeader() {
    if (window.scrollY <= 0) {
      header.classList.add("header-hidden");
      hero?.classList.add("hero-top");
    } else {
      header.classList.remove("header-hidden");
      hero?.classList.remove("hero-top");
    }
  }

  document.querySelectorAll("#mainHeader .nav-item").forEach(function (item, index) {
    window.setTimeout(function () {
      item.style.opacity = "1";
      item.style.transform = "translateY(0)";
    }, index * 100);
  });

  window.addEventListener("scroll", updateHeader, { passive: true });

  updateHeader();
})();
