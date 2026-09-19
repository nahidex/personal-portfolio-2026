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

  mm.add("(min-width: 901px)", () => {
    // Initial state: centered rounded card on black background
    gsap.set(card, {
      width: "90vw",
      borderTopLeftRadius: 36,
      borderTopRightRadius: 36,
    });

    const revealTween = gsap.to(card, {
      width: "100%",
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      ease: "none",
      scrollTrigger: {
        trigger: wrapper,
        start: "top 85%", // Starts expanding as wrapper enters viewport
        end: "top 25%", // Fully expanded to 100% width and flat corners well before pinning
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
      width: "94vw",
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    });

    const revealTweenMobile = gsap.to(card, {
      width: "100%",
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      ease: "none",
      scrollTrigger: {
        trigger: wrapper,
        start: "top 85%",
        end: "top 20%",
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
        start: "top top", // Pins cleanly when section reaches the very top of the viewport
        end: () => `+=${getScrollAmount()}`,
        pin: true,
        pinSpacing: true,
        pinType: "fixed",
        anticipatePin: 1,
        scrub: 1,
        invalidateOnRefresh: true,
        fastScrollEnd: true,
      },
    });

    return () => {
      horizontalTween.kill();
      gsap.set(track, { clearProps: "all" });
    };
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
        end: "top 15%",
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
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    // Step 0: 1st Card (Habibullah Nahid) slides up from outside the screen to y = 0
    stackTl.fromTo(
      cards[0],
      { y: () => getOffscreenY(), yPercent: 0, opacity: 1 },
      {
        y: 0,
        yPercent: 0,
        duration: 1,
        ease: "power2.out",
      },
      0
    );

    // Step 1: Card 1 (Pike Wrang) slides up from outside the screen to y = 78px
    if (cards[1]) {
      stackTl.fromTo(
        cards[1],
        { y: () => getOffscreenY(), yPercent: 0, opacity: 1 },
        {
          y: HEADER_OFFSET * 1,
          yPercent: 0,
          duration: 1,
          ease: "power2.out",
        },
        1
      );
    }

    // Step 2: Card 2 (Rose Jonson) slides up from outside the screen to y = 156px
    if (cards[2]) {
      stackTl.fromTo(
        cards[2],
        { y: () => getOffscreenY(), yPercent: 0, opacity: 1 },
        {
          y: HEADER_OFFSET * 2,
          yPercent: 0,
          duration: 1,
          ease: "power2.out",
        },
        2
      );
    }

    // Step 3: Card 3 (ADM Absc Louis) slides up from outside the screen to y = 234px
    if (cards[3]) {
      stackTl.fromTo(
        cards[3],
        { y: () => getOffscreenY(), yPercent: 0, opacity: 1 },
        {
          y: HEADER_OFFSET * 3,
          yPercent: 0,
          duration: 1,
          ease: "power2.out",
        },
        3
      );
    }

    // Step 4: Generous hold duration so the final stacked state stays rock-solid in place
    // without unpinning or shifting when the user scrolls a bit
    stackTl.to({}, { duration: 1.8 });

    // Click on card headers to scroll directly to that card's position in the stack
    cards.forEach((card, index) => {
      const header = card.querySelector(".testimonial-card-header");
      if (header) {
        header.addEventListener("click", () => {
          if (stackTl.scrollTrigger) {
            const st = stackTl.scrollTrigger;
            // Target progress is when this card reaches its resting position (time = index + 1)
            const targetProgress = (index + 1) / stackTl.duration();
            const targetScroll =
              st.start + targetProgress * (st.end - st.start);
            if (typeof lenis !== "undefined" && lenis) {
              lenis.scrollTo(targetScroll, { duration: 1.0 });
            } else {
              window.scrollTo({ top: targetScroll, behavior: "smooth" });
            }
          }
        });
      }
    });

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
  const cards = section.querySelectorAll(".service-card");
  const wavePath = section.querySelector(".services-neon-path");

  // Animate header statement
  if (header) {
    gsap.fromTo(
      header,
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }

  // Animate cards with stagger
  if (cards.length > 0) {
    gsap.fromTo(
      cards,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".services-grid",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }

  // Subtle wave curve parallax on scroll
  if (wavePath) {
    gsap.fromTo(
      wavePath,
      { opacity: 0.8, y: 20 },
      {
        opacity: 1,
        y: -10,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      }
    );
  }
}


