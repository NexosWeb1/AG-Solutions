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
      header: 'Olá! Vim pelo site e gostaria de solicitar um orçamento para a minha empresa ou condomínio.',
      hero: 'Olá! Vim pelo site e gostaria de solicitar um orçamento personalizado para a minha empresa ou condomínio.',
      services: 'Olá! Gostaria de conversar sobre a contratação de serviços da AG Solutions para a minha empresa ou condomínio.',
      compare: 'Olá! Gostaria de solicitar uma avaliação da gestão da minha empresa ou condomínio.',
      final: 'Olá! Gostaria de conhecer as soluções da AG Solutions para a minha empresa ou condomínio e solicitar um orçamento personalizado.',
      float: 'Olá! Gostaria de falar com a AG Solutions sobre a gestão da minha empresa ou condomínio.'
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
    var heroLogo = $('[data-hero-logo]');
    var ticking = false;
    var atHero = null;
    var switchTimer = null;

    // Enquanto a logo do hero estiver visível abaixo do cabeçalho, a logo do
    // cabeçalho fica oculta e o menu centralizado; ao rolar, volta ao normal.
    function setAtHero(next) {
      if (next === atHero) return;
      var first = atHero === null;
      atHero = next;
      if (first) { header.classList.toggle('at-hero', next); return; }
      window.clearTimeout(switchTimer);
      header.classList.add('is-switching');
      switchTimer = window.setTimeout(function () {
        header.classList.toggle('at-hero', atHero);
        header.classList.remove('is-switching');
      }, 180);
    }

    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      if (heroLogo) setAtHero(heroLogo.getBoundingClientRect().bottom > header.offsetHeight);
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
     Oculto enquanto o hero ocupa a maior parte da tela (os CTAs dele já
     estão visíveis); a partir daí, permanece sempre visível. */
  function initFloatingButton() {
    var btn = $('[data-wa-float]');
    var hero = document.getElementById('inicio');
    if (!btn) return;
    if (!hero) { btn.classList.remove('is-hidden'); return; }

    var ticking = false;
    function render() {
      // Aparece quando o fim do hero sobe acima da metade da tela
      var inHero = hero.getBoundingClientRect().bottom > window.innerHeight * 0.5;
      btn.classList.toggle('is-hidden', inHero);
      ticking = false;
    }
    function onScroll() {
      if (!ticking) { ticking = true; window.requestAnimationFrame(render); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    render();
  }

  /* ---------- Hero ----------
     Quebra o título em palavras mascaradas e dispara a animação de entrada. */
  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) return;

    $$('[data-split]', hero).forEach(function (el) {
      var text = el.textContent.trim().replace(/\s+/g, ' ');
      el.setAttribute('aria-label', text);
      el.innerHTML = text.split(' ').map(function (w, i) {
        return '<span class="hero__word" aria-hidden="true"><span style="--i:' + i + '">' + w + '</span></span>';
      }).join(' ');
    });

    window.setTimeout(function () { hero.classList.add('is-ready'); }, 60);
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
