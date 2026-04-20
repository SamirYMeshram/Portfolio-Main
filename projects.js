
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

const filterButtons = document.querySelectorAll('.filter-button');
const projectCards = document.querySelectorAll('.project-card');
const projectOpenButtons = document.querySelectorAll('.project-open');
const projectDrawer = document.getElementById('projectDrawer');
const drawerEyebrow = document.getElementById('drawerEyebrow');
const drawerTitle = document.getElementById('drawerTitle');
const drawerIntro = document.getElementById('drawerIntro');
const drawerChallenge = document.getElementById('drawerChallenge');
const drawerApproach = document.getElementById('drawerApproach');
const drawerStack = document.getElementById('drawerStack');
const drawerImpact = document.getElementById('drawerImpact');
const drawerMeta = document.getElementById('drawerMeta');
const drawerClose = document.getElementById('drawerClose');

const projectDetails = {
  orbitflow: {
    eyebrow: 'SaaS • Control Center',
    title: 'OrbitFlow Admin Suite',
    intro: 'A back-office environment with dense information needed to become calmer, faster, and easier to trust under pressure.',
    challenge: 'The original product exposed too much visual noise at once. Operators had the data they needed, but it took too long to parse and felt heavier than the product deserved.',
    approach: 'I redesigned the interface around priority-based hierarchy, reusable dashboard patterns, cleaner action zones, and subtle motion cues that clarified state changes without overwhelming power users.',
    stack: 'Component-driven front end, modular state logic, API-connected widgets, performance-aware rendering, and responsive dashboard layout behavior.',
    impact: 'Tasks completed faster, cognitive load dropped, and the team gained a reusable interface system that supported future modules more consistently.',
    tags: ['+31% task speed', 'Dashboard system', 'Power-user UX', 'Scalable components']
  },
  northstar: {
    eyebrow: 'Fintech • Trust Layer',
    title: 'Northstar Capital Web App',
    intro: 'A finance-facing application that needed to communicate security, control, and intelligence immediately.',
    challenge: 'The product looked functional but not trustworthy enough for a high-consideration financial workflow. The narrative and layout were not reinforcing credibility.',
    approach: 'I tightened the information hierarchy, strengthened premium visual cues, clarified action pathways, and paired refined frontend polish with sensible auth and analytics structure.',
    stack: 'Secure route flows, dashboard UI, analytics instrumentation, auth-aware interactions, API integration, and data-forward layout design.',
    impact: 'Demo requests increased, user confidence improved, and the brand finally felt aligned with the seriousness of the service.',
    tags: ['+24% demo requests', 'Trust-focused UX', 'Secure flow design', 'Premium visual tone']
  },
  veloura: {
    eyebrow: 'Brand • Premium launch',
    title: 'Veloura Studio Experience',
    intro: 'A storytelling-first website for a design-led brand that wanted cinematic quality without performance compromise.',
    challenge: 'The business needed a site that felt memorable and high-end, but many animation-heavy references in the market were bloated and inconsistent on mobile.',
    approach: 'I used layered gradients, motion timing discipline, controlled section reveals, and strong content framing to create impact without noise or load-time fragility.',
    stack: 'Animation-rich front end, structured content flow, responsive storytelling sections, and performance-first asset handling.',
    impact: 'Inquiries rose sharply and the studio gained a digital presence that matched the strength of its creative reputation.',
    tags: ['+42% inquiry rate', 'Motion storytelling', 'Performance-first polish', 'Brand elevation']
  },
  lumawear: {
    eyebrow: 'E-commerce • Conversion',
    title: 'LumaWear Commerce Refresh',
    intro: 'A fashion commerce experience where product storytelling needed to become more persuasive and checkout guidance more intuitive.',
    challenge: 'Users liked the products but the interface buried trust signals, underplayed differentiation, and made mobile shopping feel generic.',
    approach: 'I restructured product page hierarchy, improved visual emphasis on product stories, simplified comparison logic, and tightened mobile purchase flow cues.',
    stack: 'Responsive commerce UI, product module design, interaction tuning, lightweight data rendering, and checkout path optimization.',
    impact: 'Cart completion improved and product pages became more effective at building desire before the checkout stage.',
    tags: ['+19% cart completion', 'Mobile-first polish', 'Stronger product pages', 'Cleaner checkout guidance']
  },
  kernelforge: {
    eyebrow: 'Platform • Developer tools',
    title: 'KernelForge Builder Portal',
    intro: 'A developer-facing platform that had to translate complexity into confidence instead of intimidation.',
    challenge: 'The product contained serious technical power, but its interface felt fragmented and overly internal. New users struggled to orient quickly.',
    approach: 'I clarified onboarding sequence, organized API and documentation views, and created a calmer interface language that respected technical users without overwhelming them.',
    stack: 'Portal navigation architecture, docs presentation patterns, API workflow clarity, responsive component library, and developer-focused content systems.',
    impact: 'New-user orientation improved, support friction dropped, and the platform began to feel like a product instead of a collection of internal tools.',
    tags: ['Faster onboarding', 'Docs clarity', 'Developer UX', 'Structured platform narrative']
  },
  signallayer: {
    eyebrow: 'AI • Workflow design',
    title: 'SignalLayer Insight Hub',
    intro: 'An AI-assisted tool designed to surface recommendations that humans could inspect, trust, and act on.',
    challenge: 'Raw model outputs were technically useful but not product-ready. Users needed explanation, confidence signals, and an interaction model that reduced blind trust.',
    approach: 'I designed a human-in-the-loop interface with explanation zones, confidence cues, audit-friendly records, and interaction patterns that prioritized understanding over novelty.',
    stack: 'Recommendation UI patterns, audit log logic, explainability surfaces, structured data presentation, and state-aware workflow design.',
    impact: 'Teams were more willing to use the tool because the product respected the need for verification and context.',
    tags: ['Explainable UX', 'Audit-friendly design', 'Workflow clarity', 'AI + product trust']
  }
};

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');

    projectCards.forEach((card) => {
      const category = card.dataset.category;
      const visible = filter === 'all' || category === filter;
      card.classList.toggle('is-hidden', !visible);
    });
  });
});

function openProjectDrawer(key) {
  const detail = projectDetails[key];
  if (!detail || !projectDrawer) return;

  drawerEyebrow.textContent = detail.eyebrow;
  drawerTitle.textContent = detail.title;
  drawerIntro.textContent = detail.intro;
  drawerChallenge.textContent = detail.challenge;
  drawerApproach.textContent = detail.approach;
  drawerStack.textContent = detail.stack;
  drawerImpact.textContent = detail.impact;
  drawerMeta.innerHTML = detail.tags.map((tag) => `<span class="pill">${tag}</span>`).join('');
  projectDrawer.removeAttribute('hidden');
  projectDrawer.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
}

projectOpenButtons.forEach((button) => {
  button.addEventListener('click', () => openProjectDrawer(button.dataset.project));
});

if (drawerClose && projectDrawer) {
  drawerClose.addEventListener('click', () => {
    projectDrawer.setAttribute('hidden', '');
  });
}

const testimonialTrack = document.getElementById('projectTestimonialTrack');
const testimonialPrev = document.getElementById('projectTestimonialPrev');
const testimonialNext = document.getElementById('projectTestimonialNext');
const testimonialDots = document.getElementById('projectTestimonialDots');
const testimonialCards = testimonialTrack ? Array.from(testimonialTrack.querySelectorAll('.testimonial-card')) : [];
let currentTestimonial = 0;
let autoplayId;

function updateTestimonials() {
  testimonialCards.forEach((card, index) => {
    card.classList.toggle('is-active', index === currentTestimonial);
  });

  if (testimonialDots) {
    Array.from(testimonialDots.children).forEach((dot, index) => {
      dot.classList.toggle('is-active', index === currentTestimonial);
    });
  }
}

function renderTestimonialDots() {
  if (!testimonialDots) return;
  testimonialDots.innerHTML = '';
  testimonialCards.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
    dot.addEventListener('click', () => {
      currentTestimonial = index;
      updateTestimonials();
      restartAutoplay();
    });
    testimonialDots.appendChild(dot);
  });
}

function goToTestimonial(direction) {
  currentTestimonial = (currentTestimonial + direction + testimonialCards.length) % testimonialCards.length;
  updateTestimonials();
}

function restartAutoplay() {
  if (autoplayId) window.clearInterval(autoplayId);
  autoplayId = window.setInterval(() => goToTestimonial(1), 4600);
}

if (testimonialCards.length) {
  renderTestimonialDots();
  updateTestimonials();
  restartAutoplay();
}

if (testimonialPrev) testimonialPrev.addEventListener('click', () => { goToTestimonial(-1); restartAutoplay(); });
if (testimonialNext) testimonialNext.addEventListener('click', () => { goToTestimonial(1); restartAutoplay(); });
