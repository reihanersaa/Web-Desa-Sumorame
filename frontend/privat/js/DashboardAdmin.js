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

  // Tandai submenu ini sebagai "baru saja dibuka lewat klik manual",
  // supaya animasi stagger item HANYA main saat toggle manual —
  // bukan saat submenu memang sudah terbuka permanen sejak halaman dimuat
  // (mis. saat reload halaman yang submenunya sengaja default terbuka).
  menu.classList.remove('submenu-just-opened');
  void menu.offsetWidth; // paksa reflow supaya animasi bisa diputar ulang
  menu.classList.add('submenu-just-opened');
}

function closeSubmenu({ menu, icon }) {
  if (!menu) return;
  menu.classList.remove('max-h-96', 'opacity-100', 'submenu-just-opened');
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

// Cek apakah sidebar sedang dalam kondisi TERBUKA (bukan tertutup/collapsed).
// - Mobile: sidebar dianggap terbuka jika TIDAK memiliki class '-translate-x-full'.
// - Desktop: sidebar dianggap terbuka jika memiliki class 'w-64' (bukan 'w-20').
function isSidebarOpen() {
  if (!sidebar) return true;
  if (window.innerWidth < 768) {
    return !sidebar.classList.contains('-translate-x-full');
  }
  return sidebar.classList.contains('w-64');
}

// Set kondisi sidebar secara eksplisit (true = buka, false = tutup),
// menyesuaikan mode mobile atau desktop sesuai lebar layar saat ini.
// Setiap kali sidebar berubah state, seluruh sub-menu dipaksa tertutup
// terlebih dahulu (state bersih/standar) — pemanggil boleh membuka
// sub-menu tertentu secara manual SETELAH memanggil fungsi ini.
function setSidebarOpen(open) {
  if (!sidebar) return;

  if (window.innerWidth < 768) {
    // Mode mobile
    sidebar.classList.toggle('-translate-x-full', !open);
    if (overlay) overlay.classList.toggle('hidden', !open);
  } else {
    // Mode desktop
    sidebar.classList.toggle('w-64', open);
    sidebar.classList.toggle('w-20', !open);
    if (headerLeft) {
      headerLeft.classList.toggle('w-64', open);
      headerLeft.classList.toggle('w-20', !open);
    }
    if (mainContent) {
      mainContent.classList.toggle('md:pl-64', open);
      mainContent.classList.toggle('md:pl-20', !open);
    }
    document.querySelectorAll('.menu-text').forEach(el => {
      el.classList.toggle('hidden', !open);
    });
  }

  collapseAllSubmenus();
}

// Sub-menu TIDAK pernah diingat/dipulihkan otomatis.
// Setiap kali burger menu berpindah state (buka ATAUPUN tutup),
// seluruh sub-menu dipaksa kembali ke kondisi tertutup/standar.
// Sub-menu hanya bisa terbuka lagi jika pengguna mengkliknya secara manual.
function collapseAllSubmenus() {
  submenus.forEach(closeSubmenu);
}

// Pasang klik manual untuk tiap submenu (Surat Menyurat & Kelola Website)
submenus.forEach(item => {
  if (item.toggle && item.menu && item.icon) {
    item.toggle.addEventListener('click', () => {
      if (!isSidebarOpen()) {
        // Fitur baru: klik sub-menu saat burger tertutup/collapsed
        // akan otomatis membuka burger/tampilan menu terlebih dahulu,
        // baru kemudian membuka sub-menu yang diklik.
        setSidebarOpen(true);
        openSubmenu(item);
      } else {
        // Sidebar sudah terbuka -> perilaku toggle manual biasa
        toggleSubmenu(item);
      }
    });
  }
});

// ================= BURGER: BUKA/TUTUP SIDEBAR =================
if (burgerBtn && sidebar && overlay && mainContent && headerLeft) {
  burgerBtn.addEventListener('click', () => {
    setSidebarOpen(!isSidebarOpen());
  });
}

if (overlay && sidebar) {
  overlay.addEventListener('click', () => {
    setSidebarOpen(false);
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