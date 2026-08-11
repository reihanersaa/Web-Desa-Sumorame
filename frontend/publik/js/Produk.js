// === Menu NavBar Mobile ===
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

let isOpen = false;

menuBtn.addEventListener("click", () => {
  isOpen = !isOpen;

  if (isOpen) {
    mobileMenu.classList.remove("max-h-0", "opacity-0");
    mobileMenu.classList.add("max-h-[500px]", "opacity-100");
    menuBtn.textContent = "close";
  } else {
    mobileMenu.classList.remove("max-h-[500px]", "opacity-100");
    mobileMenu.classList.add("max-h-0", "opacity-0");
    menuBtn.textContent = "menu";
  }
});

document.addEventListener("click", (e) => {
  const isClickInsideMenu = mobileMenu.contains(e.target);
  const isClickButton = menuBtn.contains(e.target);

  if (isOpen && !isClickInsideMenu && !isClickButton) {
    mobileMenu.classList.remove("max-h-[500px]", "opacity-100");
    mobileMenu.classList.add("max-h-0", "opacity-0");
    menuBtn.textContent = "menu";
    isOpen = false;
  }
});


// ===== Animasi Footer =====
const footer = document.getElementById("footer");
const footerItems = document.querySelectorAll(".footer-item");

window.addEventListener("scroll", () => {

  const trigger = window.innerHeight;

  if (footer.getBoundingClientRect().top < trigger - 100) {

    footer.classList.remove(
      "opacity-0",
      "translate-y-10"
    );

    footerItems.forEach((item, i) => {

      setTimeout(() => {

        item.classList.remove(
          "opacity-0",
          "translate-y-6"
        );

      }, i * 200);

    });

  }

});


// === Animasi Header ===
const heroItems = document.querySelectorAll(".hero-item");

window.addEventListener("load", () => {

  heroItems.forEach((item, i) => {

    setTimeout(() => {

      item.classList.remove(
        "opacity-0",
        "-translate-x-16"
      );

    }, i * 200);

  });

});


// === Animasi Navbar ===
const navItems = document.querySelectorAll(".nav-item");

window.addEventListener("load", () => {

  navItems.forEach((item, i) => {

    setTimeout(() => {

      item.style.opacity = "1";
      item.style.transform = "translateY(0)";

    }, i * 100);

  });

});


// === Animasi Kontak ===
const kontakItems = document.querySelectorAll(".kontak-item");

window.addEventListener("scroll", () => {

  const trigger = window.innerHeight;

  if (footer.getBoundingClientRect().top < trigger - 100) {

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


// === Animasi Suara Untuk Navbar ===
    document.addEventListener("DOMContentLoaded", () => {

    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(item => {
      item.addEventListener("mouseenter", () => {
        const text = item.textContent.trim();

        if (!text) return;

        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "id-ID";
        speech.rate = 1;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(speech);
      });
    });

  });

// === Animasi Card Produk ===
const produk = document.querySelector("#produk");
const produkItems = document.querySelectorAll("#produk .produk-item");

let produkAnimated = false;

function showProduk() {

    if (produkAnimated) return;

    const trigger = window.innerHeight;

    if (produk.getBoundingClientRect().top < trigger - 100) {

        produkAnimated = true;

        produkItems.forEach((item, i) => {

            setTimeout(() => {

                item.classList.add("show");

            }, i * 180);

        });

    }

}

window.addEventListener("load", showProduk);
window.addEventListener("scroll", showProduk);


// === Search Produk ===
const searchInput = document.querySelector('input[type="text"]');

searchInput.addEventListener("keyup", function () {

    const keyword = this.value.toLowerCase();

    produkItems.forEach((card) => {

        const namaProduk = card.querySelector("h3").textContent.toLowerCase();
        const penjual = card.querySelector("span").textContent.toLowerCase();

        if (
            namaProduk.includes(keyword) ||
            penjual.includes(keyword)
        ) {

            card.style.display = "block";

        } else {

            card.style.display = "none";

        }

    });

});


// === Hover Tombol Pasarkan Produk ===
const btnPasarkan = document.querySelector("main a");

btnPasarkan.addEventListener("mouseenter", () => {

    btnPasarkan.classList.add(
        "scale-105",
        "-translate-y-1",
        "shadow-2xl"
    );

});

btnPasarkan.addEventListener("mouseleave", () => {

    btnPasarkan.classList.remove(
        "scale-105",
        "-translate-y-1",
        "shadow-2xl"
    );

});


// === Tombol Beli ===
const beliButtons = document.querySelectorAll("button");

beliButtons.forEach((btn) => {

    btn.addEventListener("click", () => {

        const namaProduk =
            btn.parentElement.querySelector("h3").textContent;

        Swal.fire({

            icon: "success",
            title: "Produk Dipilih",

            html: `
                <b>${namaProduk}</b><br><br>
                Produk berhasil dimasukkan ke daftar pembelian.
            `,

            confirmButtonColor: "#166534"

        });

    });

});


// === Hover Card Produk ===
produkItems.forEach((card) => {

    card.addEventListener("mouseenter", () => {

        card.style.transform = "translateY(-10px)";
        card.style.transition = "0.35s ease";

    });

    card.addEventListener("mouseleave", () => {

        card.style.transform = "translateY(0px)";

    });

});


// === Efek Zoom Gambar Produk ===
const gambarProduk = document.querySelectorAll(".group img");

gambarProduk.forEach((img) => {

    img.addEventListener("mouseenter", () => {

        img.style.transition = "0.5s";
        img.style.transform = "scale(1.1)";

    });

    img.addEventListener("mouseleave", () => {

        img.style.transform = "scale(1)";

    });

});