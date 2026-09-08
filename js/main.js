/* North TX SeniorMatics — interactions */
(function () {
  "use strict";

  /* Mobile nav */
  var burger = document.querySelector(".burger");
  var nav = document.getElementById("nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!open));
      burger.setAttribute("aria-expanded", String(!open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.matches("a")) { nav.setAttribute("data-open", "false"); burger.setAttribute("aria-expanded", "false"); }
    });
    var navClose = nav.querySelector(".nav-close");
    if (navClose) navClose.addEventListener("click", function () {
      nav.setAttribute("data-open", "false"); burger.setAttribute("aria-expanded", "false");
    });
  }

  /* Dropdowns */
  var items = Array.prototype.slice.call(document.querySelectorAll(".has-menu"));
  items.forEach(function (item) {
    var btn = item.querySelector(".navbtn");
    if (!btn) return;
    function close() { item.setAttribute("data-open", "false"); btn.setAttribute("aria-expanded", "false"); }
    function open() { item.setAttribute("data-open", "true"); btn.setAttribute("aria-expanded", "true"); }
    btn.addEventListener("click", function () { (item.getAttribute("data-open") === "true") ? close() : open(); });
    item.addEventListener("keyup", function (e) { if (e.key === "Escape") { close(); btn.focus(); } });
  });
  document.addEventListener("click", function (e) {
    items.forEach(function (item) {
      if (!item.contains(e.target)) {
        item.setAttribute("data-open", "false");
        var b = item.querySelector(".navbtn"); if (b) b.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* Text-size toggle (session only) */
  var sizeBtns = Array.prototype.slice.call(document.querySelectorAll(".textsize button"));
  sizeBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var size = b.getAttribute("data-size");
      if (size === "base") document.documentElement.removeAttribute("data-textsize");
      else document.documentElement.setAttribute("data-textsize", size);
      sizeBtns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    });
  });

  /* Live Dialogue demo */
  var stage = document.querySelector(".stage");
  if (stage) {
    var statusText = stage.querySelector(".status-text");
    var transcript = stage.querySelector(".transcript");
    var soundBtn   = stage.querySelector(".snd");
    var audio      = stage.querySelector(".ld-audio");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var soundOn = soundBtn ? soundBtn.getAttribute("aria-pressed") === "true" : false;

    if (audio && soundBtn) {
      audio.addEventListener("loadeddata", function () {
        soundBtn.hidden = false; soundOn = true; soundBtn.setAttribute("aria-pressed", "true");
        var l = soundBtn.querySelector(".snd-label"); if (l) l.textContent = "Sound on";
      });
      audio.addEventListener("error", function () { /* no audio file present yet */ });
    }
    if (soundBtn) {
      soundBtn.addEventListener("click", function () {
        soundOn = !soundOn;
        soundBtn.setAttribute("aria-pressed", String(soundOn));
        var lab = soundBtn.querySelector(".snd-label"); if (lab) lab.textContent = soundOn ? "Sound on" : "Sound off";
        if (!soundOn && audio) audio.pause();
      });
    }
    function playAudio() {
      if (soundOn && audio) { try { audio.currentTime = 0; var p = audio.play(); if (p) p.catch(function(){}); } catch (e) {} }
    }

    var lines = [
      { who: "Hub",      cls: "hub",  text: "Margaret, I noticed a fall. Are you okay?" },
      { who: "Margaret", cls: "them", text: "I slipped by the couch and I can\u2019t get up." },
      { who: "Family",   cls: "hub",  text: "I can hear you, Mom \u2014 stay still, help is coming." }
    ];
    var timers = [];
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function setPhase(p, label) { stage.setAttribute("data-phase", p); if (label) statusText.textContent = label; }
    function showLine(i) {
      var l = lines[i];
      var el = document.createElement("div");
      el.className = "line " + (l.cls === "them" ? "them" : "");
      el.innerHTML = "<b>" + l.who + "</b>" + l.text;
      transcript.appendChild(el);
      requestAnimationFrame(function () { el.classList.add("show"); });
    }
    function run() {
      clearTimers();
      transcript.innerHTML = "";
      if (reduce) {
        setPhase("talking", "Live two-way voice \u00b7 connected"); playAudio();
        lines.forEach(function (_, i) { showLine(i); });
        at(50, function () { setPhase("resolved", "Help dispatched \u00b7 with context"); });
        return;
      }
      setPhase("alert", "Fall detected \u00b7 Living Room");
      at(2000, function () { setPhase("connecting", "Opening live connection\u2026"); });
      at(3600, function () {
        setPhase("talking", "Live two-way voice \u00b7 connected"); playAudio();
        showLine(0);
        at(1600, function () { showLine(1); });
        at(3400, function () { showLine(2); });
      });
      at(9800, function () { setPhase("resolved", "Help dispatched \u00b7 with context"); });
    }
    stage.addEventListener("click", function (e) {
      if (e.target.closest(".play") || e.target.closest(".replay")) run();
    });
  }
})();
