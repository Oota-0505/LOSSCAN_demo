(function () {
  'use strict';

  // ========================================
  // KV – スライドごとのポイントテキスト（1行ずつ）
  // ========================================
  var kvTexts = [
    '来店遅延の兆候を自動で検知',
    'フォロー優先度をRED／YELLOWで可視化',
    '現場は"見るだけ"で行動できる'
  ];

  function animateKvPoint(index) {
    var item = document.getElementById('kvPoint');
    if (!item) return;
    var text = kvTexts[index % kvTexts.length];

    // exit: 上へ素早くスライドアウト
    item.style.transition = 'opacity .16s ease, transform .22s cubic-bezier(0.4, 0, 1, 1)';
    item.style.opacity    = '0';
    item.style.transform  = 'translateY(-48px)';

    setTimeout(function () {
      item.textContent = text;

      // 画面下側から準備（overflow: hidden で見えない）
      item.style.transition = 'none';
      item.style.opacity    = '0';
      item.style.transform  = 'translateY(72px)';

      void item.offsetHeight; // reflow

      // 下から上へ勢いよくスライドイン
      item.style.transition = 'opacity .6s ease, transform .72s cubic-bezier(0.16, 1, 0.3, 1)';
      item.style.opacity    = '1';
      item.style.transform  = 'translateY(0)';
    }, 240);
  }

  // ========================================
  // Swiper – KV hero slider
  // ========================================
  var kvSwiper = null;
  if (typeof Swiper !== 'undefined' && document.querySelector('.kv__slider')) {
    kvSwiper = new Swiper('.kv__slider', {
      loop: true,
      effect: 'fade',
      fadeEffect: { crossFade: true },
      speed: 1000,
      autoplay: { delay: 5000, disableOnInteraction: false },
      allowTouchMove: false,
      pagination: {
        el: '.kv__pagination',
        clickable: true,
        bulletClass: 'kv__dot',
        bulletActiveClass: 'is-active',
        renderBullet: function (_, className) {
          return '<span class="' + className + '"></span>';
        }
      },
      on: {
        slideChange: function () {
          animateKvPoint(this.realIndex);
        },
        slideChangeTransitionStart: function () {
          var ghost = document.getElementById('kvSlideGhost');
          if (!ghost) return;
          var prevIndex = this.previousIndex;
          var slides = this.slides;
          var leavingSlide = slides[prevIndex];
          if (!leavingSlide) return;
          var bg = window.getComputedStyle(leavingSlide).backgroundImage;
          ghost.style.backgroundImage = bg;
          ghost.classList.remove('is-leaving');
          ghost.classList.add('is-visible');
          ghost.style.transform = '';
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              ghost.classList.add('is-leaving');
              ghost.classList.remove('is-visible');
              setTimeout(function () {
                ghost.classList.remove('is-leaving');
                ghost.style.backgroundImage = '';
              }, 1000);
            });
          });
        }
      }
    });
  }

  // ========================================
  // KV – パララックス（スクロールで背景が遅れて動き奥行きを出す）
  // ========================================
  (function () {
    var kv = document.querySelector('.kv');
    var slider = document.getElementById('kvSlider');
    if (!kv || !slider) return;
    var ticking = false;
    var parallaxFactor = 0.42;

    function update() {
      var rect = kv.getBoundingClientRect();
      var scrollY = window.scrollY || window.pageYOffset;
      if (rect.bottom < 0) {
        slider.style.transform = '';
        ticking = false;
        return;
      }
      var y = scrollY * parallaxFactor;
      slider.style.transform = 'translate3d(0, ' + y + 'px, 0)';
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  // ========================================
  // Voice section – 背景パララックス（オフセットをクランプして上下余白を防止）
  // ========================================
  (function () {
    var section = document.querySelector('.voice-section');
    var bg = section ? section.querySelector('.voice-section__bg') : null;
    if (!section || !bg) return;
    var ticking = false;
    var parallaxRate = 0.4;
    var maxOffsetRatio = 0.25;

    function update() {
      var rect = section.getBoundingClientRect();
      var scrollY = window.scrollY || window.pageYOffset;
      var sectionTop = scrollY + rect.top;
      var sectionH = section.offsetHeight;
      var rawOffset = (scrollY - sectionTop) * (parallaxRate - 1);
      var maxPx = sectionH * maxOffsetRatio;
      var offset = Math.max(-maxPx, Math.min(maxPx, rawOffset));
      bg.style.transform = 'translate3d(0, ' + offset + 'px, 0)';
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  // 初期表示: transform をリセットして確実に表示
  (function () {
    var item = document.getElementById('kvPoint');
    if (!item) return;
    item.style.transition = 'none';
    item.style.opacity    = '1';
    item.style.transform  = 'translateY(0)';
  })();

  // ========================================
  // KV Custom Cursor – マウス追従 & クリックで次スライド
  // ========================================
  (function () {
    var kvSection = document.querySelector('.kv');
    var kvCursor  = document.getElementById('kvCursor');
    if (!kvSection || !kvCursor) return;

    // タッチデバイスや hover 非対応環境では何もしない
    var supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!supportsHover) return;

    var mouseX = 0, mouseY = 0;
    var curX   = 0, curY   = 0;
    var rafId  = null;
    var isInside = false;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function tick() {
      if (!isInside) return;
      curX = lerp(curX, mouseX, 0.22);
      curY = lerp(curY, mouseY, 0.22);
      kvCursor.style.left = curX + 'px';
      kvCursor.style.top  = curY + 'px';
      rafId = requestAnimationFrame(tick);
    }

    kvSection.addEventListener('mouseenter', function (e) {
      isInside = true;
      mouseX = e.clientX;
      mouseY = e.clientY;
      curX   = e.clientX;
      curY   = e.clientY;
      kvCursor.style.left = curX + 'px';
      kvCursor.style.top  = curY + 'px';
      kvCursor.classList.add('is-visible');
      cancelAnimationFrame(rafId);
      tick();
    });

    kvSection.addEventListener('mouseleave', function () {
      isInside = false;
      kvCursor.classList.remove('is-visible');
      cancelAnimationFrame(rafId);
    });

    kvSection.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // リンク・ボタン上ではポインター状態に切り替え
      var overInteractive = !!e.target.closest('a, button');
      kvCursor.classList.toggle('is-pointer', overInteractive);
    });

    kvSection.addEventListener('click', function (e) {
      // リンクやボタン上のクリックはスライドを進めない
      if (e.target.closest('a, button')) return;
      if (!kvSwiper) return;
      kvSwiper.slideNext();

      kvCursor.classList.add('is-clicking');
      setTimeout(function () {
        kvCursor.classList.remove('is-clicking');
      }, 280);
    });
  })();

  // ========================================
  // Site-wide Laser Pointer Cursor（KV外）
  // ========================================
  (function () {
    var supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!supportsHover) return;

    var cursor    = document.getElementById('siteCursor');
    var kvSection = document.querySelector('.kv');
    if (!cursor) return;

    var mouseX = 0, mouseY = 0;
    var curX   = 0, curY   = 0;
    var rafId  = null;
    var isOut  = true; // ページ外にいる間は非表示

    function lerp(a, b, t) { return a + (b - a) * t; }

    function tick() {
      curX = lerp(curX, mouseX, 0.38);
      curY = lerp(curY, mouseY, 0.38);
      cursor.style.left = curX + 'px';
      cursor.style.top  = curY + 'px';
      rafId = requestAnimationFrame(tick);
    }

    function isInsideKv(x, y) {
      if (!kvSection) return false;
      var r = kvSection.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    }

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      var inKv = isInsideKv(e.clientX, e.clientY);
      cursor.classList.toggle('is-hidden',  inKv);
      cursor.classList.toggle('is-visible', !inKv);

      // インタラクティブ要素の上かどうか
      var interactive = !!e.target.closest('a, button, [role="button"], input, textarea, select, label');
      cursor.classList.toggle('is-hover', interactive && !inKv);
    });

    document.addEventListener('mousedown', function () {
      cursor.classList.add('is-clicking');
    });
    document.addEventListener('mouseup', function () {
      cursor.classList.remove('is-clicking');
    });

    document.addEventListener('mouseleave', function () {
      cursor.classList.remove('is-visible');
      cursor.classList.add('is-hidden');
    });
    document.addEventListener('mouseenter', function () {
      cursor.classList.remove('is-hidden');
    });

    // 即時座標セット後にアニメーションループ開始
    document.addEventListener('mousemove', function init(e) {
      curX = e.clientX;
      curY = e.clientY;
      cursor.style.left = curX + 'px';
      cursor.style.top  = curY + 'px';
      document.removeEventListener('mousemove', init);
      tick();
    }, { once: true });
  })();

  // ========================================
  // Header – scroll effect
  // ========================================
  var header = document.getElementById('siteHeader');
  var kv     = document.querySelector('.kv');

  function updateHeader() {
    if (!header) return;
    if (!kv) {
      header.classList.add('is-scrolled');
      return;
    }
    var threshold = kv.offsetHeight - 100;
    if ((window.scrollY || window.pageYOffset) > threshold) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  // ========================================
  // Smooth scroll – anchor links
  // ========================================
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === '#') return;
    link.addEventListener('click', function (e) {
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var headerH = header ? header.offsetHeight : 72;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.pageYOffset - headerH,
        behavior: 'smooth'
      });
      document.body.classList.remove('menu-open');
      var toggle = document.querySelector('.menu-toggle');
      var mNav   = document.querySelector('.mobile-nav');
      if (toggle) toggle.classList.remove('is-active');
      if (mNav)   mNav.classList.remove('is-open');
    });
  });

  // ========================================
  // Mobile menu – toggle
  // ========================================
  var menuBtn = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function () {
      var open = !mobileNav.classList.contains('is-open');
      document.body.classList.toggle('menu-open', open);
      menuBtn.classList.toggle('is-active', open);
      mobileNav.classList.toggle('is-open', open);
    });
  }

  // ========================================
  // Reason – ピン止め横スライド（縦スクロール→横移動）
  // ========================================
  (function () {
    var wraps = document.querySelectorAll('.reason-pin-wrap');
    if (!wraps.length) return;
    var ticking = false;

    function clamp(n, min, max) {
      return Math.max(min, Math.min(max, n));
    }

    function update() {
      var headerH = header ? header.offsetHeight : 0;
      var activeVh = Math.max(1, window.innerHeight - headerH);
      var scrollY = window.scrollY || window.pageYOffset;

      wraps.forEach(function (wrap) {
        var track = wrap.querySelector('.reason-track');
        if (!track) return;
        var slides = Number(wrap.dataset.slides || 3);

        var rect = wrap.getBoundingClientRect();
        var wrapTop = scrollY + rect.top;
        var stickyStart = wrapTop - headerH;
        var total = Math.max(1, wrap.offsetHeight - activeVh);
        // ヘッダー下端を基準に進捗を計算
        // stickyStart より手前なら 0、通り過ぎたら加算
        var currentScroll = scrollY - stickyStart;
        var start = clamp(currentScroll, 0, total);
        var progress = clamp(start / total, 0, 1);

        // 先頭を少しホールドして、必ず 01 を最初に認識できるようにする
        var leadHold = 0.05; // ホールド期間を短縮してスムーズに
        var moveProgress = progress <= leadHold
          ? 0
          : (progress - leadHold) / (1 - leadHold);

        var x = moveProgress * -(slides - 1) * 100;
        track.style.transform = 'translate3d(' + x + 'vw, 0, 0)';

        // 最終スライド（比較スライド）に達したら is-slide-4 を付与
        var pinned = wrap.querySelector('.reason-pinned');
        if (pinned) {
          var segSize = 1 / (slides - 1);
          var currentSlide = Math.round(moveProgress / segSize);
          if (currentSlide >= slides - 1) {
            pinned.classList.add('is-slide-4');
          } else {
            pinned.classList.remove('is-slide-4');
          }
        }
      });

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('load', update);
    update();
  })();

  // ========================================
  // Problem – スクロール連動カード収縮アニメーション
  // ========================================
  (function () {
    var problemWrap = document.querySelector('.problem-pin-wrap');
    if (!problemWrap) return;

    var ticking = false;

    function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

    // ease-out cubic: 終盤をゆっくりにしてカードがそっと着地する感覚に
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    // 各カードの初期オフセット（arena座標系、px）
    var offsets = [
      { x: -280, y: -200 }, // TL
      { x:  280, y: -200 }, // TR
      { x: -280, y:  200 }, // BL
      { x:  280, y:  200 }  // BR
    ];

    function resetCards() {
      var cards  = problemWrap.querySelectorAll('.problem-card');
      var center = problemWrap.querySelector('.problem-center');
      cards.forEach(function (c) { c.style.cssText = ''; });
      if (center) center.style.cssText = '';
    }

    function update() {
      // モバイル（≤768px）はアニメーション無効
      if (window.innerWidth <= 768) {
        resetCards();
        ticking = false;
        return;
      }

      var headerH  = (header && header.offsetHeight) || 72;
      var scrollY  = window.scrollY || window.pageYOffset;
      var activeVh = Math.max(1, window.innerHeight - headerH);

      var rect       = problemWrap.getBoundingClientRect();
      var wrapTop    = scrollY + rect.top;
      var stickyStart = wrapTop - headerH;
      var total      = Math.max(1, problemWrap.offsetHeight - activeVh);
      var rawProgress = clamp((scrollY - stickyStart) / total, 0, 1);
      var progress   = easeOutCubic(rawProgress);

      // カード アニメーション
      var cards = problemWrap.querySelectorAll('.problem-card');
      cards.forEach(function (card, i) {
        var off = offsets[i];
        var tx  = off.x * (1 - progress);
        var ty  = off.y * (1 - progress);
        var op  = clamp(0.05 + 0.95 * progress, 0, 1);
        card.style.transform = 'translate(' + tx + 'px, ' + ty + 'px)';
        card.style.opacity   = op;
      });

      // 中央写真: わずかにスケールアップ & フェードイン
      var center = problemWrap.querySelector('.problem-center');
      if (center) {
        var scale = 0.9 + 0.1 * progress;
        var op    = clamp(0.35 + 0.65 * progress, 0, 1);
        center.style.transform = 'scale(' + scale + ')';
        center.style.opacity   = op;
      }

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('load',   update);
    update();
  })();

  // ========================================
  // IntersectionObserver – section fade-in
  // ========================================
  var io = typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -48px 0px', threshold: 0.05 })
    : null;

  if (io) {
    document.querySelectorAll('.observe-fade').forEach(function (el) {
      io.observe(el);
    });
  } else {
    // Fallback: show all immediately
    document.querySelectorAll('.observe-fade').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  // ========================================
  // Staggered card animations inside sections
  // ========================================
  var cardObserver = typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var cards = entry.target.querySelectorAll(
            '.plan-card, .service-item, .problem-item'
          );
          cards.forEach(function (card, i) {
            setTimeout(function () {
              card.style.opacity    = '1';
              card.style.transform  = 'translateY(0)';
            }, i * 80);
          });
          cardObserver.unobserve(entry.target);
        });
      }, { threshold: 0.1 })
    : null;

  if (cardObserver) {
    var initCard = function (el) {
      el.style.opacity   = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity .5s ease, transform .5s ease';
    };
    document.querySelectorAll(
      '.voice-grid, .service-grid, .problem-check-list'
    ).forEach(function (parent) {
      parent.querySelectorAll(
        '.service-item, .problem-item'
      ).forEach(initCard);
      cardObserver.observe(parent);
    });
  }

  // ========================================
  // FAQ Accordion
  // ========================================
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn  = item.querySelector('.faq-q');
    var body = item.querySelector('.faq-body');
    if (!btn || !body) return;

    // Wrap the inner content for grid-template-rows trick
    var inner = document.createElement('div');
    inner.className = 'faq-body-inner';
    while (body.firstChild) { inner.appendChild(body.firstChild); }
    body.appendChild(inner);

    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');

      // Close all others
      document.querySelectorAll('.faq-item.is-open').forEach(function (other) {
        if (other !== item) {
          other.classList.remove('is-open');
          other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
          var ob = other.querySelector('.faq-body');
          ob.style.gridTemplateRows = '0fr';
          // Re-hide after transition
          ob.addEventListener('transitionend', function hide() {
            ob.setAttribute('hidden', '');
            ob.removeEventListener('transitionend', hide);
          });
        }
      });

      if (isOpen) {
        // Closing
        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        body.style.gridTemplateRows = '0fr';
        body.addEventListener('transitionend', function hide() {
          body.setAttribute('hidden', '');
          body.removeEventListener('transitionend', hide);
        });
      } else {
        // Opening
        body.removeAttribute('hidden');
        body.style.gridTemplateRows = '0fr';
        // Force reflow so transition fires
        body.offsetHeight; // eslint-disable-line no-unused-expressions
        body.style.gridTemplateRows = '1fr';
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ========================================
  // Contact form – validation
  // ========================================
  var form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = form.querySelectorAll('[required]');
      var valid = true;
      fields.forEach(function (field) {
        if (!field.value.trim()) {
          valid = false;
          field.classList.add('is-error');
        } else {
          field.classList.remove('is-error');
        }
      });
      if (valid) {
        alert('お問い合わせ内容を送信しました。\n担当者よりご連絡いたします。');
        form.reset();
      } else {
        alert('必須項目を入力してください。');
      }
    });
    form.querySelectorAll('.form-input, .form-textarea').forEach(function (input) {
      input.addEventListener('input', function () {
        input.classList.remove('is-error');
      });
    });
  }

})();
