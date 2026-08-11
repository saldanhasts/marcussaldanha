    (function () {
      var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // header scroll state
      var header = document.getElementById('site-header');
      function onScroll() {
        if (window.scrollY > 30) { header.classList.add('scrolled'); } else { header.classList.remove('scrolled'); }
      }
      document.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      // mobile menu
      var burger = document.getElementById('burger');
      var menu = document.getElementById('mobileMenu');
      burger.addEventListener('click', function () {
        var open = menu.classList.toggle('open');
        burger.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', open);
        document.body.style.overflow = open ? 'hidden' : '';
      });
      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          menu.classList.remove('open'); burger.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
        });
      });

      // reveal on scroll
      var revealEls = document.querySelectorAll('[data-reveal]');
      if ('IntersectionObserver' in window && !reduced) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
          });
        }, { threshold: .15, rootMargin: '0px 0px -60px 0px' });
        revealEls.forEach(function (el) { io.observe(el); });
      } else {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
      }

      // animated counters
      var counters = document.querySelectorAll('[data-count]');
      function animateCount(el) {
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        if (reduced) { el.textContent = target + suffix; return; }
        var start = 0, duration = 1400, startTime = null;
        function step(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var val = Math.round(start + (target - start) * eased);
          el.textContent = val + suffix;
          if (progress < 1) { requestAnimationFrame(step); }
        }
        requestAnimationFrame(step);
      }
      if ('IntersectionObserver' in window) {
        var cio = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) { animateCount(entry.target); cio.unobserve(entry.target); }
          });
        }, { threshold: .6 });
        counters.forEach(function (el) { cio.observe(el); });
      } else {
        counters.forEach(function (el) { el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || ''); });
      }

      // hero cursor spotlight (pointer devices only)
      var hero = document.getElementById('hero');
      var spotlight = document.getElementById('heroSpotlight');
      if (hero && spotlight && !reduced && window.matchMedia('(hover:hover)').matches) {
        hero.addEventListener('mousemove', function (e) {
          var r = hero.getBoundingClientRect();
          var x = ((e.clientX - r.left) / r.width) * 100;
          var y = ((e.clientY - r.top) / r.height) * 100;
          spotlight.style.setProperty('--mx', x + '%');
          spotlight.style.setProperty('--my', y + '%');
        });
      }

      // portfolio tilt
      if (!reduced && window.matchMedia('(hover:hover)').matches) {
        document.querySelectorAll('.pf-card.tilt').forEach(function (card) {
          card.addEventListener('mousemove', function (e) {
            var r = card.getBoundingClientRect();
            var px = (e.clientX - r.left) / r.width - .5;
            var py = (e.clientY - r.top) / r.height - .5;
            card.style.transform = 'perspective(900px) rotateX(' + (py * -6) + 'deg) rotateY(' + (px * 8) + 'deg) translateY(-6px)';
          });
          card.addEventListener('mouseleave', function () {
            card.style.transform = '';
          });
        });
      }

      // faq accordion
      document.querySelectorAll('.faq-item').forEach(function (item) {
        var btn = item.querySelector('.faq-q');
        btn.addEventListener('click', function () {
          item.classList.toggle('open');
        });
      });
    })();