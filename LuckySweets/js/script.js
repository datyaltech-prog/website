/**
 * ============================================================================
 * Lucky Sweets — Main JavaScript
 * Premium Indian Sweet Shop
 * Pure Vanilla JS · ES6+ · No Frameworks / Libraries
 * ============================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------------
     15. Page Transition Effect
     Fade the page in on load so the first paint feels intentional.
  ------------------------------------------------------------------------ */
  document.body.classList.add('loaded');

  /* ------------------------------------------------------------------------
     12. Active Navigation Link
     Highlight the link that matches the current pathname.
  ------------------------------------------------------------------------ */
  const setActiveNavLink = () => {
    const pathname = window.location.pathname;
    // Extract just the filename (e.g. 'about.html' or '' for index)
    const pageFile = pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.nav-link, .mobile-nav-link');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      // Normalize href: strip leading './' and get filename
      const linkFile = href.replace(/^\.?\//, '').split('#')[0] || 'index.html';
      if (linkFile === pageFile || (pageFile === '' && (linkFile === '/' || linkFile === 'index.html' || linkFile === ''))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };
  setActiveNavLink();

  /* ------------------------------------------------------------------------
     2. Sticky Header on Scroll
     Uses rAF throttling so we don't layout-thrash on every scroll pixel.
  ------------------------------------------------------------------------ */
  const header = document.querySelector('.header');
  let scrollTicking = false;

  const onScroll = () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        if (header) {
          header.classList.toggle('scrolled', window.scrollY > 50);
        }
        // Also handle scroll-to-top button visibility (see §5)
        updateScrollTopButton();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ------------------------------------------------------------------------
     3. Mobile Navigation
     Hamburger → X animation, panel slide-in, body scroll lock.
  ------------------------------------------------------------------------ */
  const hamburger   = document.querySelector('.hamburger');
  const mobileNav   = document.querySelector('.mobile-nav');
  const mobilePanel = document.querySelector('.mobile-nav-panel');
  const mobileClose = document.querySelector('.mobile-nav-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  let mobileNavOpen = false;

  /** Open the mobile navigation panel. */
  const openMobileNav = () => {
    if (mobileNavOpen) return;
    mobileNavOpen = true;
    hamburger?.classList.add('active');
    mobileNav?.classList.add('active');
    mobilePanel?.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  /** Close the mobile navigation panel. */
  const closeMobileNav = () => {
    if (!mobileNavOpen) return;
    mobileNavOpen = false;
    hamburger?.classList.remove('active');
    mobileNav?.classList.remove('active');
    mobilePanel?.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Toggle on hamburger click
  hamburger?.addEventListener('click', () => {
    mobileNavOpen ? closeMobileNav() : openMobileNav();
  });

  // Close button inside panel
  mobileClose?.addEventListener('click', closeMobileNav);

  // Close when clicking a link inside the mobile menu
  mobileLinks.forEach(link => link.addEventListener('click', closeMobileNav));

  // Close when clicking the overlay (outside the panel)
  mobileNav?.addEventListener('click', (e) => {
    if (e.target === mobileNav) closeMobileNav();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNavOpen) closeMobileNav();
  });

  /* ------------------------------------------------------------------------
     4. Smooth Scrolling
     Intercept anchor links (href starts with #) and scroll smoothly,
     offsetting for the sticky header height (~80px).
  ------------------------------------------------------------------------ */
  const HEADER_OFFSET = 80;

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const targetId = link.getAttribute('href');
    if (targetId === '#') return; // bare # anchor

    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;

    e.preventDefault();
    const top = targetEl.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  });

  /* ------------------------------------------------------------------------
     5. Scroll to Top Button
     Show / hide a floating button after scrolling past 500px.
  ------------------------------------------------------------------------ */
  const scrollTopBtn = document.querySelector('.float-btn-top');

  const updateScrollTopButton = () => {
    if (!scrollTopBtn) return;
    scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
  };

  scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Run once in case the page loads already scrolled
  updateScrollTopButton();

  /* ------------------------------------------------------------------------
     6. Scroll Animations (Intersection Observer)
     Elements with .fade-in, .slide-up, .slide-left, .slide-right, .scale-in
     receive the 'visible' class when they enter the viewport.
     Supports staggered delays via .delay-1 … .delay-4.
  ------------------------------------------------------------------------ */
  const ANIM_CLASSES = ['fade-in', 'slide-up', 'slide-left', 'slide-right', 'scale-in'];
  const animSelector = ANIM_CLASSES.map(c => `.${c}`).join(', ');
  const animElements = document.querySelectorAll(animSelector);

  if ('IntersectionObserver' in window && animElements.length) {
    const animObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            animObserver.unobserve(entry.target); // animate only once
          }
        });
      },
      { threshold: 0.15 }
    );
    animElements.forEach(el => animObserver.observe(el));
  } else {
    // Fallback: just show everything immediately
    animElements.forEach(el => el.classList.add('visible'));
  }

  /* ------------------------------------------------------------------------
     7. Counter Animation
     Animate .stat-number from 0 → data-target when it scrolls into view.
     data-suffix (e.g. '+') is appended after the number.
  ------------------------------------------------------------------------ */
  const statNumbers = document.querySelectorAll('.stat-number');
  const COUNTER_DURATION = 2000; // ms

  /** Easing function: ease-out cubic */
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    if (el.dataset.animated === 'true') return;
    el.dataset.animated = 'true';

    const target   = parseInt(el.dataset.target, 10);
    const suffix   = el.dataset.suffix || '';
    const start    = performance.now();

    const tick = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / COUNTER_DURATION, 1);
      const value    = Math.round(easeOutCubic(progress) * target);
      el.textContent = value.toLocaleString('en-IN') + suffix;

      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (statNumbers.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statNumbers.forEach(el => counterObserver.observe(el));
  } else {
    statNumbers.forEach(el => animateCounter(el));
  }

  /* ------------------------------------------------------------------------
     8. Lazy Loading Images
     Uses Intersection Observer for img[data-src] → src swap.
     Adds 'loaded' class for CSS fade-in transition.
  ------------------------------------------------------------------------ */
  const lazyImages = document.querySelectorAll('img[data-src]');

  if (lazyImages.length && 'IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const img = entry.target;
          img.src = img.dataset.src;
          if (img.dataset.srcset) img.srcset = img.dataset.srcset;

          img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
          img.addEventListener('error', () => handleImageError(img), { once: true });

          imgObserver.unobserve(img);
        });
      },
      { rootMargin: '200px 0px' } // start loading slightly before entering viewport
    );
    lazyImages.forEach(img => imgObserver.observe(img));
  } else {
    // Fallback: load everything immediately
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      if (img.dataset.srcset) img.srcset = img.dataset.srcset;
    });
  }

  /* ------------------------------------------------------------------------
     14. Image Error Handling
     Replaces broken images with an inline SVG placeholder.
  ------------------------------------------------------------------------ */
  const FALLBACK_SVG = `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="none">' +
    '<rect width="400" height="300" fill="#f3f0e7" rx="8"/>' +
    '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" ' +
    'font-family="sans-serif" font-size="16" fill="#b08d57">Image Not Available</text>' +
    '</svg>'
  )}`;

  const handleImageError = (img) => {
    img.src = FALLBACK_SVG;
    img.classList.add('error');
    img.alt = 'Image not available';
  };

  // Also attach global error handler for all existing images (non-lazy)
  document.querySelectorAll('img:not([data-src])').forEach(img => {
    img.addEventListener('error', () => handleImageError(img), { once: true });
  });

  /* ------------------------------------------------------------------------
     9. Gallery Filtering
     Filter .gallery-item elements by data-category on .filter-btn click.
  ------------------------------------------------------------------------ */
  const filterBtns   = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.filter;

      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Animate items in / out
      galleryItems.forEach(item => {
        const show = category === 'all' || item.dataset.category === category;

        if (show) {
          item.style.display = '';
          // Trigger reflow then fade in
          requestAnimationFrame(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          });
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.8)';
          // After fade-out, hide completely
          setTimeout(() => {
            if (item.style.opacity === '0') item.style.display = 'none';
          }, 350);
        }
      });
    });
  });

  /* ------------------------------------------------------------------------
     10. Lightbox
     Full-size image viewer with prev/next navigation and keyboard support.
  ------------------------------------------------------------------------ */
  const lightbox      = document.querySelector('.lightbox');
  const lightboxImg   = lightbox?.querySelector('.lightbox-img');
  const lightboxClose = lightbox?.querySelector('.lightbox-close');
  const lightboxPrev  = lightbox?.querySelector('.lightbox-prev');
  const lightboxNext  = lightbox?.querySelector('.lightbox-next');

  // Build an array of gallery images that the lightbox can cycle through
  const getGalleryImages = () => {
    return [...galleryItems].map(item => {
      const img = item.querySelector('img');
      return {
        src: img?.dataset.full || img?.src || '',
        alt: img?.alt || ''
      };
    }).filter(obj => obj.src);
  };

  let lightboxIndex   = 0;
  let lightboxImages  = [];
  let lightboxOpen    = false;

  const openLightbox = (index) => {
    lightboxImages = getGalleryImages();
    if (!lightboxImages.length || !lightbox || !lightboxImg) return;

    lightboxIndex = index;
    lightboxOpen  = true;
    lightboxImg.src = lightboxImages[lightboxIndex].src;
    lightboxImg.alt = lightboxImages[lightboxIndex].alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    if (!lightboxOpen) return;
    lightboxOpen = false;
    lightbox?.classList.remove('active');
    document.body.style.overflow = '';
    // Delay src clear so the CSS transition can finish
    setTimeout(() => { if (lightboxImg) lightboxImg.src = ''; }, 300);
  };

  const showLightboxImage = (direction) => {
    if (!lightboxImages.length) return;
    lightboxIndex = (lightboxIndex + direction + lightboxImages.length) % lightboxImages.length;
    lightboxImg.style.opacity = '0';
    setTimeout(() => {
      lightboxImg.src = lightboxImages[lightboxIndex].src;
      lightboxImg.alt = lightboxImages[lightboxIndex].alt;
      lightboxImg.style.opacity = '1';
    }, 200);
  };

  // Open lightbox when clicking a gallery item
  galleryItems.forEach((item, idx) => {
    item.addEventListener('click', () => openLightbox(idx));
  });

  // Lightbox controls
  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxPrev?.addEventListener('click', () => showLightboxImage(-1));
  lightboxNext?.addEventListener('click', () => showLightboxImage(1));

  // Close on clicking outside the image
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });

  // Keyboard navigation inside lightbox
  document.addEventListener('keydown', (e) => {
    if (!lightboxOpen) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  showLightboxImage(-1);
    if (e.key === 'ArrowRight') showLightboxImage(1);
  });

  /* ------------------------------------------------------------------------
     11. Contact Form Validation (Demo Mode)
     Validates name, email, phone, message and shows inline errors.
     Prevents actual submission; displays a success message instead.
  ------------------------------------------------------------------------ */
  const contactForm = document.querySelector('#contact-form');

  if (contactForm) {
    const fields = {
      name:    { el: contactForm.querySelector('[name="name"]'),    msg: 'Please enter your name.' },
      email:   { el: contactForm.querySelector('[name="email"]'),   msg: 'Please enter a valid email address.' },
      phone:   { el: contactForm.querySelector('[name="phone"]'),   msg: 'Please enter a valid phone number.' },
      message: { el: contactForm.querySelector('[name="message"]'), msg: 'Please enter a message.' },
    };

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const PHONE_REGEX = /^[+]?[\d\s\-()]{7,15}$/;

    /** Show an error message below a field. */
    const showError = (field, message) => {
      clearError(field);
      field.el.classList.add('error');
      const errEl = document.createElement('span');
      errEl.className = 'error-message';
      errEl.textContent = message;
      field.el.parentNode.appendChild(errEl);
    };

    /** Remove existing error from a field. */
    const clearError = (field) => {
      field.el.classList.remove('error');
      const existing = field.el.parentNode.querySelector('.error-message');
      if (existing) existing.remove();
    };

    /** Validate a single field and return true if valid. */
    const validateField = (field) => {
      const value = field.el.value.trim();

      // Name: required
      if (field.el.name === 'name' && !value) {
        showError(field, field.msg);
        return false;
      }

      // Email: required + format
      if (field.el.name === 'email') {
        if (!value || !EMAIL_REGEX.test(value)) {
          showError(field, field.msg);
          return false;
        }
      }

      // Phone: format (optional but if filled must be valid)
      if (field.el.name === 'phone' && value && !PHONE_REGEX.test(value)) {
        showError(field, field.msg);
        return false;
      }

      // Message: required
      if (field.el.name === 'message' && !value) {
        showError(field, field.msg);
        return false;
      }

      clearError(field);
      return true;
    };

    // Real-time validation on blur
    Object.values(fields).forEach(field => {
      field.el?.addEventListener('blur', () => validateField(field));
      // Clear error once the user starts typing again
      field.el?.addEventListener('input', () => {
        if (field.el.classList.contains('error')) clearError(field);
      });
    });

    // Form submission
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;
      Object.values(fields).forEach(field => {
        if (!validateField(field)) isValid = false;
      });

      if (!isValid) return;

      // Demo mode — show success message, reset form
      const successMsg = document.createElement('div');
      successMsg.className = 'form-success';
      successMsg.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
             stroke="#b08d57" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <p>Thank you! Your message has been received. We'll get back to you soon.</p>
      `;

      contactForm.innerHTML = '';
      contactForm.appendChild(successMsg);
    });
  }

  /* ------------------------------------------------------------------------
     13. Button Ripple Effect
     Material-design-style ripple on .btn click.
  ------------------------------------------------------------------------ */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    const ripple = document.createElement('span');
    ripple.classList.add('ripple');

    const rect    = btn.getBoundingClientRect();
    const size    = Math.max(rect.width, rect.height);
    const x       = e.clientX - rect.left - size / 2;
    const y       = e.clientY - rect.top - size / 2;

    ripple.style.width  = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left   = `${x}px`;
    ripple.style.top    = `${y}px`;

    btn.appendChild(ripple);

    ripple.addEventListener('animationend', () => ripple.remove());
  });

  /* ------------------------------------------------------------------------
     WhatsApp & Google Maps Utility Links
     ------------------------------------------------------------------------ */
  const WHATSAPP_NUMBER = '919876543210';
  const MAPS_LINK = 'https://www.google.com/maps/dir//Bhota,+Hamirpur,+Himachal+Pradesh+176041';

  // Attach WhatsApp link to any .whatsapp-btn elements
  document.querySelectorAll('.whatsapp-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const message = btn.dataset.message || 'Hello! I would like to enquire about your sweets.';
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    });
  });

  // Attach Maps link to any .directions-btn elements
  document.querySelectorAll('.directions-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(MAPS_LINK, '_blank');
    });
  });

  /* ------------------------------------------------------------------------
     16. Performance — Debounced Resize Handler
     Utility for resize-based logic without layout thrashing.
  ------------------------------------------------------------------------ */
  const debounce = (fn, delay = 150) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  // Example usage: re-run active-nav check on resize (SPA-like behaviour)
  window.addEventListener('resize', debounce(() => {
    setActiveNavLink();
  }, 250));

});
