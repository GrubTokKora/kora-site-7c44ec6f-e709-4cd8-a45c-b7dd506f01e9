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

  var ROUTE_DESCRIPTIONS = {
    home: "Tomatillo Taco Joint serves fresh, all-natural Mexican food in New Haven and Cos Cob, Connecticut.",
    about: "Learn the story behind Tomatillo Taco Joint and our commitment to fresh, authentic Mexican food.",
    menu: "Browse the Tomatillo Taco Joint menu, from tacos and burritos to drinks and more.",
    catering: "Order catering from Tomatillo Taco Joint for office lunches, parties, and special events.",
    "tequila-bar": "Explore Tomatillo Taco Joint's tequila bar offerings, cocktails, and downloadable menu options.",
    "new-haven": "Visit Tomatillo Taco Joint in New Haven for fresh Mexican food, online ordering, and local contact info.",
    "cos-cob": "Visit Tomatillo Taco Joint in Cos Cob for fresh Mexican food, online ordering, and local contact info.",
    events: "See the latest Tomatillo Taco Joint events and where to follow updates for upcoming happenings.",
    photos: "View food and dining photos from Tomatillo Taco Joint in New Haven and Cos Cob.",
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

  function setMetaContent(selector, value) {
    var el = document.querySelector(selector);
    if (el) el.setAttribute("content", value);
  }

  function syncRouteSeo(routeId) {
    var title = ROUTE_TITLES[routeId] || ROUTE_TITLES.home;
    var description = ROUTE_DESCRIPTIONS[routeId] || ROUTE_DESCRIPTIONS.home;
    var routeHash = "#/" + routeId;
    var fullUrl = location.origin + location.pathname + (routeId === "home" ? "#/" : routeHash);

    document.title = title;
    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[property="og:title"]', title);
    setMetaContent('meta[property="og:description"]', description);
    setMetaContent('meta[property="og:url"]', fullUrl);
    setMetaContent('meta[name="twitter:title"]', title);
    setMetaContent('meta[name="twitter:description"]', description);
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
    syncRouteSeo(routeId);
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
