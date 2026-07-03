/* settings.js — persisted user settings + key bindings */
(function () {
  "use strict";

  var KEY = "myprompter.settings.v1";

  var DEFAULTS = {
    speed: 30,        // 1..100 (mapped to px/sec in scroller)
    fontSize: 64,     // px
    lineHeight: 150,  // % (150 = 1.5)
    margin: 8,        // % side padding
    mirrorH: false,
    mirrorV: false,
    countdown: true,
    keepAwake: true,
    guide: true,
    bindings: {
      playPause: "Space",
      faster: "ArrowUp",
      slower: "ArrowDown",
      restart: "KeyR",
      exit: "Escape"
    }
  };

  // Human-friendly labels for the bindings UI (order preserved).
  var BINDING_LABELS = [
    ["playPause", "Play / Pause"],
    ["faster", "Faster"],
    ["slower", "Slower"],
    ["restart", "Restart"],
    ["exit", "Exit prompter"]
  ];

  function load() {
    var s;
    try {
      s = JSON.parse(localStorage.getItem(KEY)) || {};
    } catch (e) {
      s = {};
    }
    var out = Object.assign({}, DEFAULTS, s);
    // bindings need a deep-ish merge so new actions get defaults
    out.bindings = Object.assign({}, DEFAULTS.bindings, s.bindings || {});
    return out;
  }

  function save(settings) {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch (e) {
      /* storage full or unavailable — ignore */
    }
  }

  window.Settings = {
    DEFAULTS: DEFAULTS,
    BINDING_LABELS: BINDING_LABELS,
    load: load,
    save: save,
    current: load()
  };
})();
