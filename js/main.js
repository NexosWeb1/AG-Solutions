/* =========================================================
   AG Solutions — Landing page
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Configuração ---------- */
  var CONFIG = {
    whatsapp: '5531991777275',
    // Mensagens pré-preenchidas conforme a seção de origem do clique
    messages: {
      header:   'Olá! Vim pelo site e gostaria de solicitar um orçamento para o meu condomínio.',
      hero:     'Olá! Vim pelo site e gostaria de solicitar um orçamento personalizado para o meu condomínio.',
      services: 'Olá! Gostaria de conversar sobre a contratação de serviços condominiais da AG Solutions.',
      compare:  'Olá! Gostaria de solicitar uma avaliação da gestão do meu condomínio.',
      final:    'Olá! Gostaria de conhecer as soluções da AG Solutions para o meu condomínio e solicitar um orçamento personalizado.',
      float:    'Olá! Gostaria de falar com a AG Solutions sobre a gestão do meu condomínio.'
    }
  };

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var desktopMQ = window.matchMedia('(min-width: 960px)');

  /* ---------- Links do WhatsApp ---------- */
  function initWhatsAppLinks() {
    $$('[data-wa]').forEach(function (link) {
      var text = CONFIG.messages[link.getAttribute('data-wa')] || CONFIG.messages.final;
      link.href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(text);
    });
  }

  /* ---------- Menu mobile ---------- */
  function initNav() {
    var nav = $('[data-nav]');
    var toggle = $('[data-nav-toggle]');
    if (!nav || !toggle) return;

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
    }
    function isOpen() { return toggle.getAttribute('aria-expanded') === 'true'; }

    toggle.addEventListener('click', function () { setOpen(!isOpen()); });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (isOpen() && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });

    desktopMQ.addEventListener('change', function (e) { if (e.matches) setOpen(false); });
  }

  /* ---------- Estado do cabeçalho ao rolar ---------- */
  function initHeaderState() {
    var header = $('[data-header]');
    if (!header) return;
    var ticking = false;

    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------- Link ativo conforme a seção visível ---------- */
  function initActiveSection() {
    if (!('IntersectionObserver' in window)) return;
    var links = $$('.nav__link');
    var map = {};
    links.forEach(function (l) { map[l.getAttribute('href').slice(1)] = l; });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove('is-active'); l.removeAttribute('aria-current'); });
        var active = map[entry.target.id];
        if (active) {
          active.classList.add('is-active');
          active.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    Object.keys(map).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* ---------- Animações de entrada ---------- */
  function initReveal() {
    var items = $$('.reveal');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    // Leve escalonamento para itens irmãos em grade (cards, perfis)
    $$('.services, .team').forEach(function (group) {
      $$('.reveal', group).forEach(function (el, i) {
        el.style.setProperty('--reveal-delay', (i % 3) * 80 + 'ms');
      });
    });

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Imagens com placeholder ----------
     Enquanto as fotos oficiais não forem inseridas em assets/img,
     o espaço reservado discreto permanece visível. */
  function initMedia() {
    $$('[data-media]').forEach(function (figure) {
      var img = $('img', figure);
      if (!img) return;

      function onLoad() { if (img.naturalWidth > 0) figure.classList.add('has-image'); }
      function onError() { img.remove(); }

      if (img.complete) {
        img.naturalWidth > 0 ? onLoad() : onError();
      } else {
        img.addEventListener('load', onLoad, { once: true });
        img.addEventListener('error', onError, { once: true });
      }
    });
  }

  /* ---------- WhatsApp flutuante ----------
     Oculto durante o hero (CTAs e navegação de etapas já visíveis) e na seção
     de contato (CTA principal já visível), para não encobrir conteúdo. */
  function initFloatingButton() {
    var btn = $('[data-wa-float]');
    var hero = document.getElementById('inicio');
    var contact = document.getElementById('contato');
    if (!btn || !('IntersectionObserver' in window)) return;

    var state = { hero: true, contact: false };
    function render() { btn.classList.toggle('is-hidden', state.hero || state.contact); }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.target === hero) state.hero = entry.isIntersecting;
        if (entry.target === contact) state.contact = entry.isIntersecting;
      });
      render();
    }, { threshold: 0 });

    if (hero) observer.observe(hero);
    if (contact) observer.observe(contact);
    render();
  }

  /* ---------- Hero ----------
     Desktop: sequência por rolagem — a seção tem altura extra, o palco
     fica fixo (sticky) e o progresso da rolagem define a etapa ativa.
     Celular/tablet: carrossel automático de uma tela (com toque/deslize),
     pois a rolagem por toque não combina com o palco fixo.
     Em ambos, a troca de etapa faz crossfade + zoom na imagem de fundo. */
  function initHero() {
    var hero = $('[data-hero]');
    var stage = $('[data-hero-stage]');
    if (!hero || !stage) return;

    var frames = $$('[data-hero-frame]', hero);
    var chapters = $$('[data-hero-chapter]', hero);
    var ring = $('[data-hero-ring]', hero);
    var label = $('[data-hero-label]', hero);
    var title = $('[data-hero-title]', hero);
    var dotsWrap = $('[data-hero-dots]', hero);
    var next = $('[data-hero-next]', hero);
    var total = chapters.length;
    var RING = 113.1;
    var AUTOPLAY_MS = 6000;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var carouselMQ = window.matchMedia('(max-width: 959px)');

    var active = -1;
    var isCarousel = carouselMQ.matches;

    // Quebra os títulos em palavras mascaradas para a revelação escalonada
    $$('[data-split]', hero).forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      el.setAttribute('aria-label', el.textContent.trim());
      el.innerHTML = words.map(function (w, i) {
        return '<span class="hero__word" aria-hidden="true"><span style="--i:' + i + '">' + w + '</span></span>';
      }).join(' ');
    });

    // Indicadores de etapa (visíveis no carrossel)
    var dots = chapters.map(function (c, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'hero__dot';
      d.setAttribute('aria-label', 'Etapa ' + (i + 1) + ': ' + c.getAttribute('data-title'));
      d.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(d);
      return d;
    });

    function setRing(progress) {
      ring.style.strokeDashoffset = String(RING * (1 - Math.min(Math.max(progress, 0), 1)));
    }

    function setActive(index) {
      if (index === active) return;
      active = index;

      frames.forEach(function (f, i) { f.classList.toggle('is-active', i === index); });
      chapters.forEach(function (c, i) {
        var on = i === index;
        c.classList.toggle('is-active', on);
        c.toggleAttribute('inert', !on);
        c.setAttribute('aria-hidden', String(!on));
      });
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === index);
        if (i === index) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
      });

      label.textContent = 'Etapa ' + String(index + 1).padStart(2, '0');
      title.classList.add('is-swapping');
      window.setTimeout(function () {
        title.textContent = chapters[index].getAttribute('data-title');
        title.classList.remove('is-swapping');
      }, reduce ? 0 : 220);

      next.setAttribute('aria-label', isCarousel || index < total - 1 ? 'Próxima etapa' : 'Ir para Serviços');
    }

    /* ===== Modo rolagem (desktop) ===== */
    var target = 0, smooth = 0, ringRaf = null, ticking = false;

    function metrics() {
      var stickyTop = parseFloat(getComputedStyle(stage).top) || 0;
      var heroTop = hero.getBoundingClientRect().top + window.scrollY;
      var distance = Math.max(hero.offsetHeight - stage.offsetHeight, 1);
      return { stickyTop: stickyTop, heroTop: heroTop, distance: distance };
    }

    // Suaviza o anel de progresso (equivalente a uma "spring")
    function animateRing() {
      if (isCarousel) { ringRaf = null; return; }
      smooth += (target - smooth) * (reduce ? 1 : 0.12);
      if (Math.abs(target - smooth) < 0.0005) smooth = target;
      setRing(smooth);
      ringRaf = smooth !== target ? window.requestAnimationFrame(animateRing) : null;
    }

    function updateScroll() {
      if (isCarousel) return;
      var m = metrics();
      target = Math.min(Math.max((m.stickyTop - hero.getBoundingClientRect().top) / m.distance, 0), 1);
      var index = Math.min(Math.floor(target * total), total - 1);
      setActive(index);
      // Progresso dentro da etapa atual (0 → 1), usado no zoom da imagem
      stage.style.setProperty('--p', Math.min(target * total - index, 1).toFixed(4));
      if (!ringRaf) ringRaf = window.requestAnimationFrame(animateRing);
    }

    function onScroll() {
      if (ticking || isCarousel) return;
      ticking = true;
      window.requestAnimationFrame(function () { updateScroll(); ticking = false; });
    }

    /* ===== Modo carrossel (celular/tablet) ===== */
    var slideStart = 0, elapsed = 0, playRaf = null;
    var inView = true, pageVisible = !document.hidden;

    function canPlay() { return isCarousel && !reduce && inView && pageVisible; }

    // O anel e o zoom acompanham o tempo da etapa; ao completar, avança
    function tick(now) {
      var p = (elapsed + now - slideStart) / AUTOPLAY_MS;
      setRing(p);
      stage.style.setProperty('--p', Math.min(p, 1).toFixed(4));
      if (p >= 1) { goTo((active + 1) % total); return; }
      playRaf = window.requestAnimationFrame(tick);
    }

    function resume() {
      if (playRaf || !canPlay()) return;
      slideStart = performance.now();
      playRaf = window.requestAnimationFrame(tick);
    }
    function pause() {
      if (!playRaf) return;
      window.cancelAnimationFrame(playRaf);
      playRaf = null;
      elapsed += performance.now() - slideStart;
    }

    function goTo(index) {
      if (!isCarousel) return;
      if (playRaf) window.cancelAnimationFrame(playRaf);
      playRaf = null;
      elapsed = 0;
      setActive(index);
      setRing(reduce ? (index + 1) / total : 0);
      stage.style.setProperty('--p', '0');
      resume();
    }

    // Deslizar para os lados troca a etapa (a rolagem vertical continua livre)
    var touchX = 0, touchY = 0;
    stage.addEventListener('touchstart', function (e) {
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
    }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (!isCarousel) return;
      var dx = e.changedTouches[0].clientX - touchX;
      var dy = e.changedTouches[0].clientY - touchY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        goTo((active + (dx < 0 ? 1 : total - 1)) % total);
      }
    }, { passive: true });

    // Pausa quando o hero sai da tela ou a aba fica em segundo plano
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) resume(); else pause();
      }, { threshold: 0.25 }).observe(stage);
    }
    document.addEventListener('visibilitychange', function () {
      pageVisible = !document.hidden;
      if (pageVisible) resume(); else pause();
    });

    /* ===== Botão do anel ===== */
    next.addEventListener('click', function () {
      if (isCarousel) { goTo((active + 1) % total); return; }
      if (active >= total - 1) {
        document.getElementById('servicos').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
        return;
      }
      var m = metrics();
      window.scrollTo({
        top: m.heroTop - m.stickyTop + ((active + 1) / total) * m.distance + 2,
        behavior: reduce ? 'auto' : 'smooth'
      });
    });

    /* ===== Alternância entre modos (ex.: girar o tablet) ===== */
    function applyMode() {
      isCarousel = carouselMQ.matches;
      hero.classList.toggle('hero--carousel', isCarousel);
      if (isCarousel) {
        goTo(active < 0 ? 0 : active);
      } else {
        pause();
        elapsed = 0;
        updateScroll();
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    carouselMQ.addEventListener('change', applyMode);
    applyMode();
  }

  /* ---------- Ano no rodapé ---------- */
  function initYear() {
    var el = $('[data-year]');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- Init ---------- */
  initWhatsAppLinks();
  initHero();
  initNav();
  initHeaderState();
  initActiveSection();
  initReveal();
  initMedia();
  initFloatingButton();
  initYear();
})();
