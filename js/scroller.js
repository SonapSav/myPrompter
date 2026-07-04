/* scroller.js — requestAnimationFrame scroll engine */
(function () {
  "use strict";

  var stage, mirror, script; // DOM refs, set on init
  var offset = 0;            // current scroll offset in px (how far text has moved up)
  var maxOffset = 0;         // furthest the text can travel
  var speedLevel = 30;       // 1..100
  var running = false;
  var rafId = null;
  var lastTs = 0;
  var onEndCb = null;

  // Map the 1..100 speed dial to px/second. Feels good across phones.
  function pxPerSec(level) {
    return level * 3.2; // level 30 => ~96 px/s
  }

  function init(refs) {
    stage = refs.stage;
    mirror = refs.mirror;
    script = refs.script;
  }

  function measure() {
    // How far we must travel so the last line clears the reading area.
    maxOffset = Math.max(0, script.scrollHeight - stage.clientHeight);
  }

  function applyTransform() {
    script.style.transform = "translateY(" + (-offset) + "px)";
  }

  function applyMirror(mirrorH, mirrorV) {
    var sx = mirrorH ? -1 : 1;
    var sy = mirrorV ? -1 : 1;
    mirror.style.transform = "scale(" + sx + "," + sy + ")";
  }

  function setContent(text, style) {
    var hasText = text && text.trim().length;
    if (window.Markup) {
      script.innerHTML = hasText ? window.Markup.render(text) : " ";
    } else {
      script.textContent = hasText ? text : " ";
    }
    script.style.fontSize = style.fontSize + "px";
    script.style.lineHeight = (style.lineHeight / 100);
    script.style.paddingLeft = style.margin + "%";
    script.style.paddingRight = style.margin + "%";
    // Let layout settle before measuring.
    requestAnimationFrame(measure);
  }

  function setSpeed(level) {
    speedLevel = Math.min(100, Math.max(1, level));
  }

  function frame(ts) {
    if (!running) return;
    if (!lastTs) lastTs = ts;
    var dt = (ts - lastTs) / 1000;
    lastTs = ts;

    offset += pxPerSec(speedLevel) * dt;
    if (offset >= maxOffset) {
      offset = maxOffset;
      applyTransform();
      stop();
      if (onEndCb) onEndCb();
      return;
    }
    applyTransform();
    rafId = requestAnimationFrame(frame);
  }

  function play() {
    if (running) return;
    measure();
    if (offset >= maxOffset) return; // nothing left to scroll
    running = true;
    lastTs = 0;
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function toggle() {
    if (running) { stop(); } else { play(); }
    return running;
  }

  function restart() {
    stop();
    offset = 0;
    applyTransform();
  }

  // Seek by a pixel delta (positive = forward/down, negative = back/up).
  // Works whether playing or paused; playback continues from the new spot.
  function nudge(delta) {
    measure();
    offset = Math.min(maxOffset, Math.max(0, offset + delta));
    applyTransform();
  }

  function isRunning() { return running; }

  window.Scroller = {
    init: init,
    setContent: setContent,
    setSpeed: setSpeed,
    applyMirror: applyMirror,
    measure: measure,
    play: play,
    stop: stop,
    toggle: toggle,
    restart: restart,
    nudge: nudge,
    isRunning: isRunning,
    onEnd: function (cb) { onEndCb = cb; }
  };
})();
