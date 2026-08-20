document.addEventListener("DOMContentLoaded", function () {
  // 1. Ambil semua elemen dari HTML
  const btnProduk = document.getElementById("btnProduk");
  const produkModal = document.getElementById("produkModal");
  const closeProdukModal = document.getElementById("closeProdukModal");
  const cancelProduk = document.getElementById("cancelProduk");
  const produkModalContent = document.getElementById("produkModalContent");
  const formProduk = document.getElementById("formProduk");

  // 2. Fungsi Buka Modal
  function openModal() {
    produkModal.classList.remove("hidden");
    produkModal.classList.add("flex");
    setTimeout(() => {
      produkModalContent.classList.remove("scale-95", "opacity-0");
      produkModalContent.classList.add("scale-100", "opacity-100");
    }, 10);
  }

  // 3. Fungsi Tutup Modal
  function closeModal() {
    produkModalContent.classList.remove("scale-100", "opacity-100");
    produkModalContent.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
      produkModal.classList.add("hidden");
      produkModal.classList.remove("flex");
      formProduk.reset(); // Reset isi form saat ditutup
    }, 300);
  }

  // 4. Pasang Event Listener ke Tombol
  if (btnProduk) btnProduk.addEventListener("click", openModal);
  if (closeProdukModal) closeProdukModal.addEventListener("click", closeModal);
  if (cancelProduk) cancelProduk.addEventListener("click", closeModal);

  // 5. Mencegah modal tertutup saat area dalam form diklik
  if (produkModalContent) {
    produkModalContent.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }

  // 6. Alert kalau form disubmit
  if (formProduk) {
    formProduk.addEventListener("submit", function (e) {
      e.preventDefault(); // Mencegah reload halaman
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Pengajuan produk Anda berhasil dikirim.",
        confirmButtonColor: "#004b24",
      }).then(() => {
        closeModal();
      });
    });
  }
});
