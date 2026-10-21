document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    window.lucide.createIcons();
  } else {
    document.querySelectorAll('.icon-fallback').forEach((item) => {
      item.style.display = 'inline';
    });
  }

  const header = document.querySelector('#siteHeader');
  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 30);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  const mobileMenu = document.querySelector('.mobile-menu');
  const menuToggle = document.querySelector('.menu-toggle');
  const closeMenu = () => {
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };
  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  });
  document.querySelector('.menu-close').addEventListener('click', closeMenu);
  mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  const slides = [...document.querySelectorAll('.hero-slide')];
  const dots = [...document.querySelectorAll('.slide-dot')];
  let activeSlide = 0;
  let slideTimer;
  const showSlide = (index) => {
    activeSlide = index;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };
  const startSlider = () => {
    window.clearInterval(slideTimer);
    slideTimer = window.setInterval(() => showSlide((activeSlide + 1) % slides.length), 6000);
  };
  dots.forEach((dot) => dot.addEventListener('click', () => {
    showSlide(Number(dot.dataset.target));
    startSlider();
  }));
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) startSlider();

  const tabs = document.querySelectorAll('.product-tabs button');
  const cards = document.querySelectorAll('.product-card');
  tabs.forEach((tab) => tab.addEventListener('click', () => {
    tabs.forEach((item) => item.classList.remove('is-active'));
    tab.classList.add('is-active');
    const filter = tab.dataset.filter;
    cards.forEach((card) => {
      card.classList.toggle('is-hidden', filter !== 'all' && card.dataset.category !== filter);
    });
  }));

  const dialog = document.querySelector('#inquiryDialog');
  document.querySelectorAll('.open-inquiry').forEach((button) => {
    button.addEventListener('click', () => dialog.showModal());
  });
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  const form = document.querySelector('#inquiryForm');
  const toast = document.querySelector('.toast');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    dialog.close();
    form.reset();
    toast.classList.add('is-visible');
    window.setTimeout(() => toast.classList.remove('is-visible'), 3200);
  });
});
