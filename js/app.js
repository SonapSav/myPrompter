/* app.js — wires screens, settings UI, prompter session, PWA */
(function () {
  "use strict";

  var VERSION = "0.3.1";
  var S = window.Settings.current;

  // ---- element refs ----
  var $ = function (id) { return document.getElementById(id); };
  var editor = $("editor");
  var prompter = $("prompter");

  var scriptName = $("scriptName");
  var scriptText = $("scriptText");
  var libraryList = $("libraryList");
  var editorHint = $("editorHint");

  var currentId = null; // id of the script being edited (null = unsaved/new)

  // ================= Editor / Library =================

  function setHint(msg) {
    editorHint.textContent = msg || "";
    if (msg) {
      clearTimeout(setHint._t);
      setHint._t = setTimeout(function () { editorHint.textContent = ""; }, 2500);
    }
  }

  function renderLibrary() {
    var scripts = window.Library.listSorted();
    libraryList.innerHTML = "";
    if (!scripts.length) {
      var empty = document.createElement("li");
      empty.className = "library-empty";
      empty.textContent = "No saved scripts yet. Write one and tap Save.";
      libraryList.appendChild(empty);
      return;
    }
    scripts.forEach(function (s) {
      var li = document.createElement("li");
      li.className = "library-item";

      var name = document.createElement("span");
      name.className = "li-name";
      name.textContent = s.name;

      var date = document.createElement("span");
      date.className = "li-date";
      date.textContent = new Date(s.updatedAt).toLocaleDateString();

      var del = document.createElement("button");
      del.className = "li-del";
      del.textContent = "🗑";
      del.title = "Delete";
      del.addEventListener("click", function (ev) {
        ev.stopPropagation();
        if (confirm('Delete "' + s.name + '"?')) {
          window.Library.remove(s.id);
          if (currentId === s.id) currentId = null;
          renderLibrary();
        }
      });

      li.addEventListener("click", function () { loadScript(s.id); });
      li.appendChild(name);
      li.appendChild(date);
      li.appendChild(del);
      libraryList.appendChild(li);
    });
  }

  function loadScript(id) {
    var s = window.Library.get(id);
    if (!s) return;
    currentId = s.id;
    scriptName.value = s.name;
    scriptText.value = s.text;
    setHint('Loaded "' + s.name + '"');
  }

  function saveScript() {
    var text = scriptText.value;
    if (!text.trim()) { setHint("Nothing to save."); return; }
    var rec = window.Library.upsert({
      id: currentId,
      name: (scriptName.value.trim() || "Untitled script"),
      text: text
    });
    currentId = rec.id;
    renderLibrary();
    setHint("Saved.");
  }

  function newScript() {
    currentId = null;
    scriptName.value = "";
    scriptText.value = "";
    scriptName.focus();
  }

  // ---- import / backup / restore ----
  function importTxt(file) {
    var reader = new FileReader();
    reader.onload = function () {
      currentId = null;
      scriptText.value = String(reader.result || "");
      scriptName.value = file.name.replace(/\.txt$/i, "");
      setHint("Imported " + file.name);
    };
    reader.readAsText(file);
  }

  function backupAll() {
    var data = JSON.stringify({ app: "myPrompter", version: VERSION, scripts: window.Library.readAll() }, null, 2);
    var blob = new Blob([data], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "myprompter-backup.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function restoreAll(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(String(reader.result));
        var n = window.Library.importMany(parsed.scripts || parsed);
        renderLibrary();
        setHint("Restored " + n + " script" + (n === 1 ? "" : "s") + ".");
      } catch (e) {
        setHint("Could not read that backup file.");
      }
    };
    reader.readAsText(file);
  }

  // ================= Settings panel =================
  var settingsPanel = $("settingsPanel");

  function syncOutputs() {
    $("outSpeed").textContent = S.speed;
    $("outFont").textContent = S.fontSize + "px";
    $("outLine").textContent = (S.lineHeight / 100).toFixed(2);
    $("outMargin").textContent = S.margin + "%";
  }

  function bindSetting(inputId, key, opts) {
    var el = $(inputId);
    opts = opts || {};
    if (opts.checkbox) {
      el.checked = !!S[key];
      el.addEventListener("change", function () {
        S[key] = el.checked;
        window.Settings.save(S);
        if (opts.onChange) opts.onChange();
      });
    } else {
      el.value = S[key];
      el.addEventListener("input", function () {
        S[key] = Number(el.value);
        syncOutputs();
        window.Settings.save(S);
        if (opts.onChange) opts.onChange();
      });
    }
  }

  function renderBindings() {
    var host = $("bindingList");
    host.innerHTML = "";
    window.Settings.BINDING_LABELS.forEach(function (pair) {
      var action = pair[0], label = pair[1];
      var row = document.createElement("div");
      row.className = "binding-row";

      var lab = document.createElement("span");
      lab.className = "b-label";
      lab.textContent = label;

      var key = document.createElement("span");
      key.className = "b-key";
      key.textContent = window.Controls.keyLabel(S.bindings[action]);

      var btn = document.createElement("button");
      btn.className = "b-assign";
      btn.textContent = "Assign";
      btn.addEventListener("click", function () {
        row.classList.add("listening");
        btn.textContent = "Press key…";
        window.Controls.learn(action, function (act, code) {
          S.bindings[act] = code;
          window.Settings.save(S);
          renderBindings();
        });
      });

      row.appendChild(lab);
      row.appendChild(key);
      row.appendChild(btn);
      host.appendChild(row);
    });
  }

  function openSettings() { settingsPanel.hidden = false; }
  function closeSettings() {
    window.Controls.cancelLearn();
    settingsPanel.hidden = true;
  }

  // ================= Prompter session =================
  var stage = $("stage");
  var controls = $("controls");
  var pcPlay = $("pcPlay");
  var pcSpeedVal = $("pcSpeedVal");
  var countdownEl = $("countdown");
  var guideEl = $("guide");

  var wakeLock = null;
  var fadeTimer = null;
  var promptStartAt = 0; // timestamp so the starting tap can't reveal controls

  window.Scroller.init({ stage: stage, mirror: $("mirror"), script: $("script") });

  function updateSpeedLabel() { pcSpeedVal.textContent = S.speed; }
  function updatePlayIcon() { pcPlay.textContent = window.Scroller.isRunning() ? "⏸" : "▶"; }

  // Reveal the control panel, then auto-hide it.
  // Hidden-controls mode: always hide after 3s (even paused).
  // Normal mode: hide after 2.5s only while scrolling.
  function scheduleFade() {
    controls.classList.remove("faded");
    clearTimeout(fadeTimer);
    var delay = S.hideControls ? 3000 : 2500;
    fadeTimer = setTimeout(function () {
      if (S.hideControls || window.Scroller.isRunning()) controls.classList.add("faded");
    }, delay);
  }

  function hideControlsNow() {
    clearTimeout(fadeTimer);
    controls.classList.add("faded");
  }

  // At prompter start / scroll begin: hide straight away in hidden-controls
  // mode so nothing obstructs the view; otherwise show with the usual fade.
  function initControlsForPlay() {
    if (S.hideControls) hideControlsNow();
    else scheduleFade();
  }

  async function requestWake() {
    if (!S.keepAwake || !("wakeLock" in navigator)) return;
    try { wakeLock = await navigator.wakeLock.request("screen"); } catch (e) { /* denied */ }
  }
  function releaseWake() {
    if (wakeLock) { wakeLock.release().catch(function () {}); wakeLock = null; }
  }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && !prompter.hidden) requestWake();
  });

  function enterFullscreen() {
    var el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(function () {});
  }
  function exitFullscreen() {
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
  }

  function startPrompter() {
    var text = scriptText.value;
    if (!text.trim()) { setHint("Write or load a script first."); return; }

    promptStartAt = performance.now();

    window.Scroller.setContent(text, {
      fontSize: S.fontSize, lineHeight: S.lineHeight, margin: S.margin
    });
    window.Scroller.setSpeed(S.speed);
    window.Scroller.applyMirror(S.mirrorH, S.mirrorV);
    window.Scroller.restart();

    guideEl.hidden = !S.guide;
    prompter.hidden = false;
    updateSpeedLabel();
    updatePlayIcon();
    window.Controls.setEnabled(true);
    enterFullscreen();
    requestWake();
    initControlsForPlay();

    if (S.countdown) runCountdown(3, beginScroll);
    else beginScroll();
  }

  function beginScroll() {
    window.Scroller.play();
    updatePlayIcon();
    initControlsForPlay();
  }

  function runCountdown(from, done) {
    countdownEl.hidden = false;
    var n = from;
    countdownEl.textContent = n;
    var timer = setInterval(function () {
      n -= 1;
      if (n <= 0) {
        clearInterval(timer);
        countdownEl.hidden = true;
        done();
      } else {
        countdownEl.textContent = n;
      }
    }, 1000);
  }

  function exitPrompter() {
    window.Scroller.stop();
    window.Controls.setEnabled(false);
    prompter.hidden = true;
    controls.classList.remove("faded");
    clearTimeout(fadeTimer);
    releaseWake();
    exitFullscreen();
    updatePlayIcon();
  }

  function togglePlay() {
    window.Scroller.toggle();
    updatePlayIcon();
    scheduleFade();
  }
  function nudgeSpeed(delta) {
    S.speed = Math.min(100, Math.max(1, S.speed + delta));
    window.Scroller.setSpeed(S.speed);
    window.Settings.save(S);
    updateSpeedLabel();
    syncOutputs();
    $("setSpeed").value = S.speed;
    scheduleFade();
  }
  function restartScroll() {
    window.Scroller.restart();
    window.Scroller.play();
    updatePlayIcon();
    scheduleFade();
  }
  // Seek forward/back by ~a fifth of the screen per press; hold to repeat.
  function seek(dir) {
    var step = Math.max(80, Math.round(stage.clientHeight * 0.2));
    window.Scroller.nudge(dir * step);
    scheduleFade();
  }

  window.Scroller.onEnd(function () { updatePlayIcon(); scheduleFade(); });

  // Prompter button + tap wiring
  pcPlay.addEventListener("click", togglePlay);
  $("pcFaster").addEventListener("click", function () { nudgeSpeed(2); });
  $("pcSlower").addEventListener("click", function () { nudgeSpeed(-2); });
  $("pcRestart").addEventListener("click", restartScroll);
  $("pcBack").addEventListener("click", function () { seek(-1); });
  $("pcForward").addEventListener("click", function () { seek(1); });
  $("pcExit").addEventListener("click", exitPrompter);
  // Reveal controls on a deliberate tap — but ignore the tap-through from the
  // "Start" gesture (on touch it lands on the stage the instant it appears).
  stage.addEventListener("click", function () {
    if (performance.now() - promptStartAt < 700) return;
    scheduleFade();
  });

  // Remote / Bluetooth actions (keyboard-driven)
  window.Controls.register("playPause", togglePlay);
  window.Controls.register("faster", function () { nudgeSpeed(2); });
  window.Controls.register("slower", function () { nudgeSpeed(-2); });
  window.Controls.register("seekBack", function () { seek(-1); });
  window.Controls.register("seekForward", function () { seek(1); });
  window.Controls.register("restart", restartScroll);
  window.Controls.register("exit", exitPrompter);

  // ================= Wire up editor controls =================
  $("btnStart").addEventListener("click", startPrompter);
  $("btnSave").addEventListener("click", saveScript);
  $("btnNew").addEventListener("click", newScript);
  $("fileImport").addEventListener("change", function (e) { if (e.target.files[0]) importTxt(e.target.files[0]); e.target.value = ""; });
  $("btnExportAll").addEventListener("click", backupAll);
  $("fileRestore").addEventListener("change", function (e) { if (e.target.files[0]) restoreAll(e.target.files[0]); e.target.value = ""; });

  $("btnSettings").addEventListener("click", openSettings);
  $("btnCloseSettings").addEventListener("click", closeSettings);
  $("btnResetBindings").addEventListener("click", function () {
    S.bindings = Object.assign({}, window.Settings.DEFAULTS.bindings);
    window.Settings.save(S);
    renderBindings();
  });

  bindSetting("setSpeed", "speed");
  bindSetting("setFont", "fontSize");
  bindSetting("setLine", "lineHeight");
  bindSetting("setMargin", "margin");
  bindSetting("setMirrorH", "mirrorH", { checkbox: true });
  bindSetting("setMirrorV", "mirrorV", { checkbox: true });
  bindSetting("setCountdown", "countdown", { checkbox: true });
  bindSetting("setWake", "keepAwake", { checkbox: true });
  bindSetting("setGuide", "guide", { checkbox: true });
  bindSetting("setHideControls", "hideControls", { checkbox: true });

  $("appVersion").textContent = "myPrompter v" + VERSION;

  // ================= Init =================
  syncOutputs();
  renderBindings();
  renderLibrary();
  updateSpeedLabel();

  // Register service worker (only works over http/https, not file://).
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("service-worker.js").catch(function () {});
    });
  }
})();
