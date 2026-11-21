/* Shared by every legilly.com site, served from https://legilly.com/shared/ (hub repo, see MAINTAINING.md).
   Load it in <head>, before the stylesheets. It:
   1. applies the colour theme before the page draws. The choice ("purple.dark") is kept in a cookie
      readable by legilly.com and all its subdomains (theme name only), so it's the same on every site;
   2. draws the navigation bar at the top of the page: home, the Games and Tools menus, the theme button.
   Which project a page belongs to: <html data-lg-project="…">. <html data-tp-dark-only> keeps a site dark. */
(function () {
  "use strict";

  /* ---------- the projects (add new ones here) ---------- */
  var HOME = "https://legilly.com/";
  var GROUPS = [
    ["Games", [
      { id: "halo", name: "Who's that Halo?", desc: "Guess the Blue Archive student from her halo", url: "https://legilly.com/ba-halo-game/" },
      { id: "idlerpg", name: "IdleRPG Web", desc: "The classic IRC game that plays itself", url: "https://legilly.com/irc-idlerpg-web/" },
    ]],
    ["Tools", [
      { id: "anime", name: "Anime Dashboard", desc: "Browse and update MyAnimeList lists", url: "https://anime.legilly.com/" },
    ]],
  ];

  var THEMES = [["blue", "Blue"], ["purple", "Purple"], ["teal", "Teal"], ["amber", "Amber"], ["rose", "Rose"]];
  var MODES = [["system", "System"], ["light", "Light"], ["dark", "Dark"]];
  var KEY = "legilly_theme";
  var root = document.documentElement;
  var here = root.getAttribute("data-lg-project") || "home";
  var darkOnly = root.hasAttribute("data-tp-dark-only");
  var systemDark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var known = function (list, v) { return list.some(function (x) { return x[0] === v; }); };
  var label = function (list, v) { for (var i = 0; i < list.length; i++) if (list[i][0] === v) return list[i][1]; return v; };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); };

  /* ---------- 1. colour theme ---------- */
  function read() {
    var m = document.cookie.match(/(?:^|;\s*)legilly_theme=([a-z]+)\.([a-z]+)/);
    var v = m ? [m[1], m[2]] : null;
    if (!v) { try { var s = localStorage.getItem(KEY); if (s) v = s.split("."); } catch (e) { /* storage blocked */ } }
    return {
      theme: v && known(THEMES, v[0]) ? v[0] : "blue",
      mode: v && known(MODES, v[1]) ? v[1] : "system",
    };
  }
  function apply(p) {
    root.setAttribute("data-theme", p.theme);
    root.setAttribute("data-mode", darkOnly ? "dark" : p.mode === "system" ? (systemDark && systemDark.matches ? "dark" : "light") : p.mode);
  }
  function save(p) {
    var v = p.theme + "." + p.mode;
    var shared = /(^|\.)legilly\.com$/.test(location.hostname) ? "; domain=legilly.com" : "";
    document.cookie = KEY + "=" + v + shared + "; path=/; max-age=34560000; samesite=lax" +
      (location.protocol === "https:" ? "; secure" : "");
    try { localStorage.setItem(KEY, v); } catch (e) { /* storage blocked */ }
  }
  var current = read();
  apply(current);
  root.classList.add("lg-bar-on"); // the stylesheet keeps room for the bar from the start
  if (systemDark && systemDark.addEventListener) systemDark.addEventListener("change", function () { apply(current); });
  // Changed on another legilly.com site or tab meanwhile: follow it when this tab comes back.
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) return;
    var now = read();
    if (now.theme !== current.theme || now.mode !== current.mode) { current = now; apply(current); updateTheme(); }
  });

  /* ---------- 2. the bar ---------- */
  var ICON_HOME = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/></svg>';
  var ICON_DOWN = '<svg viewBox="0 0 12 12" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 4.5 3 3 3-3"/></svg>';
  var bar;
  function build() {
    bar = document.createElement("nav");
    bar.className = "lg-bar";
    bar.setAttribute("aria-label", "LeGilly projects");
    var menus = GROUPS.map(function (g, i) {
      var mine = g[1].some(function (p) { return p.id === here; });
      return '<div class="lg-menu"><button type="button" class="lg-cat' + (mine ? " lg-here" : "") + '" aria-expanded="false" aria-controls="lgDrop' + i + '">' +
        esc(g[0]) + ICON_DOWN + '</button><div class="lg-drop" id="lgDrop' + i + '" hidden>' +
        g[1].map(function (p) {
          return '<a href="' + esc(p.url) + '"' + (p.id === here ? ' aria-current="page"' : "") + "><strong>" + esc(p.name) + "</strong><small>" + esc(p.desc) + "</small></a>";
        }).join("") + "</div></div>";
    }).join("");
    bar.innerHTML =
      '<a class="lg-home" href="' + HOME + '" title="All projects" aria-label="Home: all projects"' + (here === "home" ? ' aria-current="page"' : "") + ">" + ICON_HOME + "</a>" +
      '<span class="lg-sep" aria-hidden="true"></span>' + menus + '<span class="lg-spacer"></span>' +
      '<div class="tp"><button type="button" class="tp-btn" aria-expanded="false" aria-controls="tpPop"><span class="tp-sw"></span></button>' +
      '<div class="tp-pop" id="tpPop" role="dialog" aria-label="Theme" hidden>' +
        '<div class="tp-label">Colour</div><div class="tp-dots">' +
        THEMES.map(function (t) { return '<button type="button" class="tp-dot tp-' + t[0] + '" data-tp-theme="' + t[0] + '" title="' + t[1] + '" aria-label="' + t[1] + '"></button>'; }).join("") +
        '</div><div class="tp-label">Light or dark</div>' +
        (darkOnly ? '<p class="tp-note">Always dark here. Your choice applies on the other sites.</p>' : "") +
        '<div class="tp-modes"' + (darkOnly ? " hidden" : "") + ">" +
        MODES.map(function (m) { return '<button type="button" data-tp-mode="' + m[0] + '">' + m[1] + "</button>"; }).join("") +
      "</div></div></div>";
    document.body.insertBefore(bar, document.body.firstChild);

    bar.addEventListener("click", function (ev) {
      var b = ev.target.closest("button");
      if (!b) return;
      if (b.classList.contains("lg-cat") || b.classList.contains("tp-btn")) { openOnly(b.getAttribute("aria-expanded") === "true" ? null : b); return; }
      if (b.dataset.tpTheme) current.theme = b.dataset.tpTheme;
      else if (b.dataset.tpMode) current.mode = b.dataset.tpMode;
      else return;
      apply(current); save(current); updateTheme();
    });
    document.addEventListener("click", function (ev) { if (!bar.contains(ev.target)) openOnly(null); });
    document.addEventListener("keydown", function (ev) {
      if (ev.key !== "Escape") return;
      var open = bar.querySelector('[aria-expanded="true"]');
      if (open) { openOnly(null); open.focus(); }
    });
    updateTheme();
  }
  // Opens one menu (or the theme panel) and closes the others; null closes all.
  function openOnly(btn) {
    bar.querySelectorAll("[aria-expanded]").forEach(function (b) {
      var on = b === btn;
      b.setAttribute("aria-expanded", String(on));
      document.getElementById(b.getAttribute("aria-controls")).hidden = !on;
    });
    if (btn) {
      var pop = document.getElementById(btn.getAttribute("aria-controls"));
      var first = pop.querySelector('[aria-pressed="true"], [aria-current="page"], a, button');
      if (first) first.focus();
    }
  }
  function updateTheme() {
    if (!bar) return;
    var btn = bar.querySelector(".tp-btn");
    btn.querySelector(".tp-sw").className = "tp-sw tp-" + current.theme;
    var name = "Theme: " + label(THEMES, current.theme) + (darkOnly ? "" : ", " + label(MODES, current.mode).toLowerCase());
    btn.title = name; btn.setAttribute("aria-label", name);
    bar.querySelectorAll("[data-tp-theme]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.tpTheme === current.theme)); });
    bar.querySelectorAll("[data-tp-mode]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.tpMode === current.mode)); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
  window.LegillyTheme = { get: function () { return { theme: current.theme, mode: current.mode }; } };
})();
