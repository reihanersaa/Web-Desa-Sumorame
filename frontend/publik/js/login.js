document.addEventListener("DOMContentLoaded", function () {

  // ================= MODAL LUPA PASSWORD =================
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

  // ================= TOGGLE PASSWORD =================
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

  // ================= PROSES SUBMIT LOGIN (KE BACKEND) =================
  form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const nip = document.getElementById("nip").value.trim();
    const pass = document.getElementById("password").value.trim();

    if (!nip || !pass) {
      Swal.fire({
        title: "Peringatan",
        text: "NIK dan Password wajib diisi!",
        icon: "warning",
        confirmButtonColor: "#f59e0b"
      });
      return;
    }

    // Tampilkan animasi loading
    Swal.fire({
      title: 'Mengecek Data...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      // 1. KIRIM REQUEST KE BACKEND
      // Pastikan port (3000) sesuai dengan server backend-mu
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nik: nip, password: pass })
      });

      const result = await response.json();

      if (response.ok) {
        // ====================================================
        // 2. JIKA BERHASIL: SIMPAN TOKEN & DATA USER
        // ====================================================
        localStorage.setItem("token", result.token); 
        localStorage.setItem("login", "true"); // Untuk kompatibilitas cek UI lama
        
        // Simpan data diri untuk memudahkan isi form otomatis nantinya
        localStorage.setItem("user_nama", result.data.nama_lengkap);
        localStorage.setItem("user_nik", result.data.nik);
        localStorage.setItem("user_role", result.data.role);

        // 3. LOGIKA REDIRECT
        const redirectAduan = localStorage.getItem("redirectAduan");

        if (redirectAduan) {
          localStorage.removeItem("redirectAduan");
          window.location.href = "Aduan.html";
        } else {
          Swal.fire({
            title: "Login Berhasil 🎉",
            text: `Selamat datang, ${result.data.nama_lengkap}!`,
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
            background: "#f0fff4",
            color: "#2e7d32"
          }).then(() => {
            window.location.href = "index.html"; // Redirect ke halaman utama desa
          });
        }

      } else {
        // ====================================================
        // 4. JIKA GAGAL: TAMPILKAN PESAN DARI BACKEND
        // ====================================================
        Swal.fire({
          title: "Login Gagal",
          text: result.message || "NIK atau Password salah",
          icon: "error",
          confirmButtonText: "Coba Lagi",
          confirmButtonColor: "#d33",
          background: "#fff5f5",
          color: "#b91c1c"
        });
      }
    } catch (error) {
      console.error("Error Fetch Login:", error);
      Swal.fire({
        title: "Server Error",
        text: "Gagal terhubung ke server. Pastikan backend Node.js sudah berjalan.",
        icon: "error",
        confirmButtonColor: "#d33"
      });
    }
  });
});