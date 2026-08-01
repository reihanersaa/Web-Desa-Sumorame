$(document).ready(function(){

  $('.select2').select2({
    placeholder: "Pilih Data",
    allowClear: true
  });

  const prov = $("#provinsi");
  const kab = $("#kabupaten");
  const kec = $("#kecamatan");
  const kel = $("#kelurahan");

  /* FUNCTION SET NO OPTIONS */
  function setNoOptions(select, text = "No options"){
    select.empty().append(`<option value="">${text}</option>`).trigger('change');
  }

  /* DEFAULT STATE */
  setNoOptions(kab);
  setNoOptions(kec);
  setNoOptions(kel);

  /* LOAD PROVINSI */
  $.get("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json", function(data){
    prov.append('<option value=""></option>');
    data.forEach(item=>{
      prov.append(`<option value="${item.id}">${item.name}</option>`);
    });
  });

  /* PROVINSI CHANGE */
  prov.on("change", function(){

    setNoOptions(kab);
    setNoOptions(kec);
    setNoOptions(kel);

    if(!this.value) return;

    $.get(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${this.value}.json`, function(data){
      kab.empty().append('<option value=""></option>');
      data.forEach(item=>{
        kab.append(`<option value="${item.id}">${item.name}</option>`);
      });
    });
  });

  /* KAB CHANGE */
  kab.on("change", function(){

    setNoOptions(kec);
    setNoOptions(kel);

    if(!this.value) return;

    $.get(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${this.value}.json`, function(data){
      kec.empty().append('<option value=""></option>');
      data.forEach(item=>{
        kec.append(`<option value="${item.id}">${item.name}</option>`);
      });
    });
  });

  /* KEC CHANGE */
  kec.on("change", function(){

    setNoOptions(kel);

    if(!this.value) return;

    $.get(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${this.value}.json`, function(data){
      kel.empty().append('<option value=""></option>');
      data.forEach(item=>{
        kel.append(`<option value="${item.id}">${item.name}</option>`);
      });
    });
  });

    // TOGGLE PASSWORD
    $(".toggle-password").click(function () {
    const input = $($(this).attr("toggle"));

    if (input.attr("type") === "password") {
      input.attr("type", "text");
      $(this).removeClass("fa-eye-slash").addClass("fa-eye");
    } else {
      input.attr("type", "password");
      $(this).removeClass("fa-eye").addClass("fa-eye-slash");
    }
  });

      // ================= VALIDASI REALTIME =================
      // NIK & NO KK hanya angka + max 16 digit
      $("#nik, #nokk").on("input", function(){
        this.value = this.value.replace(/[^0-9]/g, '').slice(0,16);
      });

      // TELEPON hanya angka
      $("#telepon").on("input", function(){
        this.value = this.value.replace(/[^0-9]/g, '');
      });

      // NAMA hanya huruf
      $("#nama").on("input", function(){
        this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
      });

      // VALIDASI EMAIL
      function validEmail(email){
        return email.includes("@") && email.includes(".com");
      }

      // ================= SUBMIT FORM =================
      $("#form").submit(function(e){
        e.preventDefault();

        const nik = $("#nik").val().trim();
        const nokk = $("#nokk").val().trim();
        const nama = $("#nama").val().trim();
        const email = $("#email").val().trim();
        const telepon = $("#telepon").val().trim();
        const password = $("#password").val();
        const konfirmasi = $("#konfirm_password").val();

        // CEK KOSONG
        if(
          !nik || !nokk || !nama || !email || !telepon || !password || !konfirmasi ||
          !$("#provinsi").val() ||
          !$("#kabupaten").val() ||
          !$("#kecamatan").val() ||
          !$("#kelurahan").val()
        ){
          Swal.fire({
            title: "Peringatan ⚠️",
            text: "Kolom tidak boleh kosong!",
            icon: "warning",
            background: "#f0fff4",
            color: "#2e7d32",
            confirmButtonColor: "#2e7d32"
          });
          return;
        }

        // VALIDASI PANJANG NIK & KK
        if(nik.length !== 16 || nokk.length !== 16){
          Swal.fire({
            title: "Error",
            text: "NIK dan No KK harus 16 digit!",
            icon: "error",
            background: "#fff5f5",
            color: "#b91c1c",
            confirmButtonColor: "#d33"
          });
          return;
        }

        // VALIDASI EMAIL
        if(!validEmail(email)){
          Swal.fire({
            title: "Error",
            text: "Email harus mengandung @ dan .com",
            icon: "error",
            background: "#fff5f5",
            color: "#b91c1c",
            confirmButtonColor: "#d33"
          });
          return;
        }

        // VALIDASI PASSWORD
        if(password !== konfirmasi){
          Swal.fire({
            title: "Konfirmasi Password Salah ❌",
            text: "Konfirmasi password harus sama dengan password",
            icon: "error",
            background: "#fff5f5",
            color: "#b91c1c",
            confirmButtonColor: "#d33"
          });
          return;
        }

        const provinsi = $("#provinsi option:selected").text();
        const kabupaten = $("#kabupaten option:selected").text();
        const kecamatan = $("#kecamatan option:selected").text();
        const kelurahan = $("#kelurahan option:selected").text();

        // ================= KONFIRMASI =================
        Swal.fire({
          title: "Konfirmasi Data ❓",
          html: `
            <div style="text-align:left;font-size:13px;color:#2e7d32">
              <b>NIK:</b> ${nik}<br>
              <b>No KK:</b> ${nokk}<br>
              <b>Nama:</b> ${nama}<br>
              <b>Email:</b> ${email}<br>
              <b>Telepon:</b> ${telepon}<br><br>

              <b>📍 Wilayah</b><br>
              <b>Provinsi:</b> ${provinsi}<br>
              <b>Kab/Kota:</b> ${kabupaten}<br>
              <b>Kecamatan:</b> ${kecamatan}<br>
              <b>Kelurahan:</b> ${kelurahan}
            </div>
            <br><b>Apakah data sudah benar?</b>
          `,
          icon: "question",
          background: "#f0fff4",
          color: "#2e7d32",
          showCancelButton: true,
          confirmButtonText: "Ya, Benar",
          cancelButtonText: "Tidak",
          confirmButtonColor: "#2e7d32",
          cancelButtonColor: "#d33"
        }).then((result) => {

          if(result.isConfirmed){

            Swal.fire({
              title: "Berhasil 🎉",
              text: "Selamat pendaftaran telah berhasil",
              icon: "success",
              background: "#f0fff4",
              color: "#2e7d32",
              showConfirmButton: false,
              timer: 6000,
              timerProgressBar: true
            });

            setTimeout(() => {
              window.location.href = "login.html";
            }, 6000);

          }

        });

      });

  });