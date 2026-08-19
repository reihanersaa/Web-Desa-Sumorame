const burgerBtn = document.getElementById('burgerBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const mainContent = document.getElementById('mainContent');
const headerLeft = document.getElementById('headerLeft');

// ================= DAFTAR SEMUA SUBMENU (DIKELOLA OTOMATIS) =================
const submenus = [
  {
    toggle: document.getElementById('suratToggle'),
    menu: document.getElementById('suratMenu'),
    icon: document.getElementById('suratIcon')
  },
  {
    toggle: document.getElementById('cmsToggle'),
    menu: document.getElementById('cmsMenu'),
    icon: document.getElementById('cmsIcon')
  }
];

function isSubmenuOpen({ menu }) {
  return !!menu && menu.classList.contains('opacity-100');
}

function openSubmenu({ menu, icon }) {
  if (!menu) return;
  menu.classList.remove('max-h-0', 'opacity-0');
  menu.classList.add('max-h-96', 'opacity-100');
  if (icon) icon.classList.add('rotate-180');
}

function closeSubmenu({ menu, icon }) {
  if (!menu) return;
  menu.classList.remove('max-h-96', 'opacity-100');
  menu.classList.add('max-h-0', 'opacity-0');
  if (icon) icon.classList.remove('rotate-180');
}

function toggleSubmenu(item) {
  if (isSubmenuOpen(item)) {
    closeSubmenu(item);
  } else {
    openSubmenu(item);
  }
}

// Ingat submenu mana saja yang terbuka sebelum sidebar ditutup/collapse,
// supaya bisa dibuka otomatis lagi saat sidebar dibuka.
let lastOpenSubmenus = [];

function collapseAllSubmenus() {
  lastOpenSubmenus = submenus.filter(isSubmenuOpen).map(s => s.menu && s.menu.id);
  submenus.forEach(closeSubmenu);
}

function restoreSubmenus() {
  submenus.forEach(item => {
    if (item.menu && lastOpenSubmenus.includes(item.menu.id)) {
      openSubmenu(item);
    }
  });
}

// Pasang klik manual untuk tiap submenu (Surat Menyurat & Kelola Website)
submenus.forEach(item => {
  if (item.toggle && item.menu && item.icon) {
    item.toggle.addEventListener('click', () => toggleSubmenu(item));
  }
});

// ================= BURGER: BUKA/TUTUP SIDEBAR =================
if (burgerBtn && sidebar && overlay && mainContent && headerLeft) {
  burgerBtn.addEventListener('click', () => {
    if (window.innerWidth < 768) {
      // Mode mobile: sidebar disembunyikan/ditampilkan via translate
      const sedangTertutup = sidebar.classList.contains('-translate-x-full');
      sidebar.classList.toggle('-translate-x-full');
      overlay.classList.toggle('hidden');

      if (sedangTertutup) {
        // Baru saja dibuka -> pulihkan submenu yang sebelumnya terbuka
        restoreSubmenus();
      } else {
        // Baru saja ditutup -> tutup semua submenu
        collapseAllSubmenus();
      }
    } else {
      // Mode desktop: sidebar collapse jadi mode ikon saja (w-20)
      const sedangTerbuka = sidebar.classList.contains('w-64');

      sidebar.classList.toggle('w-64');
      sidebar.classList.toggle('w-20');
      headerLeft.classList.toggle('w-64');
      headerLeft.classList.toggle('w-20');
      mainContent.classList.toggle('md:pl-64');
      mainContent.classList.toggle('md:pl-20');

      document.querySelectorAll('.menu-text').forEach(el => {
        el.classList.toggle('hidden');
      });

      if (sedangTerbuka) {
        // Baru saja di-collapse -> tutup semua submenu (teksnya toh disembunyikan)
        collapseAllSubmenus();
      } else {
        // Baru saja dibuka kembali -> pulihkan submenu yang sebelumnya terbuka
        restoreSubmenus();
      }
    }
  });
}

if (overlay && sidebar) {
  overlay.addEventListener('click', () => {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
    // Sidebar mobile ditutup lewat overlay -> tutup semua submenu juga
    collapseAllSubmenus();
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