
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

const lensButtons = document.querySelectorAll('.lens-button');
const lensOutput = document.getElementById('lensOutput');

const lensContent = {
  builder: {
    eyebrow: 'Builder',
    title: 'I turn concepts into shipping software with visible momentum.',
    text: 'I break large ambitions into deliverable layers, define the right abstractions, and keep progress tangible. The point is not to look busy. The point is to reduce uncertainty and keep the product moving.',
    tags: ['Momentum', 'Ownership', 'Execution clarity']
  },
  designer: {
    eyebrow: 'Designer-minded',
    title: 'I care about visual hierarchy, rhythm, contrast, and the emotional tone of interfaces.',
    text: 'I do not separate engineering from experience. When spacing, timing, typography, and state changes feel intentional, users trust the product faster and understand it more easily.',
    tags: ['Visual judgment', 'Motion restraint', 'Narrative clarity']
  },
  architect: {
    eyebrow: 'Architect',
    title: 'I connect the surface of a product to the structure that keeps it stable.',
    text: 'Behind every elegant interface should be clear component logic, sensible data flow, and maintainable responsibilities. I look for the system, not just the screen.',
    tags: ['Structure', 'Scalability', 'Maintainability']
  },
  partner: {
    eyebrow: 'Product partner',
    title: 'I like being useful to the whole product, not just the codebase.',
    text: 'That means helping define priorities, clarifying what really matters for launch, and making technical decisions that align with user and business outcomes.',
    tags: ['Outcome focus', 'Communication', 'Strategic clarity']
  }
};

function renderLens(key) {
  const content = lensContent[key];
  if (!content || !lensOutput) return;

  lensOutput.innerHTML = `
    <div class="card__eyebrow">${content.eyebrow}</div>
    <h3 class="card__title">${content.title}</h3>
    <p>${content.text}</p>
    <div class="card__meta">
      ${content.tags.map((tag) => `<span class="pill">${tag}</span>`).join('')}
    </div>
  `;
}

lensButtons.forEach((button) => {
  button.addEventListener('click', () => {
    lensButtons.forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');
    renderLens(button.dataset.lens);
  });
});
