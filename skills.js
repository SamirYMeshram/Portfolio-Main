
const root = document.documentElement;
const body = document.body;
const header = document.querySelector('.header');
const pageProgress = document.querySelector('.page-progress');
const themeToggle = document.getElementById('themeToggle');
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const backToTop = document.querySelector('.back-to-top');
const revealItems = document.querySelectorAll('.reveal');
const counterItems = document.querySelectorAll('[data-counter]');
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
const pageLoader = document.querySelector('.page-loader');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pointerFine = window.matchMedia('(pointer: fine)').matches;
const interactiveSelector = 'a, button, input, textarea, select, .magnetic, .card';

function updateThemeColor() {
  if (!themeColorMeta) return;
  themeColorMeta.setAttribute('content', root.dataset.theme === 'light' ? '#f4f7ff' : '#0b1020');
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    root.dataset.theme = savedTheme;
  } else {
    root.dataset.theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  updateThemeColor();
}

applySavedTheme();

function toggleTheme() {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('portfolio-theme', root.dataset.theme);
  updateThemeColor();
}

if (themeToggle) {
  themeToggle.addEventListener('click', toggleTheme);
}

function updateScrollUI() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  if (pageProgress) pageProgress.style.width = `${progress}%`;
  if (header) header.classList.toggle('scrolled', scrollTop > 18);
  if (backToTop) backToTop.classList.toggle('is-visible', scrollTop > 600);
}

window.addEventListener('scroll', updateScrollUI, { passive: true });
window.addEventListener('load', updateScrollUI, { passive: true });

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

function setMenuState(open) {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  mobileMenu.classList.toggle('is-open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  body.classList.toggle('menu-open', open);
}

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.classList.contains('is-open');
    setMenuState(!isOpen);
  });
}

document.querySelectorAll('#mobileMenu a').forEach((link) => {
  link.addEventListener('click', () => setMenuState(false));
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenuState(false);
});

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

function animateCounter(element) {
  const target = Number(element.dataset.counter || '0');
  const duration = 1400;
  const startTime = performance.now();

  const tick = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(target * eased);

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
}

if ('IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.45 }
  );

  counterItems.forEach((item) => counterObserver.observe(item));
} else {
  counterItems.forEach((item) => {
    item.textContent = item.dataset.counter;
  });
}

if (pointerFine && cursorDot && cursorRing) {
  body.classList.add('has-pointer');

  let ringX = window.innerWidth / 2;
  let ringY = window.innerHeight / 2;
  let targetX = ringX;
  let targetY = ringY;

  const updateRing = () => {
    ringX += (targetX - ringX) * 0.16;
    ringY += (targetY - ringY) * 0.16;
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
    requestAnimationFrame(updateRing);
  };

  updateRing();

  window.addEventListener('mousemove', (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    cursorDot.style.left = `${event.clientX}px`;
    cursorDot.style.top = `${event.clientY}px`;
  });

  document.querySelectorAll(interactiveSelector).forEach((element) => {
    element.addEventListener('mouseenter', () => cursorRing.classList.add('is-hovering'));
    element.addEventListener('mouseleave', () => cursorRing.classList.remove('is-hovering'));
  });
}

document.querySelectorAll('.magnetic').forEach((element) => {
  if (!pointerFine || prefersReducedMotion) return;

  element.addEventListener('pointermove', (event) => {
    const rect = element.getBoundingClientRect();
    const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
    const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
    element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  });

  element.addEventListener('pointerleave', () => {
    element.style.transform = '';
  });
});

function initCanvas() {
  const canvas = document.getElementById('pageCanvas');
  if (!canvas) return;

  const context = canvas.getContext('2d');
  if (!context) return;

  let width = 0;
  let height = 0;
  let particles = [];

  const particleCount = () => Math.min(90, Math.max(36, Math.round(window.innerWidth / 20)));

  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = Array.from({ length: particleCount() }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 2.1 + 0.8
    }));
  }

  function draw() {
    context.clearRect(0, 0, width, height);

    for (const particle of particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -20) particle.x = width + 20;
      if (particle.x > width + 20) particle.x = -20;
      if (particle.y < -20) particle.y = height + 20;
      if (particle.y > height + 20) particle.y = -20;

      context.beginPath();
      context.fillStyle = 'rgba(171, 215, 255, 0.62)';
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
    }

    for (let index = 0; index < particles.length; index += 1) {
      const first = particles[index];
      for (let inner = index + 1; inner < particles.length; inner += 1) {
        const second = particles[inner];
        const dx = first.x - second.x;
        const dy = first.y - second.y;
        const distance = Math.hypot(dx, dy);

        if (distance > 130) continue;
        context.beginPath();
        context.strokeStyle = `rgba(124, 131, 255, ${0.12 * (1 - distance / 130)})`;
        context.lineWidth = 1;
        context.moveTo(first.x, first.y);
        context.lineTo(second.x, second.y);
        context.stroke();
      }
    }

    requestAnimationFrame(draw);
  }

  resizeCanvas();
  draw();
  window.addEventListener('resize', resizeCanvas);
}

if (!prefersReducedMotion) {
  initCanvas();
}

window.addEventListener('load', () => {
  if (pageLoader) {
    window.setTimeout(() => pageLoader.classList.add('is-hidden'), 240);
  }
});

const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');
const fillBars = document.querySelectorAll('[data-fill]');
const radarCanvas = document.getElementById('radarCanvas');

tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const key = button.dataset.tab;
    tabButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-selected', String(isActive));
    });

    tabPanels.forEach((panel) => {
      panel.classList.toggle('is-active', panel.dataset.panel === key);
    });
  });
});

function animateSkillBars() {
  fillBars.forEach((bar) => {
    const width = bar.dataset.fill;
    bar.style.width = `${width}%`;
  });
}

if ('IntersectionObserver' in window) {
  const barObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateSkillBars();
        observer.disconnect();
      });
    },
    { threshold: 0.2 }
  );

  const firstBar = document.querySelector('.skill-bar-grid');
  if (firstBar) barObserver.observe(firstBar);
} else {
  animateSkillBars();
}

function drawRadar() {
  if (!radarCanvas) return;
  const context = radarCanvas.getContext('2d');
  if (!context) return;

  const ratio = window.devicePixelRatio || 1;
  const width = radarCanvas.clientWidth || radarCanvas.width;
  const height = 320;
  radarCanvas.width = width * ratio;
  radarCanvas.height = height * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.32;
  const labels = [
    ['Frontend', 95],
    ['Backend', 91],
    ['Quality', 93],
    ['Product', 89],
    ['Data', 86],
    ['Cloud', 82]
  ];
  const levels = 5;

  context.clearRect(0, 0, width, height);
  context.strokeStyle = 'rgba(255,255,255,0.1)';
  context.lineWidth = 1;

  for (let level = 1; level <= levels; level += 1) {
    context.beginPath();
    labels.forEach((_, index) => {
      const angle = (Math.PI * 2 * index) / labels.length - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius * (level / levels);
      const y = centerY + Math.sin(angle) * radius * (level / levels);
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.closePath();
    context.stroke();
  }

  labels.forEach(([label], index) => {
    const angle = (Math.PI * 2 * index) / labels.length - Math.PI / 2;
    const x = centerX + Math.cos(angle) * (radius + 24);
    const y = centerY + Math.sin(angle) * (radius + 24);

    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
    context.stroke();

    context.fillStyle = root.dataset.theme === 'light' ? '#2f3750' : '#d7def0';
    context.font = '600 12px Inter, system-ui, sans-serif';
    context.textAlign = x >= centerX ? 'left' : 'right';
    context.fillText(label, x, y);
  });

  context.beginPath();
  labels.forEach(([, value], index) => {
    const angle = (Math.PI * 2 * index) / labels.length - Math.PI / 2;
    const scaledRadius = radius * (value / 100);
    const x = centerX + Math.cos(angle) * scaledRadius;
    const y = centerY + Math.sin(angle) * scaledRadius;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.closePath();
  context.fillStyle = 'rgba(124, 131, 255, 0.22)';
  context.strokeStyle = 'rgba(49, 208, 255, 0.92)';
  context.lineWidth = 2.5;
  context.fill();
  context.stroke();

  labels.forEach(([, value], index) => {
    const angle = (Math.PI * 2 * index) / labels.length - Math.PI / 2;
    const scaledRadius = radius * (value / 100);
    const x = centerX + Math.cos(angle) * scaledRadius;
    const y = centerY + Math.sin(angle) * scaledRadius;
    context.beginPath();
    context.fillStyle = '#31d0ff';
    context.arc(x, y, 4.5, 0, Math.PI * 2);
    context.fill();
  });
}

drawRadar();
window.addEventListener('resize', drawRadar);
window.addEventListener('storage', drawRadar);
if (themeToggle) {
  themeToggle.addEventListener('click', () => window.setTimeout(drawRadar, 120));
}
