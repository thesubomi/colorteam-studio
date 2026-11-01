/* Colorteam Studio — motion. Lenis for smooth scroll, IntersectionObserver for reveals.
   Degrades to a static page without JS or with reduced motion. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  /* header hairline on scroll */
  var h = document.querySelector('header');
  function onScroll() { if (h) h.classList.toggle('scrolled', window.scrollY > 8); }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* hero video: controls if reduced motion */
  var v = document.querySelector('.video video');
  if (v && reduce) { v.removeAttribute('autoplay'); v.pause(); v.controls = true; }

  /* split statements into words once */
  document.querySelectorAll('.statement').forEach(function (el) {
    if (el.dataset.split) return;
    el.dataset.split = '1';
    var html = '';
    el.childNodes.forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (t) {
          if (!t) return;
          html += /^\s+$/.test(t) ? ' ' : '<span class="w">' + t + '</span>';
        });
      } else if (n.nodeType === 1) {
        var cls = n.className ? ' ' + n.className : '';
        n.textContent.split(/(\s+)/).forEach(function (t) {
          if (!t) return;
          html += /^\s+$/.test(t) ? ' ' : '<span class="w' + cls + '">' + t + '</span>';
        });
      }
    });
    el.innerHTML = html;
  });

  if (reduce) {
    document.querySelectorAll('[data-reveal]').forEach(function (e) { e.classList.add('in'); });
    document.querySelectorAll('.statement .w').forEach(function (e) { e.classList.add('in'); });
    return;
  }

  /* smooth scroll */
  if (window.Lenis) {
    var lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href'); if (id.length < 2) return;
        var t = document.querySelector(id); if (!t) return;
        e.preventDefault(); lenis.scrollTo(t, { offset: -80 });
      });
    });
  }

  /* generic reveals */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });
  document.querySelectorAll('[data-reveal]').forEach(function (el, i) {
    el.style.transitionDelay = ((el.dataset.reveal | 0) * 90) + 'ms';
    io.observe(el);
  });

  /* word reveal: progress-driven while the statement crosses the viewport */
  var statements = Array.prototype.slice.call(document.querySelectorAll('.statement'));
  function tick() {
    var vh = innerHeight;
    statements.forEach(function (s) {
      var r = s.getBoundingClientRect();
      var start = vh * 0.92, end = vh * 0.38;
      var p = (start - r.top) / (start - end); p = Math.max(0, Math.min(1, p));
      var ws = s.querySelectorAll('.w'), n = ws.length, lit = Math.round(p * n);
      for (var i = 0; i < n; i++) ws[i].classList.toggle('in', i < lit);
    });
    requestAnimationFrame(tick);
  }
  if (statements.length) requestAnimationFrame(tick);

  /* progress pill, home only */
  var pill = document.querySelector('.progress');
  var secs = Array.prototype.slice.call(document.querySelectorAll('main section[data-title]'));
  if (pill && secs.length) {
    var pn = pill.querySelector('.pn'), pl = pill.querySelector('.pl'), pb = pill.querySelector('.pb i');
    var total = secs.length;
    function upd() {
      var y = window.scrollY + innerHeight * 0.4, cur = -1;
      for (var i = 0; i < total; i++) if (secs[i].offsetTop <= y) cur = i;
      var show = cur >= 0 && (window.scrollY + innerHeight) < document.body.scrollHeight - 300;
      pill.classList.toggle('show', show);
      if (cur < 0) return;
      var s = secs[cur], r = s.getBoundingClientRect();
      var within = Math.max(0, Math.min(1, (innerHeight * 0.4 - r.top) / r.height));
      pn.textContent = String(cur + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
      pl.textContent = s.dataset.title;
      pb.style.width = (within * 100) + '%';
    }
    addEventListener('scroll', upd, { passive: true }); upd();
  }
})();
