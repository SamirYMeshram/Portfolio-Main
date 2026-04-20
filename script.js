const root = document.documentElement;
const body = document.body;
const header = document.querySelector('.header');
const pageProgress = document.querySelector('.page-progress');
const backToTop = document.querySelector('.back-to-top');
const preloader = document.querySelector('.preloader');
const themeToggle = document.getElementById('themeToggle');
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const navLinks = document.querySelectorAll('.nav__links a, .mobile-menu a, .footer__links a');
const desktopNavLinks = document.querySelectorAll('.nav__links a');
const revealItems = document.querySelectorAll('.reveal');
const counterItems = document.querySelectorAll('[data-counter]');
const typedRole = document.getElementById('typedRole');
const filterButtons = document.querySelectorAll('.filter-button');
const projectCards = document.querySelectorAll('.project-card');
const faqItems = document.querySelectorAll('.faq-item');
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
const heroSection = document.getElementById('home');
const heroSpotlight = document.querySelector('.hero__spotlight');
const tiltCards = document.querySelectorAll('[data-tilt]');
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
const interactiveSelector = 'a, button, input, textarea, .magnetic';
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

const roles = [
  'Animated developer portfolios that feel premium.',
  'Full stack platforms with clean UX and strong architecture.',
  'High-converting landing pages with real visual personality.',
  'Modern interfaces that move with precision and taste.'
];

let typingPhraseIndex = 0;
let typingCharacterIndex = 0;
let isDeleting = false;
let typedTimeout;

let currentTestimonial = 0;
let testimonialInterval;

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

  pageProgress.style.width = `${progress}%`;
  header.classList.toggle('scrolled', scrollTop > 18);
  backToTop.classList.toggle('is-visible', scrollTop > 700);
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

navLinks.forEach((link) => {
  link.addEventListener('click', () => setMenuState(false));
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenuState(false);
});

function handleReveal(entries, observer) {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  });
}

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(handleReveal, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

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
    { threshold: 0.5 }
  );

  counterItems.forEach((item) => counterObserver.observe(item));
} else {
  counterItems.forEach((item) => {
    item.textContent = item.dataset.counter;
  });
}

function typeRoles() {
  if (!typedRole || prefersReducedMotion) {
    if (typedRole) typedRole.textContent = roles[0];
    return;
  }

  const currentPhrase = roles[typingPhraseIndex];
  const displayedText = currentPhrase.slice(0, typingCharacterIndex);
  typedRole.textContent = displayedText;

  if (!isDeleting && typingCharacterIndex < currentPhrase.length) {
    typingCharacterIndex += 1;
    typedTimeout = window.setTimeout(typeRoles, 42);
    return;
  }

  if (!isDeleting && typingCharacterIndex === currentPhrase.length) {
    isDeleting = true;
    typedTimeout = window.setTimeout(typeRoles, 1500);
    return;
  }

  if (isDeleting && typingCharacterIndex > 0) {
    typingCharacterIndex -= 1;
    typedTimeout = window.setTimeout(typeRoles, 24);
    return;
  }

  isDeleting = false;
  typingPhraseIndex = (typingPhraseIndex + 1) % roles.length;
  typedTimeout = window.setTimeout(typeRoles, 380);
}

typeRoles();

const sections = document.querySelectorAll('main section[id]');
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        desktopNavLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
        });
      });
    },
    { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');

    projectCards.forEach((card) => {
      const category = card.dataset.category;
      const matches = filter === 'all' || category === filter;
      card.classList.toggle('is-hidden', !matches);
    });
  });
});

faqItems.forEach((item) => {
  const trigger = item.querySelector('.faq-question');
  if (!trigger) return;

  trigger.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open');
    faqItems.forEach((entry) => entry.classList.remove('is-open'));
    if (!isOpen) item.classList.add('is-open');
  });
});

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const project = String(formData.get('project') || '').trim();
    const budget = String(formData.get('budget') || '').trim() || 'Not specified';
    const message = String(formData.get('message') || '').trim();

    const subject = encodeURIComponent(`Project Inquiry • ${project} • ${name}`);
    const bodyText = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Project Type: ${project}`,
      `Budget: ${budget}`,
      '',
      'Project Brief:',
      message
    ].join('\n');

    const body = encodeURIComponent(bodyText);
    const recipient = 'samm9421@gmail.com';
    const mailto = `mailto:${recipient}?subject=${subject}&body=${body}`;

    if (formNote) {
      formNote.textContent = 'Opening your mail app now. Replace the email or connect a backend to make this fully live for production.';
      formNote.classList.add('is-success');
    }

    window.location.href = mailto;
  });
}

const testimonialTrack = document.getElementById('testimonialTrack');
const testimonialPrev = document.getElementById('testimonialPrev');
const testimonialNext = document.getElementById('testimonialNext');
const testimonialDots = document.getElementById('testimonialDots');
const testimonialCards = testimonialTrack ? Array.from(testimonialTrack.querySelectorAll('.testimonial-card')) : [];

function renderTestimonialDots() {
  if (!testimonialDots) return;
  testimonialDots.innerHTML = '';

  testimonialCards.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = index === currentTestimonial ? 'is-active' : '';
    dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
    dot.addEventListener('click', () => {
      currentTestimonial = index;
      updateTestimonials();
      restartTestimonialAutoplay();
    });
    testimonialDots.appendChild(dot);
  });
}

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

function goToTestimonial(direction) {
  currentTestimonial = (currentTestimonial + direction + testimonialCards.length) % testimonialCards.length;
  updateTestimonials();
}

function restartTestimonialAutoplay() {
  if (prefersReducedMotion || testimonialCards.length <= 1) return;
  window.clearInterval(testimonialInterval);
  testimonialInterval = window.setInterval(() => goToTestimonial(1), 5200);
}

if (testimonialCards.length) {
  renderTestimonialDots();
  updateTestimonials();
  restartTestimonialAutoplay();

  testimonialPrev?.addEventListener('click', () => {
    goToTestimonial(-1);
    restartTestimonialAutoplay();
  });

  testimonialNext?.addEventListener('click', () => {
    goToTestimonial(1);
    restartTestimonialAutoplay();
  });
}

if (!prefersReducedMotion && heroSection && heroSpotlight) {
  heroSection.addEventListener('pointermove', (event) => {
    const rect = heroSection.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    heroSpotlight.style.left = `${x}px`;
    heroSpotlight.style.top = `${y}px`;
    heroSpotlight.style.transform = 'translate(-50%, -50%)';
  });

  heroSection.addEventListener('pointerleave', () => {
    heroSpotlight.style.left = '50%';
    heroSpotlight.style.top = '7rem';
    heroSpotlight.style.transform = 'translateX(-50%)';
  });
}

function applyTilt(card, event) {
  const rect = card.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const rotateX = ((y / rect.height) - 0.5) * -10;
  const rotateY = ((x / rect.width) - 0.5) * 12;

  card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
}

tiltCards.forEach((card) => {
  if (prefersReducedMotion) return;

  card.addEventListener('pointermove', (event) => applyTilt(card, event));
  card.addEventListener('pointerleave', () => {
    card.style.transform = '';
  });
});

if (window.matchMedia('(pointer:fine)').matches && !prefersReducedMotion && cursorDot && cursorRing) {
  body.classList.add('has-pointer');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let isCursorExpanded = false;

  const interactiveElements = document.querySelectorAll(interactiveSelector);

  interactiveElements.forEach((element) => {
    element.addEventListener('pointerenter', () => {
      isCursorExpanded = true;
      cursorRing.style.width = '3.3rem';
      cursorRing.style.height = '3.3rem';
      cursorRing.style.marginLeft = '-1.45rem';
      cursorRing.style.marginTop = '-1.45rem';
      cursorRing.style.background = 'rgba(255,255,255,0.06)';
      cursorRing.style.borderColor = 'rgba(255,255,255,0.28)';
    });

    element.addEventListener('pointerleave', () => {
      isCursorExpanded = false;
      cursorRing.style.width = '2.4rem';
      cursorRing.style.height = '2.4rem';
      cursorRing.style.marginLeft = '-0.975rem';
      cursorRing.style.marginTop = '-0.975rem';
      cursorRing.style.background = 'rgba(255,255,255,0.03)';
      cursorRing.style.borderColor = 'rgba(255,255,255,0.22)';
    });
  });

  window.addEventListener('pointermove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  });

  const animateCursor = () => {
    ringX += (mouseX - ringX) * (isCursorExpanded ? 0.16 : 0.13);
    ringY += (mouseY - ringY) * (isCursorExpanded ? 0.16 : 0.13);
    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    requestAnimationFrame(animateCursor);
  };

  animateCursor();
}

const magneticItems = document.querySelectorAll('.button.magnetic, .theme-toggle.magnetic, .tag.magnetic, .brand.magnetic');
magneticItems.forEach((item) => {
  if (prefersReducedMotion) return;

  item.addEventListener('pointermove', (event) => {
    const rect = item.getBoundingClientRect();
    const strength = 14;
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * strength;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * strength;
    item.style.transform = `translate(${x}px, ${y}px)`;
  });

  item.addEventListener('pointerleave', () => {
    item.style.transform = '';
  });
});

function hidePreloader() {
  if (!preloader) return;
  window.setTimeout(() => {
    preloader.classList.add('is-hidden');
  }, prefersReducedMotion ? 100 : 650);
}

window.addEventListener('load', hidePreloader);

function setupParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas || prefersReducedMotion) return;

  const context = canvas.getContext('2d');
  if (!context) return;

  let particles = [];
  let width = 0;
  let height = 0;
  let rafId = 0;

  const mouse = { x: null, y: null, radius: 120 };

  const getParticleCount = () => (window.innerWidth < 700 ? 24 : window.innerWidth < 1100 ? 34 : 48);

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = Array.from({ length: getParticleCount() }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      size: Math.random() * 1.8 + 0.7
    }));
  }

  function getStrokeColor(alpha) {
    return root.dataset.theme === 'light'
      ? `rgba(62, 82, 152, ${alpha})`
      : `rgba(166, 201, 255, ${alpha})`;
  }

  function draw() {
    context.clearRect(0, 0, width, height);

    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x <= 0 || particle.x >= width) particle.vx *= -1;
      if (particle.y <= 0 || particle.y >= height) particle.vy *= -1;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          particle.x -= dx * 0.004;
          particle.y -= dy * 0.004;
        }
      }

      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fillStyle = getStrokeColor(root.dataset.theme === 'light' ? 0.35 : 0.6);
      context.fill();

      for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
        const other = particles[nextIndex];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 130) {
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(other.x, other.y);
          context.strokeStyle = getStrokeColor(((130 - distance) / 130) * (root.dataset.theme === 'light' ? 0.14 : 0.2));
          context.lineWidth = 1;
          context.stroke();
        }
      }
    });

    rafId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  resize();
  draw();

  return () => cancelAnimationFrame(rafId);
}

setupParticles();

window.addEventListener('beforeunload', () => {
  window.clearTimeout(typedTimeout);
  window.clearInterval(testimonialInterval);
});
