(function () {
  "use strict";

  var ROUTE_TITLES = {
    home: "Tomatillo Taco Joint | Fresh Mexican in Connecticut",
    about: "About Us | Tomatillo Taco Joint",
    menu: "Menu | Tomatillo Taco Joint",
    catering: "Catering | Tomatillo Taco Joint",
    "tequila-bar": "Tequila Bar | Tomatillo Taco Joint",
    "new-haven": "New Haven | Tomatillo Taco Joint",
    "cos-cob": "Cos Cob | Tomatillo Taco Joint",
    events: "Events | Tomatillo Taco Joint",
    photos: "Photos | Tomatillo Taco Joint",
  };

  var ALLOWED = Object.keys(ROUTE_TITLES);

  function normalizeRoute(segment) {
    if (!segment) return "home";
    var s = segment.toLowerCase();
    if (ALLOWED.indexOf(s) === -1) return "home";
    return s;
  }

  function parseHash() {
    var raw = (location.hash || "#/").replace(/^#/, "").replace(/^\//, "");
    var parts = raw.split("/").filter(Boolean);
    var route = normalizeRoute(parts[0] || "home");
    return { route: route, parts: parts, menuSub: (parts[1] || "").toLowerCase() };
  }

  function setHtmlScrollSnap(on) {
    document.documentElement.classList.toggle("home-scroll-snap", on);
  }

  function showRoutes(routeId) {
    document.querySelectorAll(".route").forEach(function (el) {
      el.classList.toggle("is-active", el.id === "route-" + routeId);
    });
    document.body.className = document.body.className
      .split(/\s+/)
      .filter(function (name) { return name && name.indexOf("route-") !== 0; })
      .concat("route-" + routeId)
      .join(" ");
    setHtmlScrollSnap(routeId === "home");
    document.title = ROUTE_TITLES[routeId] || ROUTE_TITLES.home;
    window.scrollTo(0, 0);
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");
    if (header) header.classList.remove("nav-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  /* ----- menu board ----- */
  function syncMenuBoard(routeId, menuSub) {
    var board = document.getElementById("menu-board");
    if (!board) return;
    if (routeId !== "menu") {
      board.classList.remove("is-food", "is-drinks");
      board.dataset.view = "pick";
      return;
    }
    board.classList.remove("is-food", "is-drinks");
    if (menuSub === "food") {
      board.classList.add("is-food");
      board.dataset.view = "food";
    } else if (menuSub === "drinks") {
      board.classList.add("is-drinks");
      board.dataset.view = "drinks";
    } else {
      board.dataset.view = "pick";
    }
  }

  function replaceMenuHash(which) {
    try {
      history.replaceState(null, "", which ? "#/menu/" + which : "#/menu");
    } catch (e) {}
  }

  function bindMenuBoard() {
    var board = document.getElementById("menu-board");
    if (!board) return;
    var back = document.getElementById("menu-back");
    var btnFood = document.getElementById("menu-open-food");
    var btnDrinks = document.getElementById("menu-open-drinks");

    function show(which) {
      board.classList.remove("is-food", "is-drinks");
      if (which === "food") {
        board.classList.add("is-food");
        board.dataset.view = "food";
      } else if (which === "drinks") {
        board.classList.add("is-drinks");
        board.dataset.view = "drinks";
      } else {
        board.dataset.view = "pick";
      }
      replaceMenuHash(which);
      if (which) {
        board.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    if (btnFood) btnFood.addEventListener("click", function () { show("food"); });
    if (btnDrinks) btnDrinks.addEventListener("click", function () { show("drinks"); });
    if (back) back.addEventListener("click", function () { show(null); });
  }

  function applyRouteFromHash() {
    var p = parseHash();
    if (!location.hash || location.hash === "#") {
      try {
        history.replaceState(null, "", "#/");
      } catch (e) {}
      p = parseHash();
    }
    showRoutes(p.route);
    syncMenuBoard(p.route, p.menuSub);
  }

  /* ----- header / nav / reveal / strip ----- */
  function initChrome() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");

    if (toggle && header) {
      toggle.addEventListener("click", function () {
        var open = header.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    if (header) {
      var onScroll = function () {
        header.classList.toggle("is-scrolled", window.scrollY > 24);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    document.querySelectorAll(".reveal").forEach(function (el) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              e.target.classList.add("is-visible");
              io.unobserve(e.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      io.observe(el);
    });

    var strip = document.querySelector("[data-dismiss-strip]");
    if (strip) {
      var key = "tomatillo-strip-dismissed";
      if (sessionStorage.getItem(key)) {
        strip.hidden = true;
      }
      var btn = strip.querySelector("[data-dismiss-btn]");
      if (btn) {
        btn.addEventListener("click", function () {
          sessionStorage.setItem(key, "1");
          strip.hidden = true;
        });
      }
    }
  }

  initChrome();
  bindMenuBoard();
  applyRouteFromHash();
  window.addEventListener("hashchange", applyRouteFromHash);
})();
