document.addEventListener("DOMContentLoaded", function () {
  // MODAL LUPA PASSWORD
  const forgotBtn = document.getElementById("forgotPassword");
  const modal = document.getElementById("modalForgot");
  const closeModal = document.querySelector(".close-modal");

  forgotBtn.addEventListener("click", function (e) {
    e.preventDefault();
    modal.classList.add("show");
  });

  closeModal.addEventListener("click", function () {
    modal.classList.remove("show");
  });

  /* klik luar modal = tutup */
  window.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.classList.remove("show");
    }
  });

  const form = document.getElementById("loginForm");
  const password = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");

  togglePassword.addEventListener("click", function () {
    if (password.type === "password") {
      password.type = "text";
      this.classList.replace("fa-eye-slash", "fa-eye");
    } else {
      password.type = "password";
      this.classList.replace("fa-eye", "fa-eye-slash");
    }
  });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const nik = document.getElementById("nip").value; // input id="nip" berisi NIK
    const pass = document.getElementById("password").value;

    if (!nik || !pass) {
      return Swal.fire({
        title: "Login Gagal",
        text: "NIK dan Password wajib diisi",
        icon: "error",
        confirmButtonText: "Coba Lagi",
        confirmButtonColor: "#d33",
        background: "#fff5f5",
        color: "#b91c1c",
      });
    }

    try {
      // PORT disamakan dengan backend (index.js -> PORT || 3000)
      const response = await fetch(
        `${window.API_BASE_URL}/auth/login-admin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nik, password: pass }),
        },
      );

      const result = await response.json();

      if (response.ok && result.success) {
        // Simpan token & data admin untuk dipakai di halaman lain
        // (kirim di header: Authorization: Bearer <token>)
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.data));
        localStorage.setItem("login", "true");
        localStorage.setItem("admin", JSON.stringify(result.data));

        const redirectAduan = localStorage.getItem("redirectAduan");

        if (redirectAduan) {
          localStorage.removeItem("redirectAduan");
          window.location.href = "/admin/Pengaduan";
        } else {
          Swal.fire({
            title: "Login Berhasil 🎉",
            text: "Selamat datang, " + result.data.nama_lengkap,
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
            background: "#f0fff4",
            color: "#2e7d32",
          }).then(() => {
            window.location.href = "/admin/DashboardAdmin";
          });
        }
      } else {
        // Pesan error dari backend, misal: "Akses ditolak. NIK ini terdaftar sebagai Warga, bukan Admin!"
        Swal.fire({
          title: "Login Gagal",
          text: result.message || "NIK atau Password yang Anda masukkan salah",
          icon: "error",
          confirmButtonText: "Coba Lagi",
          confirmButtonColor: "#d33",
          background: "#fff5f5",
          color: "#b91c1c",
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Swal.fire({
        title: "Error",
        text: "Gagal terhubung ke server backend.",
        icon: "error",
        confirmButtonColor: "#d33",
        background: "#fff5f5",
        color: "#b91c1c",
      });
    }
  });
});
