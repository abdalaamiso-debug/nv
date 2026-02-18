/* script.js
   Comportements JS : menu mobile, scroll animé, animations on-scroll
*/

document.addEventListener('DOMContentLoaded', function(){
  // Mobile menu toggle
  const burger = document.getElementById('burger');
  const nav = document.getElementById('main-nav');
  burger.addEventListener('click', function(){
    nav.classList.toggle('open');
    burger.classList.toggle('open');
  });

  // Animate nav tabs on initial load (PowerPoint-like entrance)
  (function animateNavTabs(){
    const navEl = document.getElementById('main-nav');
    if(!navEl) return;
    const navLinks = navEl.querySelectorAll('.nav-link');
    navLinks.forEach((lnk, i) => {
      lnk.style.transitionDelay = `${i * 120}ms`; // stagger
    });
    // Add class slightly after DOM ready so user sees the entrance
    setTimeout(()=> navEl.classList.add('nav-animated'), 120);

    // Also animate header actions (bouton S'inscrire) after the nav links
    const headerInner = document.querySelector('.header-inner');
    if(headerInner){
      const actionBtns = headerInner.querySelectorAll('.header-actions .btn');
      actionBtns.forEach((b, i)=>{
        // give a delay after nav links complete
        const baseDelay = navLinks.length * 120 + 180; // ms
        b.style.transitionDelay = `${baseDelay + i * 100}ms`;
      });
      // Animate logo: give it a slightly earlier delay than action buttons
      const logoImg = headerInner.querySelector('.logo-img');
      if(logoImg){
        const baseDelay = navLinks.length * 120 + 180;
        const logoDelay = Math.max(80, baseDelay - 120);
        logoImg.style.transitionDelay = `${logoDelay}ms`;
      }
      setTimeout(()=> headerInner.classList.add('header-animated'), navLinks.length * 120 + 180);
    }
  })();

  // (removed inline transition delays) department reveal handled when the section enters view

  // Smooth scroll for internal links (enhanced)
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', function(e){
      const targetId = this.getAttribute('href');
      if(targetId.length > 1){
        const el = document.querySelector(targetId);
        if(el){
          e.preventDefault();
          el.scrollIntoView({behavior:'smooth',block:'start'});
          // close mobile menu after navigation
          if(nav.classList.contains('open')){ nav.classList.remove('open'); }
        }
      }
    });
  });

  // Reveal elements on scroll using IntersectionObserver
  const observerOptions = {threshold:0.12};
  const revealObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
      }
    });
  }, observerOptions);

  // Observe common reveal targets (exclude .feature-card — department cards will be revealed together)
  const targets = document.querySelectorAll('.card, .hero-content, .intro, .news-card, .cta-inner');
  targets.forEach(t => { t.classList.add('reveal'); revealObserver.observe(t); });

  // Reveal department cards when the whole "filieres" section enters view, replay each time
  const filieresSection = document.querySelector('.filieres');
  if(filieresSection){
    const info = filieresSection.querySelector('.dept-info');
    const electro = filieresSection.querySelector('.dept-electro');
    if(info) info.classList.add('reveal');
    if(electro) electro.classList.add('reveal');

    let timeouts = [];
    const clearTimeouts = ()=>{ timeouts.forEach(t=>clearTimeout(t)); timeouts = []; };

    const filieresObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          // play animations (staggered)
          clearTimeouts();
          if(info){ info.classList.remove('in-view'); timeouts.push(setTimeout(()=> info.classList.add('in-view'), 80)); }
          if(electro){ electro.classList.remove('in-view'); timeouts.push(setTimeout(()=> electro.classList.add('in-view'), 260)); }
        } else {
          // when leaving view, remove class so they can replay on next enter
          clearTimeouts();
          if(info) info.classList.remove('in-view');
          if(electro) electro.classList.remove('in-view');
        }
      });
    }, {threshold: 0.22});

    filieresObserver.observe(filieresSection);
  }

  // Interactive buttons: short press animation
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', ()=>{
      btn.classList.add('active');
      setTimeout(()=>btn.classList.remove('active'),220);
    });
  });

  // Carousel: 7 images, start auto-sliding after 2.5s
  // Support du swipe tactile pour mobile/tablette
  (function initHeroCarousel(){
    const carousel = document.getElementById('hero-carousel');
    if(!carousel) return;
    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(track.querySelectorAll('.slide'));
    if(slides.length === 0) return;
    let current = 0;
    const total = slides.length;
    let intervalId = null;

    // direction: 'rtl' moves slides from right to left (next image comes from right)
    const direction = 'rtl';

    // Variables pour le swipe tactile
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 50; // pixels minimum pour considérer comme un swipe

    const goTo = (idx)=>{
      current = (idx + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      updateDots();
    };

    const updateDots = ()=>{
      const dots = carousel.querySelectorAll('.carousel-dots .dot');
      dots.forEach((dot, i)=>{
        if(i === current){
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    };

    // advance one step respecting direction
    const step = ()=>{
      if(direction === 'rtl'){
        goTo(current + 1);
      } else {
        goTo(current - 1);
      }
    };

    const start = ()=>{
      if(intervalId) return;
      intervalId = setInterval(step, 1800); // interval set to 1.8 seconds
    };

    const stop = ()=>{ if(intervalId){ clearInterval(intervalId); intervalId = null; } };

    // Create dots dynamically
    const dotsContainer = document.getElementById('carousel-dots');
    if(dotsContainer){
      dotsContainer.innerHTML = '';
      for(let i=0; i<total; i++){
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.setAttribute('data-index', i);
        dot.addEventListener('click', ()=>{
          stop();
          goTo(i);
          // restart after 3s
          clearTimeout(window.__carouselRestart);
          window.__carouselRestart = setTimeout(()=> start(), 3000);
        });
        dotsContainer.appendChild(dot);
      }
    }

    // start after 2.5s
    setTimeout(start, 2500);

    // pause on hover for better UX (desktop only)
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', ()=>{
      clearTimeout(window.__carouselRestart);
      window.__carouselRestart = setTimeout(()=> start(), 600);
    });

    // ============ SUPPORT TACTILE - SWIPE GESTURES ============
    // Détection du début du toucher
    carousel.addEventListener('touchstart', (e)=>{
      touchStartX = e.changedTouches[0].clientX;
      stop(); // Arrêter l'autoplay lors du contact
    }, false);

    // Détection de la fin du toucher
    carousel.addEventListener('touchend', (e)=>{
      touchEndX = e.changedTouches[0].clientX;
      handleSwipe();
    }, false);

    // Fonction pour gérer le swipe
    const handleSwipe = ()=>{
      const diff = touchStartX - touchEndX;
      const absDiff = Math.abs(diff);

      if(absDiff > swipeThreshold){
        // Swipe vers la gauche (diff positif) -> image suivante
        if(diff > 0){
          goTo(current + 1);
        }
        // Swipe vers la droite (diff négatif) -> image précédente
        else {
          goTo(current - 1);
        }
        
        // Redémarrer l'autoplay après 2s d'inactivité
        clearTimeout(window.__carouselRestart);
        window.__carouselRestart = setTimeout(()=> start(), 2000);
      }
    };

    // Anti-dragging: ajouter user-select:none au carousel pour meilleure UX tactile
    carousel.style.userSelect = 'none';
    carousel.style.webkitUserSelect = 'none';
    carousel.style.touchAction = 'pan-y'; // Autoriser scroll vertical mais pas horizontal non-intentionnel

    // initialize dots
    updateDots();
  })();

});
