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
  var lenisInstance = null;
  if (hasLenis && !reduceMotion) {
    lenisInstance = new Lenis({ autoRaf: true, anchors: true, lerp: 0.11 });
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
  document.querySelectorAll(".cmd-block.reveal, .subhead.reveal, .json-block.reveal, .credentials.reveal, .contact__lede.reveal, .contact__links.reveal").forEach(function (el) {
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
  // hero sequence — type the prompt like you just asked Claude Code
  // about him, show a "thinking" beat, then stream the tool-call
  // response in. Escape skips the thinking beat, same as the CLI.
  // ---------------------------------------------------------------
  var responseChildren = document.querySelectorAll(".hero .response > *");

  function revealHeroResponse() {
    if (hasAnime && !reduceMotion && responseChildren.length) {
      anime.animate(responseChildren, {
        opacity: [0, 1],
        translateY: [16, 0],
        duration: 700,
        ease: "outExpo",
        delay: anime.stagger(70),
      });
    } else {
      responseChildren.forEach(function (el) {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    }
  }

  function startThinking(onDone) {
    var thinkingEl = document.getElementById("thinking");
    if (!thinkingEl) {
      onDone();
      return;
    }
    var spinnerEl = thinkingEl.querySelector("[data-spinner]");
    var verbEl = thinkingEl.querySelector("[data-thinking-verb]");
    var elapsedEl = thinkingEl.querySelector("[data-elapsed]");

    thinkingEl.classList.add("is-active");

    var frames = ["✻", "✼", "✶", "✷", "✳"];
    var verbs = ["Noodling…", "Percolating…", "Synthesizing…", "Reticulating…", "Pondering…"];
    if (verbEl) verbEl.textContent = verbs[Math.floor(Math.random() * verbs.length)];

    var frame = 0;
    var spinTimer = setInterval(function () {
      frame = (frame + 1) % frames.length;
      if (spinnerEl) spinnerEl.textContent = frames[frame];
    }, 90);

    var elapsed = 0;
    var elapsedTimer = setInterval(function () {
      elapsed++;
      if (elapsedEl) elapsedEl.textContent = elapsed;
    }, 1000);

    var done = false;
    function finish() {
      if (done) return;
      done = true;
      clearInterval(spinTimer);
      clearInterval(elapsedTimer);
      thinkingEl.classList.remove("is-active");
      document.removeEventListener("keydown", onEscape);
      onDone();
    }
    function onEscape(e) {
      if (e.key === "Escape") finish();
    }
    document.addEventListener("keydown", onEscape);

    setTimeout(finish, 1200);
  }

  var promptEl = document.querySelector("[data-typed-prompt]");
  var promptCursor = document.querySelector("[data-prompt-cursor]");

  if (promptEl) {
    var promptText = promptEl.textContent;
    if (reduceMotion) {
      promptEl.textContent = promptText;
      if (promptCursor) promptCursor.style.display = "none";
      revealHeroResponse();
    } else {
      promptEl.textContent = "";
      var pi = 0;
      (function typePrompt() {
        promptEl.textContent = promptText.slice(0, pi);
        pi++;
        if (pi <= promptText.length) {
          setTimeout(typePrompt, 45);
        } else {
          if (promptCursor) promptCursor.style.display = "none";
          startThinking(revealHeroResponse);
        }
      })();
    }
  } else {
    revealHeroResponse();
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

  // ---------------------------------------------------------------
  // command bar — a real router, not decoration. Type "projects" or
  // "resume" and hit enter; it navigates or downloads, same way you'd
  // drive Claude Code from its prompt.
  // ---------------------------------------------------------------
  (function initCmdbar() {
    var form = document.getElementById("cmdbar-form");
    var input = document.getElementById("cmdbar-input");
    var responseEl = document.getElementById("cmdbar-response");
    if (!form || !input) return;

    function goTo(hash, label) {
      var target = document.querySelector(hash);
      if (target) {
        if (lenisInstance) {
          lenisInstance.scrollTo(target);
        } else {
          target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        }
      }
      return "⏺ Navigating to " + label;
    }

    var routes = [
      {
        pattern: /resume|cv|download/i,
        action: function () {
          var a = document.createElement("a");
          a.href = "/assets/Utpal_Das_Resume.pdf";
          a.download = "";
          document.body.appendChild(a);
          a.click();
          a.remove();
          return "⏺ Downloading résumé…";
        },
      },
      { pattern: /project|work|build|ship|portfolio/i, action: function () { return goTo("#projects", "projects"); } },
      { pattern: /experience|job|career|history|deloitte|pfizer|allianz/i, action: function () { return goTo("#experience", "experience"); } },
      { pattern: /skill|stack|tech|language/i, action: function () { return goTo("#skills", "skills"); } },
      { pattern: /whoami|who are you|about/i, action: function () { return goTo("#whoami", "whoami"); } },
      { pattern: /contact|email|hire|reach|talk|linkedin/i, action: function () { return goTo("#contact", "contact"); } },
      { pattern: /hi|hello|hey/i, action: function () { return goTo("#contact", "contact — say hello"); } },
    ];

    var responseTimer;
    function showResponse(text) {
      if (!responseEl) return;
      responseEl.textContent = text;
      responseEl.classList.add("is-visible");
      clearTimeout(responseTimer);
      responseTimer = setTimeout(function () {
        responseEl.classList.remove("is-visible");
      }, 2600);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var value = input.value.trim();
      if (!value) return;
      var matched = routes.find(function (r) {
        return r.pattern.test(value);
      });
      var reply = matched ? matched.action() : "Try asking about his projects, experience, skills, or how to reach him.";
      showResponse(reply);
      input.value = "";
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "/") return;
      var tag = document.activeElement && document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      input.focus();
    });
  })();
})();
