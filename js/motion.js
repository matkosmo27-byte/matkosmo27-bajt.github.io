/* Shared smooth scrolling and reveal motion for all public site pages. */
(() => {
  // Opt in to short cross-page transitions on browsers that support the View Transitions API.
  const pageTransitions = document.createElement('style');
  pageTransitions.textContent =
    "@view-transition { navigation: auto; }\n" +
    "::view-transition-old(root) { animation: five-page-out 180ms ease-out both; }\n" +
    "::view-transition-new(root) { animation: five-page-in 260ms cubic-bezier(.22,.8,.2,1) both; }\n" +
    "@keyframes five-page-out { to { opacity: 0; transform: translateY(-4px); filter: blur(2px); } }\n" +
    "@keyframes five-page-in { from { opacity: 0; transform: translateY(8px); filter: blur(3px); } to { opacity: 1; transform: none; filter: none; } }\n" +
    "@media (prefers-reduced-motion: reduce) { @view-transition { navigation: none; } ::view-transition-group(root), ::view-transition-old(root), ::view-transition-new(root) { animation: none !important; } }";
  document.head.append(pageTransitions);
  if (!document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.animate(
      [{ opacity: 0, filter: 'blur(2px)' }, { opacity: 1, filter: 'blur(0px)' }],
      { duration: 240, easing: 'cubic-bezier(.22,.8,.2,1)' }
    );
  }

  if (!window.gsap || !window.ScrollTrigger || !window.Lenis) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.FIVE_DRAGONS_GSAP = true;
  gsap.registerPlugin(ScrollTrigger);

  const compatibility = document.createElement('style');
  compatibility.textContent = `
    html.lenis, html.lenis body { height: auto; }
    html.lenis { scroll-behavior: auto !important; }
    [data-gsap-motion] .hero .container,
    [data-gsap-motion] .hero .tag,
    [data-gsap-motion] .hero h1,
    [data-gsap-motion] .hero p,
    [data-gsap-motion] .hero-actions,
    [data-gsap-motion] .hero-meta,
    [data-gsap-motion] .section-head,
    [data-gsap-motion] .intro-copy,
    [data-gsap-motion] .principle,
    [data-gsap-motion] .grid .card,
    [data-gsap-motion] .stat-strip,
    [data-gsap-motion] .cta-panel,
    [data-gsap-motion] .footer { animation: none !important; }
    [data-gsap-motion] .scroll-reveal { opacity: 1 !important; transform: none !important; filter: none !important; transition: none !important; }
  `;
  document.head.append(compatibility);

  let lenis;
  if (!reducedMotion) {
    lenis = new Lenis({
      duration: 1.12,
      easing: time => Math.min(1, 1.001 - Math.pow(2, -10 * time)),
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.1
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  if (reducedMotion) return;

  const revealGroup = (elements, trigger, options = {}) => {
    if (!elements.length || !trigger) return;
    gsap.fromTo(elements,
      { autoAlpha: 0, y: options.y ?? 28, filter: options.blur ? 'blur(9px)' : 'blur(0px)', x: options.x ?? 0 },
      {
        autoAlpha: 1, y: 0, x: 0, filter: 'blur(0px)', duration: options.duration ?? 0.78,
        ease: 'power3.out', stagger: options.stagger ?? 0.12,
        scrollTrigger: { trigger, start: options.start ?? 'top 82%', once: true }
      }
    );
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.body.dataset.gsapMotion = 'ready';

    const heroItems = document.querySelectorAll('.hero .container > *');
    if (heroItems.length) {
      gsap.fromTo(heroItems,
        { autoAlpha: 0, y: 26, filter: 'blur(7px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.78, ease: 'power3.out', stagger: 0.11, delay: 0.08 }
      );
    }

    const heroButtons = document.querySelectorAll('.home-hero .hero-actions .btn');
    if (heroButtons.length) {
      gsap.to(heroButtons, {
        boxShadow: '0 14px 38px rgba(229,9,20,.31), 0 0 22px rgba(229,9,20,.14)',
        duration: 1.6, ease: 'sine.inOut', repeat: -1, yoyo: true, stagger: 0.16, delay: 1.1
      });
    }

    document.querySelectorAll('.section').forEach(section => {
      const heading = section.querySelector('.section-head');
      if (heading) revealGroup([heading], heading, { y: 22, blur: true, start: 'top 86%' });

      const principles = section.querySelectorAll('.principle');
      if (principles.length) revealGroup(principles, principles[0].parentElement, { y: 34, blur: true, stagger: 0.16 });

      const cards = section.querySelectorAll('.grid .card');
      if (cards.length) revealGroup(cards, cards[0].parentElement, { y: 30, blur: true, stagger: 0.13 });

      const copy = section.querySelector('.intro-copy');
      if (copy) revealGroup([copy], section, { y: 26, blur: true });

      const stats = section.querySelectorAll('.stat-strip > div');
      if (stats.length) revealGroup(stats, section, { y: 20, stagger: 0.1 });

      const cta = section.querySelector('.cta-panel');
      if (cta) revealGroup([cta], cta, { y: 32, blur: true });
    });

    // News and match cards arrive asynchronously from the academy API.
    const observedGrids = new WeakSet();
    document.querySelectorAll('[data-news], [data-matches], [data-players]').forEach(grid => {
      const revealCards = () => {
        const cards = [...grid.querySelectorAll('.card')].filter(card => !card.dataset.gsapRevealed);
        if (!cards.length) return;
        cards.forEach(card => { card.dataset.gsapRevealed = 'true'; });
        revealGroup(cards, grid, { y: 28, x: grid.matches('[data-matches]') ? -24 : 0, blur: true, stagger: 0.14 });
        ScrollTrigger.refresh();
      };
      revealCards();
      if (!observedGrids.has(grid)) {
        observedGrids.add(grid);
        new MutationObserver(revealCards).observe(grid, { childList: true, subtree: true });
      }
    });

    ScrollTrigger.refresh();
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
