/**
 * Framer-Style Dynamic Navbar & GSAP Scroll Interactions
 * H. Nahid™ Portfolio
 */

document.addEventListener("DOMContentLoaded", () => {
  initSmoothScroll();
  initScrollNavbar();
  initMobileMenu();
  initMarquee();
  initAboutBend();
  initTextReveal();
  initWorksReveal();
  initProjectsHorizontalScroll();
  initTestimonialsScroll();
  initServicesScroll();
  initServicesHorizontalScroll();
  initProjectMediaCursor();
  initProjectLightbox();
  initFooter();
});

/* ==========================================================================
   Framer-Grade Navbar Scroll Transition with Hysteresis & rAF
   ========================================================================== */
function initScrollNavbar() {
  const navbarWrapper = document.querySelector(".navbar-wrapper");
  const navbar = document.getElementById("navbar");

  if (!navbar) return;

  let isScrolled = false;
  let ticking = false;

  // Hysteresis thresholds:
  // Scroll > 50px to smoothly morph into floating island
  // Scroll < 15px to smoothly expand back to default header
  const SHRINK_THRESHOLD = 50;
  const EXPAND_THRESHOLD = 15;

  function handleScroll() {
    const currentScroll = window.scrollY || window.pageYOffset;

    if (!isScrolled && currentScroll > SHRINK_THRESHOLD) {
      isScrolled = true;
      navbar.classList.add("scrolled");
      if (navbarWrapper) navbarWrapper.classList.add("scrolled");
    } else if (isScrolled && currentScroll < EXPAND_THRESHOLD) {
      isScrolled = false;
      navbar.classList.remove("scrolled");
      if (navbarWrapper) navbarWrapper.classList.remove("scrolled");
    }

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    },
    { passive: true }
  );

  // Initial check on load
  handleScroll();

  // Clean fade-in without any Y displacement so navbar is never cut off
  if (typeof gsap !== "undefined" && navbarWrapper) {
    gsap.from(navbarWrapper, {
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      clearProps: "all",
    });
  }
}

/* ==========================================================================
   Mobile Navigation Drawer Toggle
   ========================================================================== */
function initMobileMenu() {
  const mobileToggle = document.getElementById("mobileToggle");
  const navMenu = document.getElementById("navMenu");

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.contains("open");
      if (isOpen) {
        navMenu.classList.remove("open");
        mobileToggle.setAttribute("aria-expanded", "false");
      } else {
        navMenu.classList.add("open");
        mobileToggle.setAttribute("aria-expanded", "true");
      }
    });

    // Close menu on clicking nav link
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
      });
    });
  }
}

/* ==========================================================================
   Horizontal Marquee Ticker with Mouse-Wheel Direction Control & Momentum
   ========================================================================== */
function initMarquee() {
  const marqueeTrack = document.getElementById("marqueeTrack");
  const marqueeContent = document.getElementById("marqueeContent");

  if (!marqueeTrack || !marqueeContent) return;

  // Dynamically duplicate single item from HTML so user only needs 1 name in HTML
  const singleItem = marqueeContent.querySelector(".marquee-item");
  if (singleItem) {
    // Populate at least 4 items for a full, rich marquee set
    while (marqueeContent.children.length < 4) {
      marqueeContent.appendChild(singleItem.cloneNode(true));
    }

    // Clone marqueeContent twice for seamless infinite wrapping (3 identical tracks)
    if (marqueeTrack.children.length === 1) {
      const clone1 = marqueeContent.cloneNode(true);
      clone1.setAttribute("aria-hidden", "true");
      clone1.removeAttribute("id");
      marqueeTrack.appendChild(clone1);

      const clone2 = marqueeContent.cloneNode(true);
      clone2.setAttribute("aria-hidden", "true");
      clone2.removeAttribute("id");
      marqueeTrack.appendChild(clone2);
    }
  }

  let xPos = 0;
  const baseSpeed = 1.6; // Constant baseline flow speed (px/frame)
  let direction = -1; // -1 = flows to the left, 1 = flows to the right
  let velocityBoost = 0;
  let currentVelocity = -baseSpeed;
  let contentWidth = marqueeContent.offsetWidth || 0;

  function updateContentWidth() {
    if (marqueeContent) {
      contentWidth = marqueeContent.offsetWidth;
    }
  }

  window.addEventListener("resize", updateContentWidth);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateContentWidth);
  }

  // React moderately to mouse wheel anywhere on the window
  window.addEventListener(
    "wheel",
    (e) => {
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;

      if (Math.abs(delta) > 0.5) {
        // Direction change based on wheel direction (down -> left, up -> right)
        direction = delta > 0 ? -1 : 1;

        // Controlled, gentle velocity boost (capped at 7px/frame instead of 38)
        const boost = Math.min(Math.abs(delta) * 0.06, 3);
        velocityBoost = Math.min(velocityBoost + boost, 7);
      }
    },
    { passive: true }
  );

  // React to page scroll delta (for scrollbar drag, touch swipe, or keyboard navigation)
  let lastScrollY = window.scrollY || window.pageYOffset;
  window.addEventListener(
    "scroll",
    () => {
      const currentScrollY = window.scrollY || window.pageYOffset;
      const scrollDelta = currentScrollY - lastScrollY;

      if (Math.abs(scrollDelta) > 0.5) {
        direction = scrollDelta > 0 ? -1 : 1;

        const boost = Math.min(Math.abs(scrollDelta) * 0.08, 3.5);
        velocityBoost = Math.min(velocityBoost + boost, 7);
      }
      lastScrollY = currentScrollY;
    },
    { passive: true }
  );

  // Animation loop using requestAnimationFrame for buttery 60fps/120fps motion
  function animate() {
    if (!contentWidth) {
      updateContentWidth();
    }

    // Smoothly decay velocity boost with inertia friction
    velocityBoost *= 0.92;
    if (velocityBoost < 0.04) velocityBoost = 0;

    // Target velocity in current direction (baseline speed + scroll boost)
    const targetVelocity = direction * (baseSpeed + velocityBoost);

    // Smooth easing towards target velocity
    currentVelocity += (targetVelocity - currentVelocity) * 0.12;

    // Advance horizontal position
    xPos += currentVelocity;

    // Seamless infinite loop wrapping
    if (contentWidth > 0) {
      if (xPos <= -contentWidth) {
        xPos += contentWidth;
      } else if (xPos >= 0) {
        xPos -= contentWidth;
      }
    }

    marqueeTrack.style.transform = `translate3d(${xPos}px, 0, 0)`;

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

/* ==========================================================================
   Smooth Scroll Integration (Lenis + GSAP ScrollTrigger Synchronization)
   ========================================================================== */
let lenis = null;

function initSmoothScroll() {
  if (typeof Lenis === "undefined") return;

  lenis = new Lenis({
    duration: 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: "vertical",
    gestureOrientation: "vertical",
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.6,
    // Let the lightbox's own scroll container handle its wheel/touch input
    // natively instead of Lenis hijacking it for the main page.
    prevent: (node) => !!node.closest?.("#lightboxScroll"),
  });

  // Synchronize Lenis with GSAP ScrollTrigger
  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // Smooth scroll for nav links and all anchor jumps
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: 0, duration: 1.4 });
      }
    });
  });
}

/* ==========================================================================
   About Section Dynamic Scroll & Mouse-Wheel Bend Effect
   Starts completely unbent (flat) and bends dynamically into a majestic dome
   ========================================================================== */
function initAboutBend() {
  const aboutSection = document.getElementById("about");
  const topPath = document.getElementById("aboutBendTopPath");

  if (!aboutSection || !topPath) return;

  let targetBendTop = 0;
  let currentBendTop = 0;
  let wheelVelocity = 0;
  let isNearView = false;

  // Actively bend with mouse wheel scrolling when near or in about section
  window.addEventListener(
    "wheel",
    (e) => {
      if (!isNearView) return;
      wheelVelocity += e.deltaY * 0.22;
      wheelVelocity = Math.max(-60, Math.min(wheelVelocity, 60));
    },
    { passive: true }
  );

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    // Track when about section is entering or in view
    ScrollTrigger.create({
      trigger: aboutSection,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => {
        isNearView = self.isActive;
        if (!self.isActive) {
          targetBendTop = 0;
        }
      },
    });

    // Top Curve Morph:
    // Progress = 0 at start -> bend = 0 (Unbent flat line)
    // Arches smoothly up to 150px dome as About enters view, and stays arched while reading
    ScrollTrigger.create({
      trigger: aboutSection,
      start: "top bottom",
      end: "top 25%",
      scrub: 1,
      onUpdate: (self) => {
        targetBendTop = self.progress * 150;
      },
    });
  }

  // Physics loop for dynamic rubber-band bending with mouse wheel and scroll
  function updateBend() {
    // Elastic damping for wheel inertia
    wheelVelocity *= 0.88;
    if (Math.abs(wheelVelocity) < 0.05) wheelVelocity = 0;

    const dynamicTop = isNearView
      ? Math.max(0, Math.min(targetBendTop + Math.max(-20, wheelVelocity * 0.35), 170))
      : 0;
    currentBendTop += (dynamicTop - currentBendTop) * 0.16;

    // Apply to top SVG path (y goes from 180 down to 10 for deep dome curve)
    topPath.setAttribute(
      "d",
      `M 0,180 Q 720,${180 - currentBendTop} 1440,180 L 1440,180 L 0,180 Z`
    );

    requestAnimationFrame(updateBend);
  }

  requestAnimationFrame(updateBend);
}

/* ==========================================================================
   About Section Scroll-Driven Item-by-Item Reveal Animation (GSAP + ScrollTrigger)
   Reveals in sequence: About subtitle, Headline (40px), Bio (24px), Action Pill, Meta Row
   ========================================================================== */
function initTextReveal() {
  const aboutSection = document.getElementById("about");
  const header = document.querySelector(".about-header");
  const headline = document.querySelector(".about-headline");
  const bio = document.querySelector(".about-bio");
  const actionGroup = document.querySelector(".about-action-group");
  const footerRow = document.querySelector(".about-footer-row");

  if (!aboutSection || !headline || !bio) return;

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    // Initial hidden states
    if (header) gsap.set(header, { opacity: 0, y: 30 });
    gsap.set(headline, { opacity: 0, y: 45 });
    gsap.set(bio, { opacity: 0, y: 45 });
    if (actionGroup) gsap.set(actionGroup, { opacity: 0, y: 35, scale: 0.95 });
    if (footerRow) gsap.set(footerRow, { opacity: 0, y: 20 });

    // Item-by-item reveal timeline tied to scroll scrub
    const revealTl = gsap.timeline({
      scrollTrigger: {
        trigger: aboutSection,
        start: "top 72%",
        end: "center 42%",
        scrub: 0.8,
      },
    });

    // 1st: About Subtitle
    if (header) {
      revealTl.to(header, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power2.out",
      });
    }

    // 2nd: 1st Paragraph (40px Headline)
    revealTl.to(
      headline,
      {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: "power2.out",
      },
      "+=0.1"
    );

    // 4th: 2nd Paragraph (20px Bio)
    revealTl.to(
      bio,
      {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: "power2.out",
      },
      "+=0.15"
    );

    // 5th: Action Button Group (Lime Pill + Arrow)
    if (actionGroup) {
      revealTl.to(
        actionGroup,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
        },
        "+=0.1"
      );
    }

    // 6th: Bottom Footer Meta Row
    if (footerRow) {
      revealTl.to(
        footerRow,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.2"
      );
    }
  }
}

/* ==========================================================================
   Selected Works Expanding Reveal Container (Black BG to 100% Full-Width Card)
   Matches azizkhaldi.com reveal effect:
   - Starts inset with rounded corners on deep black background
   - Expands to 100% full-width and flattens corners with scroll
   ========================================================================== */
function initWorksReveal() {
  const card = document.getElementById("worksRevealCard");
  const wrapper = document.getElementById("worksRevealWrapper");

  if (!card || !wrapper) return;
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  // NOTE: The card's actual layout width is always 100% (see CSS) — only its
  // painted appearance is inset via clip-path. This keeps the real width of
  // descendants (like the pinned horizontal projects section) full-viewport
  // at all times, so GSAP's pin measurements never get frozen at a stale,
  // narrower size while this reveal animation is still in progress.
  // Tweening the two custom properties (instead of the clip-path shorthand
  // directly) is what makes GSAP interpolate this smoothly instead of
  // snapping straight to the end value.
  mm.add("(min-width: 901px)", () => {
    // Initial state: centered rounded card look on black background
    gsap.set(card, {
      "--reveal-inset": "5vw",
      "--reveal-radius": "36px",
    });

    const revealTween = gsap.to(card, {
      "--reveal-inset": "0vw",
      "--reveal-radius": "0px",
      ease: "none",
      scrollTrigger: {
        trigger: wrapper,
        start: "top 85%", // Starts expanding as wrapper enters viewport
        end: "top 25%", // Fully expanded to 100% width and flat corners before projects section
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      revealTween.kill();
      gsap.set(card, { clearProps: "all" });
    };
  });

  mm.add("(max-width: 900px)", () => {
    gsap.set(card, {
      "--reveal-inset": "3vw",
      "--reveal-radius": "24px",
    });

    const revealTweenMobile = gsap.to(card, {
      "--reveal-inset": "0vw",
      "--reveal-radius": "0px",
      ease: "none",
      scrollTrigger: {
        trigger: wrapper,
        start: "top 85%",
        end: "top 25%",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      revealTweenMobile.kill();
      gsap.set(card, { clearProps: "all" });
    };
  });
}

/* ==========================================================================
   Horizontal Scroll Projects Section (GSAP Pin + Lenis Smooth Integration)
   ========================================================================== */
function initProjectsHorizontalScroll() {
  const section = document.querySelector(".projects-horizontal-section");
  const track = document.getElementById("projectsTrack");
  const slides = document.querySelectorAll(".project-slide");

  if (!section || !track || slides.length === 0) return;
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  // Responsive GSAP ScrollTrigger Horizontal Pinning
  const mm = gsap.matchMedia();

  mm.add("(min-width: 901px)", () => {
    function getScrollAmount() {
      return track.scrollWidth - window.innerWidth;
    }

    const horizontalTween = gsap.to(track, {
      x: () => -getScrollAmount(),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${getScrollAmount()}`,
        pin: true,
        pinSpacing: true,
        pinType: "fixed",
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });


    return () => {
      horizontalTween.kill();
      gsap.set(track, { clearProps: "all" });
    };
  });
}

/* ==========================================================================
   Project Media "View" Badge — follows the cursor within each card
   ========================================================================== */
function initProjectMediaCursor() {
  const cards = document.querySelectorAll(".project-media-card");

  cards.forEach((card) => {
    const badge = card.querySelector(".project-media-view");
    if (!badge) return;

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      badge.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    });
  });
}

/* ==========================================================================
   Project Lightbox — expands from a horizontal line into a full case-study
   page. The hero media shrinks toward the top as the visitor scrolls down
   into the (dummy) content, and grows back to full size on scrolling up.
   Closing collapses the whole panel back down into a line and hides it.
   ========================================================================== */
function initProjectLightbox() {
  const lightbox = document.getElementById("projectLightbox");
  const panel = document.getElementById("lightboxPanel");
  const scrollEl = document.getElementById("lightboxScroll");
  const hero = document.getElementById("lightboxHero");
  const mediaSlot = document.getElementById("lightboxMedia");
  const titleBar = document.getElementById("lightboxTitleBar");
  const closeBtn = document.getElementById("lightboxClose");
  const clientEl = document.getElementById("lightboxClient");
  const headingEl = document.getElementById("lightboxHeading");
  const yearEl = document.getElementById("lightboxYear");
  const cards = document.querySelectorAll(".project-media-card");

  if (!lightbox || !panel || !scrollEl || !hero || !mediaSlot || !titleBar || cards.length === 0) return;
  if (typeof gsap === "undefined") return;

  let activeTween = null;
  let retractTween = null;
  let wheelTween = null;
  let wheelTarget = 0;
  let isOpen = false;
  let titleObserver = null;
  let titleRevealed = false;
  let userScrolled = false;
  // Distance (in scroll px) over which the hero fully retracts toward the top —
  // matches the hero's own height so the title bar lands flush at the top
  // (scrollTop 0) the instant the retract finishes, not partway down.
  const shrinkRange = () => hero.offsetHeight;

  // The title bar sits in normal flow right after the hero; animate it in the
  // instant it scrolls into view, then let it stick to the top from there on.
  function armTitleReveal() {
    titleObserver && titleObserver.disconnect();
    titleRevealed = false;
    // Starts slightly below rest position, then eases upward into place.
    gsap.set(titleBar, { opacity: 0, yPercent: 20 });
    titleObserver = new IntersectionObserver(
      (entries) => {
        if (titleRevealed || !entries[0].isIntersecting) return;
        titleRevealed = true;
        gsap.to(titleBar, { opacity: 1, yPercent: 0, duration: 0.6, ease: "power2.out" });
      },
      { root: scrollEl, threshold: 0.01 }
    );
    titleObserver.observe(titleBar);
  }

  // Lenis doesn't touch this container (see `prevent` in initSmoothScroll), so
  // we ease the wheel input ourselves instead of letting it jump instantly.
  function onWheel(e) {
    e.preventDefault();
    userScrolled = true;
    if (retractTween) {
      // User is scrolling before/while the auto-retract is playing — hand
      // control over immediately instead of letting both tweens fight over
      // the same scrollTop (which could stall the retract/title reveal).
      wheelTarget = scrollEl.scrollTop;
      retractTween.kill();
      retractTween = null;
    }
    const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
    wheelTarget = Math.min(Math.max(wheelTarget + e.deltaY, 0), maxScroll);
    wheelTween && wheelTween.kill();
    wheelTween = gsap.to(scrollEl, {
      scrollTop: wheelTarget,
      duration: 1,
      ease: "power3.out",
      onUpdate: onScroll,
    });
  }

  function fillMedia(card) {
    mediaSlot.innerHTML = "";
    const source = card.querySelector("img, video");
    if (!source) return;
    const clone = source.cloneNode(true);
    if (clone.tagName === "VIDEO") {
      clone.autoplay = true;
      clone.muted = true;
      clone.loop = true;
      clone.playsInline = true;
    }
    mediaSlot.appendChild(clone);
  }

  // Clips the hero's bottom edge away as scrollTop grows, so it looks like the
  // media retracts upward under the top bar — never resizes/distorts the image.
  function onScroll() {
    const progress = Math.min(Math.max(scrollEl.scrollTop / shrinkRange(), 0), 1);
    gsap.set(hero, { "--hero-clip": `${progress * 100}%` });
  }

  function openLightbox(card) {
    if (isOpen) return;
    isOpen = true;

    const slide = card.closest(".project-slide");
    clientEl.textContent = slide ? slide.querySelector(".project-client")?.textContent ?? "" : "";
    headingEl.textContent = slide ? slide.querySelector(".project-heading")?.textContent ?? "" : "";
    yearEl.textContent = slide ? slide.querySelector(".project-year")?.textContent ?? "" : "";

    fillMedia(card);
    scrollEl.scrollTop = 0;
    wheelTarget = 0;
    userScrolled = false;

    gsap.set(panel, { "--lightbox-inset": "49.7%" });
    gsap.set(hero, { "--hero-clip": "0%" });
    gsap.set(mediaSlot, { scale: 1.18 });
    gsap.set(closeBtn, { opacity: 0 });
    armTitleReveal();

    lightbox.classList.add("is-active");
    lightbox.setAttribute("aria-hidden", "false");
    if (lenis) lenis.stop();

    activeTween && activeTween.kill();
    retractTween && retractTween.kill();
    wheelTween && wheelTween.kill();
    scrollEl.addEventListener("wheel", onWheel, { passive: false });
    activeTween = gsap.timeline({
      onComplete: () => {
        scrollEl.addEventListener("scroll", onScroll);
        if (userScrolled) return; // user already took control — don't yank it back
        // Flash the full image briefly, then auto-retract it toward the top
        // bar via clip-path, scrolling the case-study content into view.
        retractTween = gsap.to(scrollEl, {
          scrollTop: shrinkRange(),
          duration: 0.9,
          delay: 0.35,
          ease: "power3.inOut",
          onUpdate: onScroll,
          onComplete: () => {
            wheelTarget = shrinkRange();
          },
        });
      },
    });
    activeTween
      .to(panel, { "--lightbox-inset": "0%", duration: 0.85, ease: "power4.inOut" })
      .to(mediaSlot, { scale: 1, duration: 0.85, ease: "power4.inOut" }, "<")
      .to(closeBtn, { opacity: 1, duration: 0.3 }, "-=0.15");
  }

  function closeLightbox() {
    if (!isOpen) return;
    isOpen = false;

    scrollEl.removeEventListener("scroll", onScroll);
    scrollEl.removeEventListener("wheel", onWheel);
    retractTween && retractTween.kill();
    wheelTween && wheelTween.kill();
    titleObserver && titleObserver.disconnect();

    activeTween && activeTween.kill();
    activeTween = gsap.timeline({
      onComplete: () => {
        lightbox.classList.remove("is-active");
        lightbox.setAttribute("aria-hidden", "true");
        mediaSlot.innerHTML = "";
        if (lenis) lenis.start();
      },
    });
    activeTween
      .to(titleBar, { opacity: 0, yPercent: -30, duration: 0.3, ease: "power2.in" })
      .to(closeBtn, { opacity: 0, duration: 0.2 }, "<")
      .to(panel, { "--lightbox-inset": "49.7%", duration: 0.6, ease: "power4.inOut" }, "-=0.05");
  }

  cards.forEach((card) => {
    card.addEventListener("click", (e) => {
      e.preventDefault();
      openLightbox(card);
    });
  });

  closeBtn.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}

/* ==========================================================================
   Testimonials Section (Framer Stacking Cards & Background Transition)
   ========================================================================== */
function initTestimonialsScroll() {
  const section = document.getElementById("testimonials");
  const cardContainer = document.getElementById("worksRevealCard");
  const cards = document.querySelectorAll(".testimonial-card");
  const title = section ? section.querySelector(".testimonials-title") : null;

  if (!section || cards.length === 0) return;
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  // 1. Smooth Background Color Transition from White to Black on the unified works container
  const bgTarget = cardContainer || section;
  gsap.fromTo(
    bgTarget,
    { backgroundColor: "#ffffff" },
    {
      backgroundColor: "#000000",
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top 95%", // Begins transition as testimonials approaches viewport
        end: "top top", // Fully solid black exactly when pinned at top
        scrub: true,
        invalidateOnRefresh: true,
      },
    }
  );

  // 2. Centered Header Reveal Animation (Like About Section: Eyebrow then Title)
  const eyebrow = section.querySelector(".testimonials-eyebrow");
  if (eyebrow && title) {
    gsap.set(eyebrow, { opacity: 0, y: 30 });
    gsap.set(title, { opacity: 0, y: 45 });

    const headerRevealTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 85%",
        end: "top top", // Finishes exactly as the pin engages for a seamless handoff into the stack
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });

    headerRevealTl.to(eyebrow, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
    });

    headerRevealTl.to(
      title,
      {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: "power2.out",
      },
      "+=0.1"
    );
  }

  // 3. Framer-Style Stacking Cards Animation (Solid Cards, Entrance from Outside of Screen)
  mm.add("(min-width: 901px)", () => {
    const HEADER_OFFSET = 78; // Height of card header row so name is always visible above
    const CARD_STEP = 0.85; // Overlap between successive card entrances for a continuous cascading flow

    // Calculate Y distance to place cards completely outside the bottom of the screen
    function getOffscreenY() {
      return window.innerHeight + 60;
    }

    // Initial card state: all cards start completely outside of the screen, 100% solid
    cards.forEach((card, index) => {
      gsap.set(card, {
        zIndex: index + 1,
        y: getOffscreenY(),
        yPercent: 0,
        opacity: 1, // Completely solid, NO transparency / ghosting while stacking
      });
    });

    const stackTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=4800",
        pin: true,
        pinSpacing: true,
        pinType: "fixed",
        scrub: 0.5,
        invalidateOnRefresh: true,
      },
    });

    // Each card's entrance overlaps the previous one's so the cascade reads as one
    // continuous motion instead of separate stop-start steps.
    cards.forEach((card, index) => {
      stackTl.fromTo(
        card,
        { y: () => getOffscreenY(), yPercent: 0, opacity: 1 },
        {
          y: HEADER_OFFSET * index,
          yPercent: 0,
          duration: 0.9,
          ease: "power2.out",
        },
        index * CARD_STEP
      );
    });

    // Generous hold duration so the final stacked state stays rock-solid in place
    // without unpinning or shifting when the user scrolls a bit
    stackTl.to({}, { duration: 1.4 });

    return () => {
      stackTl.kill();
      cards.forEach((card) => gsap.set(card, { clearProps: "all" }));
    };
  });

  // Mobile fallback (solid cards displayed cleanly in column)
  mm.add("(max-width: 900px)", () => {
    cards.forEach((card) => {
      gsap.set(card, { opacity: 1, yPercent: 0, y: 0 });
    });
  });
}

/* ==========================================================================
   Services Section Reveal Animation (GSAP + ScrollTrigger)
   ========================================================================== */
function initServicesScroll() {
  const section = document.getElementById("services");
  if (!section) return;
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  const header = section.querySelector(".services-header");

  // Background transitions from black (matching the end of testimonials) to white as the section scrolls into view
  gsap.fromTo(
    section,
    { backgroundColor: "#000000" },
    {
      backgroundColor: "#ffffff",
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "top 78%", // Finishes just before the header/card content starts fading in below
        scrub: true,
        invalidateOnRefresh: true,
      },
    }
  );

  // Animate header statement (scrubbed to scroll position so the reveal is
  // always visible progressing as you scroll, not a fixed-timer fade you can scroll past)
  if (header) {
    gsap.fromTo(
      header,
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 90%",
          end: "top 55%",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      }
    );
  }
}

/* ==========================================================================
   Services Cards Horizontal Reveal (pinned — section locks in place while the
   track slides left; the last card starts fully off-screen and the pin
   releases once all 4 cards are fully in view)
   ========================================================================== */
function initServicesHorizontalScroll() {
  const section = document.getElementById("servicesCardsSection");
  const track = document.getElementById("servicesTrack");
  const cards = document.querySelectorAll(".service-card");

  if (!section || !track || cards.length < 2) return;
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  mm.add("(min-width: 901px)", () => {
    // Cards divide the track evenly with no natural overflow, so shifting the
    // whole track right by exactly one card's slot (card + gap) hides the
    // last card completely while opening an equal blank slot on the left.
    function getSlot() {
      return cards[1].offsetLeft - cards[0].offsetLeft;
    }

    const revealTween = gsap.fromTo(
      track,
      { x: () => getSlot() },
      {
        x: 0,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getSlot() * 3}`, // generous distance so the scrub feels smooth, not abrupt
          pin: true,
          pinSpacing: true,
          pinType: "fixed",
          scrub: true, // ties directly to scroll position; avoids extra lag stacking on top of Lenis's own smoothing
          invalidateOnRefresh: true,
        },
      }
    );

    return () => {
      revealTween.kill();
      gsap.set(track, { clearProps: "all" });
    };
  });
}

/* ==========================================================================
   Footer — live local time + back-to-top
   ========================================================================== */
function initFooter() {
  const clockEl = document.getElementById("footerLocalTime");
  const toTopBtn = document.getElementById("footerToTop");

  if (clockEl) {
    const updateClock = () => {
      const now = new Date();
      const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      const offset = -now.getTimezoneOffset() / 60;
      const sign = offset >= 0 ? "+" : "";
      clockEl.textContent = `${time} UTC${sign}${offset}`;
    };
    updateClock();
    setInterval(updateClock, 30000);
  }

  if (toTopBtn) {
    toTopBtn.addEventListener("click", () => {
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.4 });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  initFooterBend();
  initFooterNameReveal();
}

/* ==========================================================================
   Footer Giant Name Reveal — each letter rises up from below and sharpens
   out of a blur, one after another, as the footer scrolls into view.
   ========================================================================== */
function initFooterNameReveal() {
  const nameEl = document.getElementById("footerGiantName");
  const letters = document.querySelectorAll(".footer-letter");

  if (!nameEl || letters.length === 0) return;
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.set(letters, { opacity: 0, y: 60, filter: "blur(14px)" });

  gsap.to(letters, {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    duration: 0.8,
    ease: "power2.out",
    stagger: 0.06,
    scrollTrigger: {
      trigger: nameEl,
      start: "top 90%",
      end: "top 40%",
      scrub: 0.6,
    },
  });
}

/* ==========================================================================
   Footer Top-Edge Bend — starts as a downward-sagging parabola (page
   background dipping into the dark footer) and straightens flat on scroll.
   ========================================================================== */
function initFooterBend() {
  const footer = document.getElementById("siteFooter");
  const bendPath = document.getElementById("footerBendTopPath");

  if (!footer || !bendPath) return;
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  const MAX_BEND = 150;

  function setBend(bend) {
    bendPath.setAttribute("d", `M 0,0 Q 720,${bend} 1440,0 L 1440,0 L 0,0 Z`);
  }

  setBend(MAX_BEND);

  ScrollTrigger.create({
    trigger: footer,
    start: "top bottom",
    end: "top top",
    scrub: 0.6,
    onUpdate: (self) => setBend(MAX_BEND * (1 - self.progress)),
  });
}


