const burgerBtn = document.getElementById('burgerBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const mainContent = document.getElementById('mainContent');
const headerLeft = document.getElementById('headerLeft');

if (burgerBtn && sidebar && overlay && mainContent && headerLeft) {
  burgerBtn.addEventListener('click', () => {
    if (window.innerWidth < 768) {
      sidebar.classList.toggle('-translate-x-full');
      overlay.classList.toggle('hidden');
    } else {
      sidebar.classList.toggle('w-64');
      sidebar.classList.toggle('w-20');
      headerLeft.classList.toggle('w-64');
      headerLeft.classList.toggle('w-20');
      mainContent.classList.toggle('md:pl-64');
      mainContent.classList.toggle('md:pl-20');

      document.querySelectorAll('.menu-text').forEach(el => {
        el.classList.toggle('hidden');
      });
    }
  });
}

// ================= DROPDOWN SURAT MENYURAT =================
const suratToggle = document.getElementById('suratToggle');
const suratMenu = document.getElementById('suratMenu');
const suratIcon = document.getElementById('suratIcon');

if (suratToggle && suratMenu && suratIcon) {
  suratToggle.addEventListener('click', () => {
    if (suratMenu.classList.contains('max-h-0')) {
      // Buka dropdown
      suratMenu.classList.remove('max-h-0', 'opacity-0');
      suratMenu.classList.add('max-h-96', 'opacity-100'); 
    } else {
      // Tutup dropdown
      suratMenu.classList.remove('max-h-96', 'opacity-100');
      suratMenu.classList.add('max-h-0', 'opacity-0');
    }
    // Putar ikon panah
    suratIcon.classList.toggle('rotate-180');
  });
}

if (overlay && sidebar) {
  overlay.addEventListener('click', () => {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
  });
}

// ================= DROPDOWN KELOLA WEBSITE =================
const cmsToggle = document.getElementById('cmsToggle');
const cmsMenu = document.getElementById('cmsMenu');
const cmsIcon = document.getElementById('cmsIcon');

// Pengecekan if: Kode ini hanya jalan jika tombol cmsToggle ada di halaman
if (cmsToggle && cmsMenu && cmsIcon) {
  cmsToggle.addEventListener('click', () => {
    if (cmsMenu.classList.contains('max-h-0')) {
      cmsMenu.classList.remove('max-h-0', 'opacity-0');
      // UBAH BAGIAN INI: Ganti max-h-40 menjadi max-h-96
      cmsMenu.classList.add('max-h-96', 'opacity-100'); 
    } else {
      // UBAH BAGIAN INI JUGA: Sesuaikan dengan yang di atas
      cmsMenu.classList.remove('max-h-96', 'opacity-100');
      cmsMenu.classList.add('max-h-0', 'opacity-0');
    }
    cmsIcon.classList.toggle('rotate-180');
  });
}

// ================= CHART (Hanya untuk Dashboard Utama) =================
const ctx = document.getElementById('myChart');

if (ctx) {
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Aduan', 'Surat Menyurat', 'Publikasi', 'Informasi'],
      datasets: [{
        label: 'Jumlah Data',
        data: [25, 30, 37, 5],
        backgroundColor: ['#8b5cf6', '#22c55e', '#f59e0b', '#ef4444'],
        borderColor: ['#8b5cf6', '#15803d', '#b45309', '#b91c1c'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1500, easing: 'easeOutQuart' },
      animations: { y: { from: 0 } },
      plugins: { legend: { display: true } },
      scales: { y: { beginAtZero: true, min: 0 } }
    }
  });
}

// ================= COUNT UP (Hanya untuk Dashboard Utama) =================
function countUp(id, target) {
  let el = document.getElementById(id);
  // Keluar dari fungsi jika elemen tidak ada di halaman ini
  if (!el) return; 

  let count = 0;
  let speed = target / 80;

  let interval = setInterval(() => {
    count += speed;
    if (count >= target) {
      el.innerText = target;
      clearInterval(interval);
    } else {
      el.innerText = Math.floor(count);
    }
  }, 20);
}

// Menjalankan animasi angka (akan diabaikan otomatis jika elemennya tidak ada)
countUp("aduan", 25);
countUp("surat", 30);
countUp("publikasi", 40);
countUp("info", 63);

// ================= COUNTER =================
const counters = document.querySelectorAll('.counter');
if (counters.length > 0) {
  counters.forEach(counter => {
    const target = +counter.innerText;
    counter.innerText = 0;

    const update = () => {
      const current = +counter.innerText;
      const increment = target / 60;
      if (current < target) {
        counter.innerText = Math.ceil(current + increment);
        setTimeout(update, 20);
      } else {
        counter.innerText = target;
      }
    };
    update();
  });
}

// ================= PROGRESS ANIMATION =================
window.addEventListener("load", () => {
  const bars = document.querySelectorAll('.bg-blue-500');
  if (bars.length > 0) {
    bars.forEach(bar => {
      // Pastikan hanya elemen yang punya style width inline yang dianimasikan
      if (bar.style.width) {
        const width = bar.style.width;
        bar.style.width = "0";

        setTimeout(() => {
          bar.style.transition = "width 2.5s ease";
          bar.style.width = width;
        }, 300);
      }
    });
  }
});