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
  // theme toggle (persisted, no flash — <head> inline script sets the
  // initial attribute before paint)
  // ---------------------------------------------------------------
  var themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme") || "dark";
      var next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", next === "dark" ? "#0B0D12" : "#FAF9F7");
    });
  }

  // ---------------------------------------------------------------
  // mobile sidebar drawer
  // ---------------------------------------------------------------
  var sidebar = document.getElementById("sidebar");
  var topbarMenu = document.getElementById("topbar-menu");
  var bottomNavMore = document.getElementById("bottom-nav-more");
  var sidebarBackdrop = document.getElementById("sidebar-backdrop");

  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add("is-open");
    if (sidebarBackdrop) sidebarBackdrop.classList.add("is-visible");
    if (topbarMenu) topbarMenu.setAttribute("aria-expanded", "true");
  }
  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove("is-open");
    if (sidebarBackdrop) sidebarBackdrop.classList.remove("is-visible");
    if (topbarMenu) topbarMenu.setAttribute("aria-expanded", "false");
  }
  function toggleSidebar() {
    if (sidebar && sidebar.classList.contains("is-open")) closeSidebar();
    else openSidebar();
  }

  if (topbarMenu) topbarMenu.addEventListener("click", toggleSidebar);
  if (bottomNavMore) bottomNavMore.addEventListener("click", toggleSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener("click", closeSidebar);
  if (sidebar) {
    sidebar.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeSidebar);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sidebar && sidebar.classList.contains("is-open")) closeSidebar();
  });

  // ---------------------------------------------------------------
  // active-section highlighting (sidebar + bottom nav share data-nav)
  // ---------------------------------------------------------------
  var navLinks = document.querySelectorAll("[data-nav]");
  var sections = document.querySelectorAll(".ws-section[id]");
  if (hasIO && sections.length) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          navLinks.forEach(function (link) {
            link.classList.toggle("is-active", link.getAttribute("data-nav") === id);
          });
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach(function (s) {
      navObserver.observe(s);
    });
  }

  // ---------------------------------------------------------------
  // smooth scroll (Lenis)
  // ---------------------------------------------------------------
  var lenisInstance = null;
  if (hasLenis && !reduceMotion) {
    lenisInstance = new Lenis({ autoRaf: true, anchors: true, lerp: 0.11 });
  }

  function goTo(hash) {
    var target = document.querySelector(hash);
    if (!target) return;
    if (lenisInstance) lenisInstance.scrollTo(target);
    else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  // ---------------------------------------------------------------
  // scroll reveal
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
        translateY: [24, 0],
        duration: 800,
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

  document.querySelectorAll(".card.reveal, .skill-group.reveal, .credentials.reveal, .status-grid.reveal, .term--contact.reveal").forEach(function (el) {
    revealGroup(el);
  });

  document.querySelectorAll(".gitlog__item.reveal").forEach(function (item) {
    revealGroup(item);
  });

  document.querySelectorAll(".repo-grid").forEach(function (grid) {
    var cards = grid.querySelectorAll(".repo-card.reveal");
    revealGroup(cards, { stagger: 80, trigger: grid });
  });

  // ---------------------------------------------------------------
  // hero entrance
  // ---------------------------------------------------------------
  ["term__block", "term__chips", "hero__actions"].forEach(function (cls, i) {
    var el = document.querySelector(".hero ." + cls);
    if (!el) return;
    if (hasAnime && !reduceMotion) {
      anime.animate(el, {
        opacity: [0, 1],
        translateY: [16, 0],
        duration: 700,
        ease: "outExpo",
        delay: 220 + i * 260,
      });
    } else {
      el.style.opacity = "1";
      el.style.transform = "none";
    }
  });

  // ---------------------------------------------------------------
  // repo card tilt + magnetic buttons
  // ---------------------------------------------------------------
  if (hasAnime && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
    var spring = anime.spring({ stiffness: 260, damping: 22, mass: 1 });

    document.querySelectorAll(".repo-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        anime.animate(card, {
          rotateX: py * -5,
          rotateY: px * 5,
          translateY: -3,
          duration: 400,
          ease: "outQuad",
        });
      });
      card.style.transformPerspective = "700px";
      card.addEventListener("mouseleave", function () {
        anime.animate(card, { rotateX: 0, rotateY: 0, translateY: 0, duration: 900, ease: spring });
      });
    });

    document.querySelectorAll(".btn").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var mx = e.clientX - (rect.left + rect.width / 2);
        var my = e.clientY - (rect.top + rect.height / 2);
        anime.animate(btn, { translateX: mx * 0.2, translateY: my * 0.3, duration: 300, ease: "outQuad" });
      });
      btn.addEventListener("mouseleave", function () {
        anime.animate(btn, { translateX: 0, translateY: 0, duration: 700, ease: spring });
      });
    });
  }

  // ---------------------------------------------------------------
  // command palette (Ctrl+K / Cmd+K / "/")
  // ---------------------------------------------------------------
  (function initCmdk() {
    var cmdk = document.getElementById("cmdk");
    var input = document.getElementById("cmdk-input");
    var list = document.getElementById("cmdk-list");
    if (!cmdk || !input || !list) return;

    var items = [
      { label: "Home", hint: "whoami", icon: "house", action: function () { goTo("#hero"); } },
      { label: "About", hint: "about.md", icon: "user", action: function () { goTo("#about"); } },
      { label: "Experience", hint: "experience.log", icon: "briefcase", action: function () { goTo("#experience"); } },
      { label: "Skills", hint: "skills.json", icon: "terminal", action: function () { goTo("#skills"); } },
      { label: "Projects", hint: "projects/", icon: "folder-git-2", action: function () { goTo("#projects"); } },
      { label: "AI Workspace", hint: "ai-workspace/", icon: "bot", action: function () { goTo("#ai-workspace"); } },
      { label: "Blogs", hint: "blogs/", icon: "book-open", action: function () { goTo("#blogs"); } },
      { label: "Contact", hint: "contact.sh", icon: "mail", action: function () { goTo("#contact"); } },
      {
        label: "Toggle theme",
        hint: "dark / light",
        icon: "sun",
        action: function () {
          if (themeToggle) themeToggle.click();
        },
      },
      {
        label: "Download résumé",
        hint: "PDF",
        icon: "download",
        action: function () {
          var a = document.createElement("a");
          a.href = "/assets/Utpal_Das_Resume.pdf";
          a.download = "";
          document.body.appendChild(a);
          a.click();
          a.remove();
        },
      },
      { label: "Open GitHub", hint: "↗", icon: "external-link", action: function () { window.open("https://github.com/UtpalDas6", "_blank", "noopener"); } },
      { label: "Open LinkedIn", hint: "↗", icon: "external-link", action: function () { window.open("https://www.linkedin.com/in/utpal-das-b63671126/", "_blank", "noopener"); } },
      { label: "Open Twitter / X", hint: "↗", icon: "external-link", action: function () { window.open("https://twitter.com/Utpal20386592", "_blank", "noopener"); } },
      { label: "Open YouTube", hint: "↗", icon: "external-link", action: function () { window.open("https://www.youtube.com/channel/UC1tb2a-2j_BoWt7tAMlE1iw/featured", "_blank", "noopener"); } },
    ];

    var activeIndex = 0;
    var filtered = items;

    function render() {
      list.innerHTML = "";
      if (!filtered.length) {
        var empty = document.createElement("li");
        empty.className = "cmdk__empty";
        empty.textContent = "No matching commands.";
        list.appendChild(empty);
        return;
      }
      filtered.forEach(function (item, i) {
        var li = document.createElement("li");
        li.className = "cmdk__item" + (i === activeIndex ? " is-active" : "");
        li.setAttribute("role", "option");
        li.innerHTML =
          '<svg class="icon" aria-hidden="true"><use href="#icon-' + item.icon + '"></use></svg>' +
          "<span>" + item.label + "</span>" +
          '<span class="cmdk__item-hint">' + item.hint + "</span>";
        li.addEventListener("mouseenter", function () {
          activeIndex = i;
          render();
        });
        li.addEventListener("click", function () {
          runActive();
        });
        list.appendChild(li);
      });
    }

    function runActive() {
      var item = filtered[activeIndex];
      if (!item) return;
      close();
      item.action();
    }

    function filterItems() {
      var q = input.value.trim().toLowerCase();
      filtered = !q
        ? items
        : items.filter(function (item) {
            return item.label.toLowerCase().indexOf(q) !== -1 || item.hint.toLowerCase().indexOf(q) !== -1;
          });
      activeIndex = 0;
      render();
    }

    function open() {
      cmdk.hidden = false;
      input.value = "";
      filterItems();
      setTimeout(function () {
        input.focus();
      }, 10);
    }

    function close() {
      cmdk.hidden = true;
    }

    document.querySelectorAll("[data-cmdk-close]").forEach(function (el) {
      el.addEventListener("click", close);
    });

    var cmdkTrigger = document.getElementById("cmdk-trigger");
    var topbarCmdk = document.getElementById("topbar-cmdk");
    if (cmdkTrigger) cmdkTrigger.addEventListener("click", open);
    if (topbarCmdk) topbarCmdk.addEventListener("click", open);

    input.addEventListener("input", filterItems);

    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, filtered.length - 1);
        render();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        render();
      } else if (e.key === "Enter") {
        e.preventDefault();
        runActive();
      } else if (e.key === "Escape") {
        close();
      }
    });

    document.addEventListener("keydown", function (e) {
      var metaK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      var slash = e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA";
      if (metaK || slash) {
        e.preventDefault();
        if (cmdk.hidden) open();
        else close();
      }
      if (e.key === "Escape" && !cmdk.hidden) close();
    });
  })();
})();
