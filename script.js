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

/* =========================================================
PORTFOLIO
DRIFT WALL
========================================================= */

(function () {

  var container =
    document.getElementById('portfolioDriftWall');

  if (!container) return;


  /* =======================================================
     CONFIGURAÇÃO
     ======================================================= */

  var reduced =
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;


  var items = [

    {
      image:
        'https://a0.muscache.com/im/pictures/hosting/Hosting-1533772593025815094/original/a507f5ac-2b73-4318-b742-36fd60f4c8cb.png',
      title: 'Casa Zenbali'
    },

    {
      image:
        'assets/about-claudia.jpg',
      title: 'Atrevittá'
    },

    {
      image:
        'https://saldanhasts.github.io/clinica-ginecologia/a-profissional.jpeg',
      title: 'Dra. Daniele Franklin'
    },

    {
      image:
        'https://saldanhasts.github.io/carmemjatoba/capa-zoom-out.jpeg',
      title: 'Salão Carmem Jatobá'
    },

    {
      image:
        'https://saldanhasts.github.io/marcussaldanha/assets/preview.png',
      title: 'Barbearia Premium'
    },

    {
      image:
        'https://dcdn-us.mitiendanube.com/stores/007/952/643/themes/common/logo-9166192163562070950-1785033247-c85b2ac1cec596643092f5ffb567aedf1785033247-320-0.webp',
      title: 'Izabela Baby'
    }

  ];


  var columns = 5;

  var tileHeight = 132;

  var gap = 18;

  var tilt = 16;

  var turn = -14;

  var roll = 0;

  var perspective = 1200;

  var depth = 120;

  var speed = 42;

  var variance = 0.45;

  var parallax = 0.6;


  /* =======================================================
     ELEMENTOS
     ======================================================= */

  var plane =
    document.createElement('div');

  plane.className =
    'portfolio-drift-wall__plane';

  container.appendChild(plane);


  var trackRefs = [];

  var offsets = [];

  var velocities = [];


  var pointer = {
    x: 0,
    y: 0
  };


  var pointerDamped = {
    x: 0,
    y: 0
  };


  var lastTimestamp = null;

  var animationFrame = null;


  /* =======================================================
     FATOR DE VARIAÇÃO
     ======================================================= */

  function columnFactor(index) {

    var pseudo =
      (
        (index * 0.6180339887 + 0.35)
        % 1
      ) * 2 - 1;

    return 1 + variance * pseudo;
  }


  /* =======================================================
     DIVIDIR IMAGENS NAS COLUNAS
     ======================================================= */

  function getColumnItems() {

    var cols =
      Array.from(
        { length: columns },
        function () {
          return [];
        }
      );


    items.forEach(
      function (item, index) {

        cols[
          index % columns
        ].push(item);

      }
    );


    return cols.map(
      function (col) {

        return col.length
          ? col
          : items.slice(0, 1);

      }
    );

  }


  var columnItems =
    getColumnItems();


  /* =======================================================
     CRIAR TILE
     ======================================================= */

  function createTile(item) {

    var tile =
      document.createElement('div');

    tile.className =
      'portfolio-drift-wall__tile';


    var inner =
      document.createElement('span');

    inner.className =
      'portfolio-drift-wall__inner';


    var image =
      document.createElement('img');

    image.src =
      item.image;

    image.alt = '';

    image.loading =
      'lazy';

    image.decoding =
      'async';

    image.draggable =
      false;


    var overlay =
      document.createElement('span');

    overlay.className =
      'portfolio-drift-wall__overlay';

    overlay.setAttribute(
      'aria-hidden',
      'true'
    );


    inner.appendChild(image);

    inner.appendChild(overlay);

    tile.appendChild(inner);


    return tile;

  }


  /* =======================================================
     CONSTRUIR WALL
     ======================================================= */

  function buildWall() {

    plane.innerHTML = '';

    trackRefs = [];

    offsets = [];

    velocities = [];


    var containerHeight =
      container.offsetHeight || 600;


    columnItems.forEach(
      function (column, columnIndex) {

        var col =
          document.createElement('div');

        col.className =
          'portfolio-drift-wall__col';


        var track =
          document.createElement('div');

        track.className =
          'portfolio-drift-wall__track';


        var unit =
          tileHeight + gap;


        var copyHeight =
          Math.max(
            unit,
            column.length * unit
          );


        var copies =
          Math.max(
            2,
            Math.ceil(
              (containerHeight * 1.6)
              / copyHeight
            ) + 1
          );


        for (
          var copy = 0;
          copy < copies;
          copy++
        ) {

          column.forEach(
            function (item) {

              track.appendChild(
                createTile(item)
              );

            }
          );

        }


        col.appendChild(track);

        plane.appendChild(col);


        trackRefs.push(track);


        offsets.push(
          copyHeight *
          (
            (columnIndex * 0.37)
            % 1
          )
        );


        velocities.push(0);


        col.dataset.copyHeight =
          copyHeight;

      }
    );

  }


  /* =======================================================
     TRANSFORMAÇÃO 3D
     ======================================================= */

  function applyPlaneTransform(px, py) {

    plane.style.transform =
      'translate(-50%, -50%) ' +
      'scale(1.18) ' +
      'rotateX(' +
      (tilt + py) +
      'deg) ' +
      'rotateY(' +
      (turn + px) +
      'deg) ' +
      'rotateZ(' +
      roll +
      'deg) ' +
      'translateZ(' +
      (-depth) +
      'px)';

  }


  /* =======================================================
     ANIMAÇÃO
     ======================================================= */

  function animate(timestamp) {

    if (lastTimestamp === null) {
      lastTimestamp = timestamp;
    }


    var dt =
      Math.min(
        0.05,
        Math.max(
          0,
          timestamp - lastTimestamp
        ) / 1000
      );


    lastTimestamp =
      timestamp;


    if (!reduced) {

      /* -----------------------------------------------
         PARALLAX DO MOUSE
         ----------------------------------------------- */

      var maxTilt =
        parallax * 8;


      var targetX =
        pointer.x * maxTilt;


      var targetY =
        -pointer.y * maxTilt;


      var damp =
        1 -
        Math.exp(
          -dt / 0.12
        );


      pointerDamped.x +=
        (
          targetX -
          pointerDamped.x
        ) * damp;


      pointerDamped.y +=
        (
          targetY -
          pointerDamped.y
        ) * damp;


      applyPlaneTransform(
        pointerDamped.x,
        pointerDamped.y
      );


      /* -----------------------------------------------
         MOVIMENTO DAS COLUNAS
         ----------------------------------------------- */

      for (
        var c = 0;
        c < trackRefs.length;
        c++
      ) {

        var col =
          plane.children[c];


        var copyHeight =
          parseFloat(
            col.dataset.copyHeight
          );


        /*
         * Colunas alternadas sobem
         * em direções diferentes.
         */
        var direction =
          c % 2 === 0
            ? 1
            : -1;


        var target =
          speed *
          columnFactor(c) *
          direction;


        var ease =
          1 -
          Math.exp(
            -dt / 0.28
          );


        velocities[c] +=
          (
            target -
            velocities[c]
          ) * ease;


        var next =
          offsets[c] +
          velocities[c] * dt;


        next =
          (
            (next % copyHeight)
            + copyHeight
          ) % copyHeight;


        offsets[c] =
          next;


        trackRefs[c].style.transform =
          'translate3d(0, ' +
          (-next) +
          'px, 0)';

      }

    }


    animationFrame =
      requestAnimationFrame(
        animate
      );

  }


  /* =======================================================
     MOUSE / PARALLAX
     ======================================================= */

  function updatePointer(e) {

    if (
      reduced ||
      !window.matchMedia(
        '(hover:hover)'
      ).matches
    ) {
      return;
    }


    var rect =
      container.getBoundingClientRect();


    pointer.x =
      (
        (e.clientX - rect.left)
        / rect.width
      ) - 0.5;


    pointer.y =
      (
        (e.clientY - rect.top)
        / rect.height
      ) - 0.5;

  }


  function resetPointer() {

    pointer.x = 0;

    pointer.y = 0;

  }


  /* =======================================================
     EVENTOS
     ======================================================= */

  container.addEventListener(
    'pointermove',
    updatePointer
  );


  container.addEventListener(
    'pointerleave',
    resetPointer
  );


  window.addEventListener(
    'resize',
    function () {

      buildWall();

    }
  );


  /* =======================================================
     INICIALIZAÇÃO
     ======================================================= */

  buildWall();

  applyPlaneTransform(0, 0);


  if (!reduced) {

    animationFrame =
      requestAnimationFrame(
        animate
      );

  }


})();