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
    /* ---- TIMING: seconds into your audio recording that each spoken line begins.
       Recording is ~11s. Tell me the real start time of each line to fine-tune. ---- */
    var CUE = [0, 2.5, 5.5];   // line 1, line 2, line 3
    var ENDT = 11;             // ~length of the recording (seconds)

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

    var lines = [
      { who: "Hub",      cls: "hub",  text: "Margaret, I noticed a fall. Are you okay?" },
      { who: "Margaret", cls: "them", text: "I slipped by the couch and I can\u2019t get up." },
      { who: "Family",   cls: "hub",  text: "I can hear you, Mom \u2014 stay still, help is coming." }
    ];
    var timers = [], onTime = null, onEnd = null, shown = [];
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function setPhase(p, label) { stage.setAttribute("data-phase", p); if (label) statusText.textContent = label; }
    function reveal(i) { if (!shown[i]) { shown[i] = true;
      var l = lines[i], el = document.createElement("div");
      el.className = "line " + (l.cls === "them" ? "them" : "");
      el.innerHTML = "<b>" + l.who + "</b>" + l.text;
      transcript.appendChild(el);
      requestAnimationFrame(function () { el.classList.add("show"); });
    } }
    function finish() { setPhase("resolved", "Help dispatched \u00b7 with context"); }
    function detach() {
      if (audio && onTime) audio.removeEventListener("timeupdate", onTime);
      if (audio && onEnd) audio.removeEventListener("ended", onEnd);
      onTime = onEnd = null;
    }

    function converse() {
      playAudio();
      if (soundOn && audio && !isNaN(audio.duration || NaN) || (soundOn && audio)) {
        // sync captions to the actual audio playback
        onTime = function () { var t = audio.currentTime; for (var i = 0; i < CUE.length; i++) if (t >= CUE[i]) reveal(i); };
        onEnd  = function () { reveal(0); reveal(1); reveal(2); finish(); detach(); };
        audio.addEventListener("timeupdate", onTime);
        audio.addEventListener("ended", onEnd);
        at((ENDT + 3) * 1000, function () { reveal(0); reveal(1); reveal(2); }); // safety net
      } else {
        // no sound: pace the captions to match the recording length
        CUE.forEach(function (sec, i) { at(sec * 1000, function () { reveal(i); }); });
        at(ENDT * 1000, finish);
      }
    }
    function playAudio() {
      if (soundOn && audio) { try { audio.currentTime = 0; var p = audio.play(); if (p) p.catch(function(){}); } catch (e) {} }
    }

    function run() {
      clearTimers(); detach();
      transcript.innerHTML = ""; shown = [];
      if (reduce) { setPhase("talking", "Live two-way voice \u00b7 connected"); converse(); return; }
      setPhase("alert", "Fall detected \u00b7 Living Room");
      at(1500, function () { setPhase("connecting", "Opening live connection\u2026"); });
      at(2700, function () { setPhase("talking", "Live two-way voice \u00b7 connected"); converse(); });
    }
    stage.addEventListener("click", function (e) {
      if (e.target.closest(".play") || e.target.closest(".replay")) run();
    });
  }
})();
