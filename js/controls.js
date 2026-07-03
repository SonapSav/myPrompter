/* controls.js — keyboard / Bluetooth-remote key handling + learn-key */
(function () {
  "use strict";

  var actions = {};      // action name -> handler fn
  var listening = null;  // { action, done } while learning a key
  var enabled = false;   // only intercept keys while prompter is open

  // A friendlier display name for a KeyboardEvent.code.
  function keyLabel(code) {
    if (!code) return "—";
    return code
      .replace(/^Key/, "")
      .replace(/^Digit/, "")
      .replace(/^Arrow/, "")
      .replace(/Left$/, " L")
      .replace(/Right$/, " R");
  }

  function handleKey(e) {
    // Learn mode: capture whatever is pressed, bind it, and stop.
    if (listening) {
      e.preventDefault();
      var cb = listening.done;
      var action = listening.action;
      listening = null;
      cb(action, e.code);
      return;
    }

    if (!enabled) return;

    var settings = window.Settings.current;
    var map = settings.bindings;
    for (var action in map) {
      if (map[action] === e.code && actions[action]) {
        e.preventDefault();
        actions[action]();
        return;
      }
    }
  }

  function register(name, fn) { actions[name] = fn; }
  function setEnabled(v) { enabled = v; }

  // Begin listening for the next key press to bind to `action`.
  function learn(action, done) {
    listening = { action: action, done: done };
  }
  function cancelLearn() { listening = null; }

  document.addEventListener("keydown", handleKey, true);

  window.Controls = {
    register: register,
    setEnabled: setEnabled,
    learn: learn,
    cancelLearn: cancelLearn,
    keyLabel: keyLabel
  };
})();
