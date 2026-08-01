const burgerBtn = document.getElementById('burgerBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const mainContent = document.getElementById('mainContent');
const headerLeft = document.getElementById('headerLeft');

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

  const jadwalToggle = document.getElementById('jadwalToggle');
  const jadwalMenu = document.getElementById('jadwalMenu');
  const jadwalIcon = document.getElementById('jadwalIcon');

  jadwalToggle.addEventListener('click', () => {
    if (jadwalMenu.classList.contains('max-h-0')) {
      jadwalMenu.classList.remove('max-h-0', 'opacity-0');
      jadwalMenu.classList.add('max-h-40', 'opacity-100'); // tinggi bisa disesuaikan
    } else {
      jadwalMenu.classList.remove('max-h-40', 'opacity-100');
      jadwalMenu.classList.add('max-h-0', 'opacity-0');
    }

    jadwalIcon.classList.toggle('rotate-180');
  });

  overlay.addEventListener('click', () => {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
  });

  const ctx = document.getElementById('myChart');

  new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Aduan', 'Surat Menyurat', 'Publikasi', 'Informasi'],
    datasets: [{
      label: 'Jumlah Data',
      data: [25, 30, 37, 5],
      backgroundColor: [
        '#8b5cf6', // biru
        '#22c55e', // hijau
        '#f59e0b', // kuning
        '#ef4444'  // merah
      ],
      borderColor: [
        '#8b5cf6',
        '#15803d',
        '#b45309',
        '#b91c1c'
      ],
      borderWidth: 1
    }]
  },
    options: {
    responsive: true,
    maintainAspectRatio: false,

    animation: {
      duration: 1500,
      easing: 'easeOutQuart'
    },

    animations: {
      y: {
        from: 0
      }
    },

    plugins: {
      legend: {
        display: true
      }
    },

    scales: {
      y: {
        beginAtZero: true,
      min: 0
      }
    }
  }
});

  // ================= COUNT UP =================
  function countUp(id, target) {
    let el = document.getElementById(id);
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

  // Jalankan animasi angka
  countUp("aduan", 25);
  countUp("surat", 30);
  countUp("publikasi", 40);
  countUp("info", 63);

  // ================= COUNTER =================
  const counters = document.querySelectorAll('.counter');

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

  // ================= PROGRESS ANIMATION =================
  window.addEventListener("load", () => {
    document.querySelectorAll('.bg-blue-500').forEach(bar => {
      const width = bar.style.width;
      bar.style.width = "0";

      setTimeout(() => {
        bar.style.transition = "width 2.5s ease";
        bar.style.width = width;
      }, 300);
    });
  });