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
  initTechWheel();
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
   Skills & Tech Stack Wheel (horizontal cascading card stack, matches
   guillaumezhu.com's toolkit section: one colored card is active/centered/
   full-size at a time; as the next one takes over, previous cards recede to
   the left into an overlapping, individually-rotated pile, pinned and driven
   continuously by scroll — same "focus lens" technique as the testimonials
   section, just horizontal instead of vertical)
   ========================================================================== */
function initTechWheel() {
  const wheel = document.getElementById("techWheel");
  const section = document.getElementById("tech-stack");
  if (!wheel || !section) return;
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  const slots = Array.from(wheel.querySelectorAll(".tech-wheel-slot"));
  const N = slots.length;
  const LANE_STEP = 46; // px each successive card's "home" position sits to the right of the previous
  // Deterministic small per-card rotation for a scattered-playing-cards look
  const cardAngle = (i) => (((i * 37) % 11) - 5) * 1.1;

  // Heading reveal as the section scrolls into view
  const container = section.querySelector(".tech-stack-container");
  if (container) {
    gsap.fromTo(
      container,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          end: "top 50%",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      }
    );
  }

  function layoutCards(focus) {
    slots.forEach((slot, i) => {
      const distance = i - focus;
      const isActive = Math.abs(distance) < 0.02;
      const scale = isActive ? 1 : 0.9;
      const opacity = distance > 0.5 ? 0 : 1; // not-yet-reached cards stay hidden off to the right
      // The whole lane shifts left as focus advances, keeping the focused
      // card's "home" position centered at x:0 — already-active cards drift
      // further left (retired into the pile) the more the focus moves on.
      const x = (i - focus) * LANE_STEP;
      gsap.set(slot, {
        x,
        y: isActive ? -14 : 0,
        scale,
        opacity,
        rotate: isActive ? 0 : cardAngle(i),
        zIndex: i,
      });
    });
  }

  gsap.set(slots, { opacity: 0 });
  layoutCards(0);

  const focusState = { value: 0 };
  const PX_PER_CARD = 260;
  const pinDistance = (N - 1) * PX_PER_CARD;

  const wheelTl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "+=" + pinDistance,
      pin: true,
      pinSpacing: true,
      pinType: "fixed",
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });
  wheelTl.to(focusState, {
    value: N - 1,
    ease: "none",
    duration: 1,
    onUpdate: () => layoutCards(focusState.value),
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

  if (!lightbox || !panel || !scrollEl || !hero || !mediaSlot || !titleBar || cards.length === 0)
    return;
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
    clientEl.textContent = slide ? (slide.querySelector(".project-client")?.textContent ?? "") : "";
    headingEl.textContent = slide
      ? (slide.querySelector(".project-heading")?.textContent ?? "")
      : "";
    yearEl.textContent = slide ? (slide.querySelector(".project-year")?.textContent ?? "") : "";

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
   Testimonials Section (single-slide reveal, advances one-per-scroll-step)
   ========================================================================== */
function initTestimonialsScroll() {
  const section = document.getElementById("testimonials");
  const cardContainer = document.getElementById("worksRevealCard");
  const tagEl = document.getElementById("testimonialTag");
  const quoteEl = document.getElementById("testimonialQuote");
  const avatarEl = document.getElementById("testimonialAvatar");
  const nameEl = document.getElementById("testimonialName");
  const roleEl = document.getElementById("testimonialRole");
  const indexBgEl = document.getElementById("testimonialIndexBg");
  const personEl = document.getElementById("testimonialPerson");
  const prevBtn = document.getElementById("testimonialPrev");
  const nextBtn = document.getElementById("testimonialNext");

  if (!section || !tagEl || !quoteEl) return;
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  const testimonials = [
    {
      company: "CraftedAI",
      quote:
        "Nahid's work in UX design exceeded my expectations, with incredible attention to detail and creativity. His proactive communication made the whole collaboration smooth from start to finish.",
      name: "Habibullah Nahid",
      role: "Founder and CEO",
      avatar: "./resources/testimonial-1.jpg",
    },
    {
      company: "CraftedAI",
      quote:
        "Extremely creative and efficient to work with. I needed an entire CRM system designed from scratch, and Nahid delivered beyond my expectations. Will definitely be working with him again.",
      name: "Pike Wrang",
      role: "Founder and CEO",
      avatar: "./resources/testimonial-2.jpg",
    },
    {
      company: "CraftedAI",
      quote:
        "I would give Nahid a 20-star review if I could. My delivery exceeded expectations in both quality and service — if you need someone who turns loose requirements into a polished product, book him.",
      name: "Rose Jonson",
      role: "Founder and CEO",
      avatar: "./resources/testimonial-3.jpg",
    },
    {
      company: "CraftedAI",
      quote:
        "Nahid is everything that makes a project perfect: attention to detail, thoughtful feedback, and real talent. Absolutely book him if you want the best experience — you won't regret it.",
      name: "ADM Absc Louis",
      role: "Founder and CEO",
      avatar: "./resources/testimonial-4.jpg",
    },
  ];

  const N = testimonials.length;
  const PX_PER_STEP = 900; // scroll pixels needed to advance one testimonial (shared with the pin below)
  const pinDistance = (N - 1) * PX_PER_STEP;

  // ONE unified white -> black -> white timeline on the shared works-reveal
  // container, covering testimonials' approach all the way through Services'
  // exit (the section itself stays transparent). This MUST be a single
  // ScrollTrigger/timeline rather than two independent scrub tweens: with
  // `scrub`, a tween's value at any scroll position before its own trigger
  // range is clamped to progress 0 (its "from" state) — so a second separate
  // black->white tween further down the page forces black onto this shared
  // element from the moment it's created (page load), before the user has
  // scrolled anywhere near it, which turned the EARLIER Projects/Cases
  // section (sharing the same ancestor) black from the very start. One
  // continuous timeline has a single unambiguous "before" state (white).
  //
  // The black->white fade is positioned to start EXACTLY when the pin
  // releases (right after the 4th/last testimonial finishes) — computed in
  // real pixels (not a guessed timeline fraction): "top 95%" to "top top" is
  // 0.95 * viewport-height of scroll, then the pin itself lasts
  // `pinDistance`. Using those same pixel numbers as both the timeline's
  // "time" units and the ScrollTrigger's actual scroll range makes the
  // mapping exact.
  const bgTarget = cardContainer || section;
  const darkenDur = 500;
  const fadeOutDur = 650;
  // Plain number, computed once (matches how the pin's own `end` below is
  // also a fixed number, not resize-reactive) — GSAP timeline child
  // POSITION parameters (unlike ScrollTrigger's start/end) don't support
  // functions; passing one silently falls back to "right after the previous
  // tween", which was placing the fade way too early.
  const gapToPinStart = 0.95 * window.innerHeight;
  const pinReleasePoint = gapToPinStart + pinDistance;
  const colorTl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top 95%",
      end: "+=" + (pinReleasePoint + fadeOutDur),
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });
  colorTl.fromTo(bgTarget, { backgroundColor: "#ffffff" }, { backgroundColor: "#000000", ease: "none", duration: darkenDur }, 0);
  // (implicit hold at black through the pin — no tween needed, it just stays)
  colorTl.to(bgTarget, { backgroundColor: "#ffffff", ease: "none", duration: fadeOutDur }, pinReleasePoint);
  let currentIndex = -1;
  let revealTl = null;

  function renderSlide(index, animate) {
    const data = testimonials[index];

    tagEl.textContent = data.company;
    avatarEl.src = data.avatar;
    avatarEl.alt = data.name;
    nameEl.textContent = data.name;
    roleEl.textContent = data.role;
    indexBgEl.textContent = String(index + 1).padStart(2, "0");

    quoteEl.innerHTML = "";
    data.quote.split(" ").forEach((word) => {
      const span = document.createElement("span");
      span.className = "t-word";
      span.textContent = word;
      quoteEl.appendChild(span);
      quoteEl.appendChild(document.createTextNode(" "));
    });
    const words = quoteEl.querySelectorAll(".t-word");

    if (revealTl) revealTl.kill();

    if (!animate) {
      gsap.set(tagEl, { opacity: 1, x: 0 });
      gsap.set(words, { opacity: 1, y: 0, filter: "blur(0px)" });
      gsap.set(personEl, { opacity: 1, y: 0 });
      return;
    }

    revealTl = gsap.timeline();
    // Tag: reveals left-to-right with opacity
    revealTl.fromTo(tagEl, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.55, ease: "power3.out" });
    // Quote: word-by-word, blurred -> sharp (settles into focus like sand)
    revealTl.fromTo(
      words,
      { opacity: 0, y: 14, filter: "blur(8px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power3.out", stagger: 0.03 },
      "-=0.2"
    );
    // Person block: only starts once the quote has fully finished revealing
    // (no explicit position — GSAP appends it right after the previous
    // tween, including its stagger, ends).
    revealTl.fromTo(
      personEl,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    );
  }

  function goToIndex(index) {
    const clamped = Math.max(0, Math.min(N - 1, index));
    if (clamped === currentIndex) return;
    currentIndex = clamped;
    renderSlide(currentIndex, true);
  }

  // First slide appears instantly (no animation) as soon as it's built
  goToIndex(0);
  renderSlide(0, false);

  // Item-by-item reveal (same technique as the About section's initTextReveal:
  // a single scrubbed timeline that reveals each piece in sequence with
  // opacity + y, using "+=" relative offsets for a cascading feel) instead of
  // the whole block fading in as one flat unit. Set AFTER the instant render
  // above so these hidden states win over renderSlide's instant-visible ones.
  const headingEl = section.querySelector(".testimonials-heading");
  const quoteBlock = section.querySelector(".testimonial-quote");
  const footerBlock = section.querySelector(".testimonial-footer");

  if (headingEl) gsap.set(headingEl, { opacity: 0, y: 40 });
  gsap.set(tagEl, { opacity: 0, y: 40 });
  if (quoteBlock) gsap.set(quoteBlock, { opacity: 0, y: 55 });
  if (footerBlock) gsap.set(footerBlock, { opacity: 0, y: 45 });

  const entranceTl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top 45%",
      end: "top 5%",
      scrub: 1.4,
      invalidateOnRefresh: true,
    },
  });

  if (headingEl) {
    entranceTl.to(headingEl, { opacity: 1, y: 0, duration: 1.1, ease: "sine.out" });
  }
  entranceTl.to(tagEl, { opacity: 1, y: 0, duration: 1.1, ease: "sine.out" }, "+=0.2");
  if (quoteBlock) {
    entranceTl.to(quoteBlock, { opacity: 1, y: 0, duration: 1.5, ease: "sine.out" }, "+=0.2");
  }
  if (footerBlock) {
    entranceTl.to(footerBlock, { opacity: 1, y: 0, duration: 1.2, ease: "sine.out" }, "+=0.2");
  }

  prevBtn && prevBtn.addEventListener("click", () => goToIndex(currentIndex - 1));
  nextBtn && nextBtn.addEventListener("click", () => goToIndex(currentIndex + 1));

  const mm = gsap.matchMedia();

  mm.add("(min-width: 901px)", () => {
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "+=" + pinDistance,
      pin: true,
      pinSpacing: true,
      pinType: "fixed",
      // No `snap` here — GSAP's own snap-settle tween fires extra onUpdate
      // calls as it eases the scroll position to the nearest point, which
      // was flipping the rounded index a second time right after the first
      // reveal (looked like the animation "playing twice"). Rounding
      // `self.progress` below is already enough to keep exactly one
      // testimonial showing at a time.
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const idx = Math.round(self.progress * (N - 1));
        goToIndex(idx);
      },
    });

    return () => {
      st.kill();
    };
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

  // Background (white -> black -> white) is handled entirely by the single
  // unified timeline in initTestimonialsScroll — see the comment there for
  // why it must be one shared timeline rather than a separate tween here.

  // Header statement reveal — same later start / slower, smoother scrub
  // pacing as the testimonials section's item-by-item reveal.
  if (header) {
    gsap.fromTo(
      header,
      { opacity: 0, y: 45 },
      {
        opacity: 1,
        y: 0,
        ease: "sine.out",
        scrollTrigger: {
          trigger: section,
          start: "top 45%",
          end: "top 5%",
          scrub: 1.4,
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
