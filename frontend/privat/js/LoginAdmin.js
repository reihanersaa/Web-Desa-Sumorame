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

    const username = document.getElementById("username").value.trim().toLowerCase();
    const pass = document.getElementById("password").value;

    if (!username || !pass) {
      return Swal.fire({
        title: "Login Gagal",
        text: "Username dan password wajib diisi",
        icon: "error",
        confirmButtonText: "Coba Lagi",
        confirmButtonColor: "#d33",
        background: "#fff5f5",
        color: "#b91c1c",
      });
    }

    if (!/^[a-z0-9][a-z0-9._-]{2,39}$/.test(username)) {
      return Swal.fire({ title: "Login Gagal", text: "Format username petugas tidak valid.", icon: "error" });
    }

    let turnstileToken;
    try {
      turnstileToken = await window.LoginSecurity.getToken();
    } catch (error) {
      return Swal.fire({ title: "Verifikasi Diperlukan", text: error.message, icon: "warning" });
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton.disabled) return;
    submitButton.disabled = true;
    const oldLabel = submitButton.textContent;
    submitButton.textContent = "Memeriksa akun...";
    try {
      // PORT disamakan dengan backend (index.js -> PORT || 3000)
      const response = await fetch(
        `${window.API_BASE_URL}/auth/login-admin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password: pass, turnstileToken }),
        },
      );

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success) {
        // Simpan token & data admin untuk dipakai di halaman lain
        // (kirim di header: Authorization: Bearer <token>)
        window.AdminSession.saveLogin(result);

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
            window.location.href = result.data.role === "petugas_posbankum"
              ? "/admin/Posbankum"
              : "/admin/DashboardAdmin";
          });
        }
      } else {
        // Password tetap sama; username berasal dari akun admin hasil migration.
        Swal.fire({
          title: "Login Gagal",
          text: result.message || "Username atau password salah",
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
    } finally {
      window.LoginSecurity.reset();
      submitButton.disabled = false;
      submitButton.textContent = oldLabel;
    }
  });
});
