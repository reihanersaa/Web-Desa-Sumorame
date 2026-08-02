document.addEventListener("DOMContentLoaded", () => {

  // =============================
  // ANIMASI CARD + MAP + BANNER
  // =============================
  const cards = document.querySelectorAll('.ppid-menu, .ppid-card, .map-card');
  const banners = document.querySelectorAll('.banner-item');

  const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {

      entry.target.classList.remove('opacity-0', 'translate-y-10');
      entry.target.classList.add('opacity-100', 'translate-y-0');

      if (entry.target.classList.contains('map-card')) {
        banners.forEach((b, i) => {
          setTimeout(() => {
            b.classList.remove('opacity-0', 'translate-y-4');
            b.classList.add('opacity-100', 'translate-y-0');
          }, i * 150);
        });
      }

      observer.unobserve(entry.target);
    }
  });
}, { 
  threshold: 0,
  rootMargin: "0px 0px -100px 0px" // 🔥 ini kunci
});

  cards.forEach(card => observer.observe(card));

  // =============================
  // NAVBAR MOBILE
  // =============================
  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  let isOpen = false;

  menuBtn.addEventListener("click", () => {
    isOpen = !isOpen;

    mobileMenu.classList.toggle("max-h-0");
    mobileMenu.classList.toggle("opacity-0");
    mobileMenu.classList.toggle("max-h-[600px]");
    mobileMenu.classList.toggle("opacity-100");

    menuBtn.textContent = isOpen ? "close" : "menu";
  });

  document.addEventListener("click", (e) => {
    if (isOpen && !mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
      mobileMenu.classList.add("max-h-0", "opacity-0");
      mobileMenu.classList.remove("max-h-[600px]", "opacity-100");
      menuBtn.textContent = "menu";
      isOpen = false;
    }
  });

  // =============================
  // NAVBAR ANIMATION
  // =============================
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item, i) => {
    setTimeout(() => {
      item.style.opacity = "1";
      item.style.transform = "translateY(0)";
    }, i * 100);
  });

  // =============================
  // HERO ANIMATION
  // =============================
  const heroItems = document.querySelectorAll(".hero-item");

  heroItems.forEach((item, i) => {
    setTimeout(() => {
      item.classList.remove("opacity-0", "-translate-x-16");
    }, i * 200);
  });

  // =============================
  // SCROLL ANIMATION (FOOTER + KONTAK)
  // =============================
  const footer = document.getElementById("footer");
  const footerItems = document.querySelectorAll(".footer-item");
  const kontakItems = document.querySelectorAll(".kontak-item");

  window.addEventListener("scroll", () => {
    const trigger = window.innerHeight;

    if (footer.getBoundingClientRect().top < trigger - 100) {

      footer.classList.remove("opacity-0", "translate-y-10");

      footerItems.forEach((item, i) => {
        setTimeout(() => {
          item.classList.remove("opacity-0", "translate-y-6");
        }, i * 200);
      });

      kontakItems.forEach((item, i) => {
        setTimeout(() => {
          item.classList.remove(
            "opacity-0",
            "-translate-y-6",
            "-translate-x-10",
            "translate-x-10",
            "translate-y-10"
          );
        }, i * 200);
      });

    }
  });

  // =============================
  // SOUND NAVBAR (FIXED - NO DUPLICATE)
  // =============================
  navItems.forEach(item => {
    item.addEventListener("mouseenter", () => {
      const text = item.textContent.trim();
      if (!text) return;

      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = "id-ID";

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(speech);
    });
  });

});
  // =============================
  // MODAL TIME LINE
  // =============================
  const modal = document.getElementById("modalTimeline");
  const modalBox = document.getElementById("modalBox");

  function openModal() {
    modal.classList.remove("hidden");

    modal.classList.add("opacity-0");
    modalBox.classList.add("scale-90", "opacity-0");

    requestAnimationFrame(() => {
      modal.classList.remove("opacity-0");
      modalBox.classList.remove("scale-90", "opacity-0");
      modalBox.classList.add("scale-100", "opacity-100");
    });
  }

  function closeModal() {
    modal.classList.add("opacity-0");
    modalBox.classList.remove("scale-100", "opacity-100");
    modalBox.classList.add("scale-90", "opacity-0");

    setTimeout(() => {
      modal.classList.add("hidden");
    }, 300);
  }

  // klik luar
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

    // =============================
    // MODAL PENGUMUMAN
    // =============================
    function openModalPengumuman() {
    const modal = document.getElementById("modalPengumuman");
    const box = document.getElementById("modalBoxPengumuman");

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    // reset dulu
    modal.classList.add("opacity-0");
    box.classList.add("scale-90", "opacity-0");

    requestAnimationFrame(() => {
      modal.classList.remove("opacity-0");
      box.classList.remove("scale-90", "opacity-0");
      box.classList.add("scale-100", "opacity-100");
    });
  }

  function closeModalPengumuman() {
    const modal = document.getElementById("modalPengumuman");
    const box = document.getElementById("modalBoxPengumuman");

    modal.classList.add("opacity-0");
    box.classList.remove("scale-100", "opacity-100");
    box.classList.add("scale-90", "opacity-0");

    setTimeout(() => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }, 300);
  }

  // klik luar
  const modalPengumuman = document.getElementById("modalPengumuman");

  modalPengumuman.addEventListener("click", (e) => {
    if (e.target === modalPengumuman) closeModalPengumuman();
  });

  function ripple(e) {
  const button = e.currentTarget;

  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${e.clientX - button.offsetLeft - diameter / 2}px`;
  circle.style.top = `${e.clientY - button.offsetTop - diameter / 2}px`;

  circle.classList.add("ripple");

  const ripple = button.getElementsByClassName("ripple")[0];
  if (ripple) ripple.remove();

  button.appendChild(circle);
}

  // =============================
  // MODAL LAYANAN INFORMASI
  // =============================
  function openModalLayanan() {
  const modal = document.getElementById("modalLayanan");
  const box = document.getElementById("modalBoxLayanan");

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  modal.classList.add("opacity-0");
  box.classList.add("scale-90", "opacity-0");

  requestAnimationFrame(() => {
    modal.classList.remove("opacity-0");
    box.classList.remove("scale-90", "opacity-0");
    box.classList.add("scale-100", "opacity-100");
  });
}

function closeModalLayanan() {
  const modal = document.getElementById("modalLayanan");
  const box = document.getElementById("modalBoxLayanan");

  modal.classList.add("opacity-0");
  box.classList.remove("scale-100", "opacity-100");
  box.classList.add("scale-90", "opacity-0");

  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }, 300);
}

// klik luar = close
document.getElementById("modalLayanan").addEventListener("click", function(e) {
  if (e.target === this) closeModalLayanan();
});

function goToSlide(index) {
  const container = document.getElementById("slideContainer");
  container.style.transform = `translateX(-${index * 100}%)`;
}