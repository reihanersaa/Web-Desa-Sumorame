document.addEventListener("DOMContentLoaded", function () {
  function getSafeRedirect(value) {
    if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
      return null;
    }
    return value;
  }
  // ================= MODAL LUPA PASSWORD =================
  const forgotBtn = document.getElementById("forgotPassword");
  const modal = document.getElementById("modalForgot");
  const closeModal = document.querySelector(".close-modal");

  if (forgotBtn && modal && closeModal) {
    forgotBtn.addEventListener("click", function (e) {
      e.preventDefault();
      modal.classList.add("show");
    });

    closeModal.addEventListener("click", function () {
      modal.classList.remove("show");
    });

    window.addEventListener("click", function (e) {
      if (e.target === modal) {
        modal.classList.remove("show");
      }
    });
  }

  // ================= TOGGLE PASSWORD =================
  const form = document.getElementById("loginForm");
  const password = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");

  if (togglePassword && password) {
    togglePassword.addEventListener("click", function () {
      if (password.type === "password") {
        password.type = "text";
        this.classList.replace("fa-eye-slash", "fa-eye");
      } else {
        password.type = "password";
        this.classList.replace("fa-eye", "fa-eye-slash");
      }
    });
  }

  // ================= PROSES SUBMIT LOGIN (KE BACKEND) =================
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const nip = document.getElementById("nip").value.trim();
      const pass = document.getElementById("password").value.trim();

      if (!nip || !pass) {
        Swal.fire({
          title: "Peringatan",
          text: "NIK dan Password wajib diisi!",
          icon: "warning",
          confirmButtonColor: "#f59e0b",
        });
        return;
      }

      // Animasi loading
      Swal.fire({
        title: "Mengecek Data...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        // Sesuaikan URL dan Port Backend kamu
        const response = await fetch(`${window.API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nik: nip, password: pass }),
        });

        const result = await response.json();

        if (response.ok) {
          // 1. JIKA BERHASIL: SIMPAN TOKEN & DATA USER
          localStorage.setItem("token", result.token);
          localStorage.setItem("login", "true");

          if (result.data) {
            localStorage.setItem("user_nama", result.data.nama_lengkap || "");
            localStorage.setItem("user_nik", result.data.nik || "");
            localStorage.setItem("user_role", result.data.role || "");
          }

          // 2. LOGIKA REDIRECT
          const redirectAfterLogin = getSafeRedirect(
            localStorage.getItem("redirectAfterLogin"),
          );
          const redirectAduan = localStorage.getItem("redirectAduan");

          if (redirectAfterLogin) {
            localStorage.removeItem("redirectAfterLogin");
            window.location.href = redirectAfterLogin;
          } else if (redirectAduan) {
            localStorage.removeItem("redirectAduan");
            window.location.href = "/Aduan";
          } else {
            Swal.fire({
              title: "Login Berhasil 🎉",
              text: `Selamat datang, ${result.data?.nama_lengkap || "Pengguna"}!`,
              icon: "success",
              showConfirmButton: false,
              timer: 2000,
              background: "#f0fff4",
              color: "#2e7d32",
            }).then(() => {
              window.location.href = result.data?.role === "admin"
                ? "/admin/DashboardAdmin"
                : "/";
            });
          }
        } else {
          // 3. JIKA GAGAL: TAMPILKAN PESAN DARI BACKEND
          Swal.fire({
            title: "Login Gagal",
            text: result.message || "NIK atau Password salah",
            icon: "error",
            confirmButtonText: "Coba Lagi",
            confirmButtonColor: "#d33",
            background: "#fff5f5",
            color: "#b91c1c",
          });
        }
      } catch (error) {
        console.error("Error Fetch Login:", error);
        Swal.fire({
          title: "Server Error",
          text: "Gagal terhubung ke server. Pastikan backend Node.js sudah berjalan.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    });
  }
});
