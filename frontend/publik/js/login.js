document.addEventListener("DOMContentLoaded", function () {

      // MODAL LUPA PASSWORD
      const forgotBtn = document.getElementById("forgotPassword");
      const modal = document.getElementById("modalForgot");
      const closeModal = document.querySelector(".close-modal");

      forgotBtn.addEventListener("click", function(e) {
        e.preventDefault();
        modal.classList.add("show");
      });

      closeModal.addEventListener("click", function() {
        modal.classList.remove("show");
      });

      /* klik luar modal = tutup */
      window.addEventListener("click", function(e) {
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

      form.addEventListener("submit", function(e) {
      e.preventDefault();

      const nip = document.getElementById("nip").value;
      const pass = document.getElementById("password").value;

      if (nip === "admin" && pass === "123") {

        localStorage.setItem("login", "true");

        const redirectAduan = localStorage.getItem("redirectAduan");

        if (redirectAduan) {
          localStorage.removeItem("redirectAduan");
          window.location.href = "Aduan.html";
        } else {
            // ✅ default ke halaman utama
            Swal.fire({
            title: "Login Berhasil 🎉",
            text: "Selamat datang di Dashboard Desa Tawangsari",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
            background: "#f0fff4",
            color: "#2e7d32"
          }).then(() => {
            window.location.href = "index.html";
          });
        }

      } else {
          Swal.fire({
          title: "Login Gagal",
          text: "NIK atau Password yang Anda masukkan salah",
          icon: "error",
          confirmButtonText: "Coba Lagi",
          confirmButtonColor: "#d33",
          background: "#fff5f5",
          color: "#b91c1c"
        });
      }
    });
  });