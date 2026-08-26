$(document).ready(function () {
  // Inisialisasi Select2 agar dropdownnya rapi sesuai HTML
  $(".select2").select2({
    width: "100%",
  });

  const apiBase = "https://www.emsifa.com/api-wilayah-indonesia/api/";

  // 1. Load Data Provinsi Pertama Kali
  fetch(apiBase + "provinces.json")
    .then((response) => response.json())
    .then((provinces) => {
      let options = '<option value="">-- Pilih Provinsi --</option>';
      provinces.forEach((prov) => {
        options += `<option value="${prov.id}">${prov.name}</option>`;
      });
      $("#provinsi").html(options).trigger("change");
    });

  // 2. Load Kabupaten saat Provinsi dipilih
  $("#provinsi").on("change", function () {
    let idProv = $(this).val();

    // Reset dropdown di bawahnya saat provinsi diganti
    $("#kabupaten")
      .html('<option value="">Loading...</option>')
      .trigger("change");
    $("#kecamatan")
      .html('<option value="">-- Pilih Kecamatan --</option>')
      .trigger("change");
    $("#kelurahan").html('<option value="">-- Pilih Kelurahan --</option>');

    if (idProv) {
      fetch(apiBase + `regencies/${idProv}.json`)
        .then((response) => response.json())
        .then((regencies) => {
          let options = '<option value="">-- Pilih Kab/Kota --</option>';
          regencies.forEach((kab) => {
            options += `<option value="${kab.id}">${kab.name}</option>`;
          });
          $("#kabupaten").html(options);
        });
    } else {
      $("#kabupaten").html('<option value="">-- Pilih Kab/Kota --</option>');
    }
  });

  // 3. Load Kecamatan saat Kabupaten dipilih
  $("#kabupaten").on("change", function () {
    let idKab = $(this).val();

    // Reset dropdown di bawahnya saat kabupaten diganti
    $("#kecamatan")
      .html('<option value="">Loading...</option>')
      .trigger("change");
    $("#kelurahan").html('<option value="">-- Pilih Kelurahan --</option>');

    if (idKab) {
      fetch(apiBase + `districts/${idKab}.json`)
        .then((response) => response.json())
        .then((districts) => {
          let options = '<option value="">-- Pilih Kecamatan --</option>';
          districts.forEach((kec) => {
            options += `<option value="${kec.id}">${kec.name}</option>`;
          });
          $("#kecamatan").html(options);
        });
    } else {
      $("#kecamatan").html('<option value="">-- Pilih Kecamatan --</option>');
    }
  });

  // 4. Load Kelurahan saat Kecamatan dipilih
  $("#kecamatan").on("change", function () {
    let idKec = $(this).val();
    $("#kelurahan").html('<option value="">Loading...</option>');

    if (idKec) {
      fetch(apiBase + `villages/${idKec}.json`)
        .then((response) => response.json())
        .then((villages) => {
          let options = '<option value="">-- Pilih Kelurahan --</option>';
          villages.forEach((kel) => {
            options += `<option value="${kel.id}">${kel.name}</option>`;
          });
          $("#kelurahan").html(options);
        });
    } else {
      $("#kelurahan").html('<option value="">-- Pilih Kelurahan --</option>');
    }
  });

  // Toggle lihat password (sesuai icon mata di HTML)
  $(".toggle-password").click(function () {
    $(this).toggleClass("fa-eye-slash fa-eye");
    let input = $($(this).attr("toggle"));
    if (input.attr("type") == "password") {
      input.attr("type", "text");
    } else {
      input.attr("type", "password");
    }
  });
});

const formRegistrasi = document.getElementById("formRegistrasi");

if (formRegistrasi) {
  formRegistrasi.addEventListener("submit", async function (e) {
    e.preventDefault(); // Mencegah form me-refresh halaman

    // Ambil nilai teks (nama wilayah) dari dropdown API EMSIFA yang menggunakan Select2
    const provinsi = $("#provinsi option:selected").text();
    const kabupaten = $("#kabupaten option:selected").text();
    const kecamatan = $("#kecamatan option:selected").text();
    const kelurahan = $("#kelurahan option:selected").text();

    // Ambil nilai input lainnya
    const payload = {
      nik: document.getElementById("nik").value,
      no_kk: document.getElementById("no_kk").value,
      nama_lengkap: document.getElementById("nama_lengkap").value,
      email: document.getElementById("email").value,
      no_hp: document.getElementById("no_hp").value,
      password: document.getElementById("password").value,
      confirm_password: document.getElementById("confirm_password").value,
      provinsi: provinsi !== "-- Pilih Provinsi --" ? provinsi : "",
      kabupaten: kabupaten !== "-- Pilih Kab/Kota --" ? kabupaten : "",
      kecamatan: kecamatan !== "-- Pilih Kecamatan --" ? kecamatan : "",
      kelurahan: kelurahan !== "-- Pilih Kelurahan --" ? kelurahan : "",
    };

    // Validasi ringan di sisi Frontend agar lebih cepat
    if (payload.password !== payload.confirm_password) {
      return Swal.fire("Gagal", "Konfirmasi password tidak cocok!", "error");
    }
    if (payload.nik.length !== 16 || payload.no_kk.length !== 16) {
      return Swal.fire("Gagal", "NIK dan Nomor KK harus 16 digit!", "error");
    }

    try {
      // PORT disamakan dengan backend (index.js -> PORT || 3000)
      const response = await fetch(`${window.API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        Swal.fire({
          title: "Registrasi Berhasil! 🎉",
          text: "Silakan login menggunakan NIK Anda.",
          icon: "success",
          showConfirmButton: true,
        }).then(() => {
          window.location.href = "login.html"; // Arahkan ke halaman login warga
        });
      } else {
        // Menampilkan pesan error dari Backend (misal NIK ganda)
        Swal.fire("Registrasi Gagal", result.message, "warning");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Swal.fire("Error", "Gagal terhubung ke server backend.", "error");
    }
  });
} else {
  console.error(
    'Form dengan id "formRegistrasi" tidak ditemukan di halaman ini.',
  );
}
