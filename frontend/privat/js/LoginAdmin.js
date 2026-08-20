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

      form.addEventListener("submit", async function(e) {
      e.preventDefault();

      const nip = document.getElementById("nip").value;
      const pass = document.getElementById("password").value;

      try {
        const response = await fetch(`${window.API_BASE_URL || "http://localhost:3000/api"}/auth/login-admin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nik: nip.trim(), password: pass }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || "NIP atau password salah.");

        localStorage.setItem("login", "true");
        localStorage.setItem("token", result.token);
        localStorage.setItem("admin", JSON.stringify(result.data));

        const redirectAduan = localStorage.getItem("redirectAduan");

        if (redirectAduan) {
          localStorage.removeItem("redirectAduan");
          window.location.href = "Aduan.html";
        } else {
            // ✅ default ke halaman utama
            Swal.fire({
            title: "Login Berhasil 🎉",
            text: "Selamat datang",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
            background: "#f0fff4",
            color: "#2e7d32"
          }).then(() => {
            window.location.href = "DashboardAdmin.html";
          });
        }

      } catch (error) {
          Swal.fire({
          title: "Login Gagal",
          text: error.message,
          icon: "error",
          confirmButtonText: "Coba Lagi",
          confirmButtonColor: "#d33",
          background: "#fff5f5",
          color: "#b91c1c"
        });
      }
    });
  });
