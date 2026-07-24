document.documentElement.classList.remove("no-js");

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasAnime = typeof anime !== "undefined";
  var hasLenis = typeof Lenis !== "undefined";
  var hasIO = "IntersectionObserver" in window;

  // ---------------------------------------------------------------
  // footer year
  // ---------------------------------------------------------------
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------------------------------------------------------------
  // mobile nav toggle
  // ---------------------------------------------------------------
  var menuBtn = document.querySelector(".titlebar__menu-btn");
  var mobileNav = document.getElementById("mobile-nav");
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileNav.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---------------------------------------------------------------
  // smooth scroll (Lenis) — scrolls the real document, so native
  // scroll events & anime's scroll observer keep working untouched
  // ---------------------------------------------------------------
  if (hasLenis && !reduceMotion) {
    new Lenis({ autoRaf: true, anchors: true, lerp: 0.11 });
  }

  // ---------------------------------------------------------------
  // scroll reveal
  // anime.js when available (scroll-linked, staggered, eased);
  // IntersectionObserver fallback otherwise; instant show if neither
  // or reduced-motion is on. Whatever path runs, content always ends
  // up visible — never stuck hidden.
  // ---------------------------------------------------------------
  function revealGroup(targets, opts) {
    opts = opts || {};
    var els = targets instanceof Element ? [targets] : Array.prototype.slice.call(targets);
    if (!els.length) return;

    if (hasAnime && !reduceMotion) {
      var onScrollParams = { enter: "bottom-=8% top", repeat: false };
      if (opts.trigger) onScrollParams.target = opts.trigger;

      anime.animate(els, {
        opacity: [0, 1],
        translateY: [26, 0],
        duration: 850,
        ease: "outExpo",
        delay: opts.stagger ? anime.stagger(opts.stagger) : 0,
        autoplay: anime.onScroll(onScrollParams),
        onComplete: function () {
          els.forEach(function (el) {
            el.style.opacity = "";
            el.style.transform = "";
            el.classList.add("is-visible");
          });
        },
      });
    } else if (reduceMotion || !hasIO) {
      els.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
      );
      els.forEach(function (el) {
        io.observe(el);
      });
    }
  }

  // standalone reveals
  document.querySelectorAll(".cmd.reveal, .subhead.reveal, .json-block.reveal, .credentials.reveal, .contact__lede.reveal, .contact__links.reveal").forEach(function (el) {
    revealGroup(el);
  });

  // project cards: stagger per grid, triggered off the grid itself
  document.querySelectorAll(".grid").forEach(function (grid) {
    var cards = grid.querySelectorAll(".card.reveal");
    revealGroup(cards, { stagger: 90, trigger: grid });
  });

  // timeline items: each triggers independently as it scrolls into view
  document.querySelectorAll(".timeline__item.reveal").forEach(function (item) {
    revealGroup(item);
  });

  // ---------------------------------------------------------------
  // hero entrance
  // ---------------------------------------------------------------
  var heroChildren = document.querySelectorAll(".hero .term > *");
  if (hasAnime && !reduceMotion && heroChildren.length) {
    anime.animate(heroChildren, {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 700,
      ease: "outExpo",
      delay: anime.stagger(70),
    });
  } else {
    heroChildren.forEach(function (el) {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }

  // hero name typewriter
  var typedEl = document.querySelector("[data-typed]");
  if (typedEl) {
    var fullText = typedEl.textContent;
    if (reduceMotion) {
      typedEl.textContent = fullText;
    } else {
      typedEl.textContent = "";
      var i = 0;
      var tick = function () {
        typedEl.textContent = fullText.slice(0, i);
        i++;
        if (i <= fullText.length) {
          setTimeout(tick, 55);
        }
      };
      tick();
    }
  }

  // ---------------------------------------------------------------
  // card tilt-toward-cursor
  // ---------------------------------------------------------------
  if (hasAnime && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
    var spring = anime.spring({ stiffness: 260, damping: 22, mass: 1 });

    document.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        anime.animate(card, {
          rotateX: py * -6,
          rotateY: px * 6,
          translateY: -3,
          duration: 400,
          ease: "outQuad",
        });
      });
      card.style.transformPerspective = "700px";
      card.addEventListener("mouseleave", function () {
        anime.animate(card, {
          rotateX: 0,
          rotateY: 0,
          translateY: 0,
          duration: 900,
          ease: spring,
        });
      });
    });

    // magnetic buttons
    document.querySelectorAll(".btn").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var mx = e.clientX - (rect.left + rect.width / 2);
        var my = e.clientY - (rect.top + rect.height / 2);
        anime.animate(btn, {
          translateX: mx * 0.25,
          translateY: my * 0.35,
          duration: 300,
          ease: "outQuad",
        });
      });
      btn.addEventListener("mouseleave", function () {
        anime.animate(btn, {
          translateX: 0,
          translateY: 0,
          duration: 700,
          ease: spring,
        });
      });
    });
  }

  // ---------------------------------------------------------------
  // hero background — an animated knowledge graph. Nodes drift and
  // pulse, edges connect nearby nodes. It's decorative, but the
  // subject is literally knowledge graphs, so the background is the
  // thing he does for a living, not a stock particle effect.
  // ---------------------------------------------------------------
  (function initGraph() {
    var canvas = document.getElementById("graph-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0,
      h = 0,
      nodes = [],
      raf = null;
    var NODE_COUNT = window.innerWidth < 640 ? 10 : 16;
    var LINK_DIST = 170;

    function hexToRgb(hex) {
      hex = hex.replace("#", "");
      if (hex.length === 3) {
        hex = hex
          .split("")
          .map(function (c) {
            return c + c;
          })
          .join("");
      }
      var num = parseInt(hex, 16);
      return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    }

    var accentVar = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    var rgb = hexToRgb(accentVar || "#57c7b8");

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeNodes() {
      nodes = [];
      for (var n = 0; n < NODE_COUNT; n++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: 1.6 + Math.random() * 1.8,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    resize();
    makeNodes();

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        makeNodes();
      }, 200);
    });

    var t = 0;
    function frame() {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);

      nodes.forEach(function (n) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      });

      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var a = nodes[i],
            b = nodes[j];
          var dx = a.x - b.x,
            dy = a.y - b.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            var alpha = (1 - dist / LINK_DIST) * 0.35;
            ctx.strokeStyle = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + alpha + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach(function (n) {
        var pulse = 0.5 + 0.5 * Math.sin(t * 0.8 + n.phase);
        ctx.beginPath();
        ctx.fillStyle = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + (0.35 + pulse * 0.45) + ")";
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      });

      if (!reduceMotion) raf = requestAnimationFrame(frame);
    }

    frame();

    if (!reduceMotion) {
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
          cancelAnimationFrame(raf);
        } else {
          raf = requestAnimationFrame(frame);
        }
      });
    }
  })();
})();
