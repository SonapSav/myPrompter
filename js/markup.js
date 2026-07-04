/* markup.js — parse labeled-bracket delivery cues into styled HTML.
   Syntax:
     [emphasis: text]  [soft: text]  [slow: text]  [fast: text]   -> styled spoken words
     [pause]  [breathe]                                            -> silent cue chips
   Unknown roles (e.g. "[1]", "[note]") are left as-is, so ordinary
   brackets in a script are never mangled. */
(function () {
  "use strict";

  // role -> { type, cls }.  type 'style' wraps spoken text; 'cue' is a chip.
  var ROLES = {
    emphasis:  { type: "style", cls: "mk-emphasis" },
    emphasize: { type: "style", cls: "mk-emphasis" },
    strong:    { type: "style", cls: "mk-emphasis" },
    soft:      { type: "style", cls: "mk-soft" },
    whisper:   { type: "style", cls: "mk-soft" },
    slow:      { type: "style", cls: "mk-slow" },
    fast:      { type: "style", cls: "mk-fast" },
    pause:     { type: "cue",   cls: "cue-pause" },
    breathe:   { type: "cue",   cls: "cue-breathe" },
    breath:    { type: "cue",   cls: "cue-breathe" }
  };

  // Canonical forms shown in the editor cheat sheet.
  var LEGEND = [
    { syntax: "[emphasis: text]", cls: "mk-emphasis", sample: "say it strong" },
    { syntax: "[soft: text]",     cls: "mk-soft",     sample: "lower your voice" },
    { syntax: "[slow: text]",     cls: "mk-slow",     sample: "slow it down" },
    { syntax: "[fast: text]",     cls: "mk-fast",     sample: "pick up the pace" },
    { syntax: "[pause]",          cls: "cue-pause",   cue: true },
    { syntax: "[breathe]",        cls: "cue-breathe", cue: true }
  ];

  function escapeHtml(s) {
    return s.replace(/[&<>]/g, function (c) {
      return c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;";
    });
  }

  // Returns HTML. Input text is fully escaped first, so cue text can never
  // inject markup — the spans we add are the only HTML in the output.
  function render(raw) {
    var esc = escapeHtml(raw);
    return esc.replace(/\[([a-zA-Z]+)(?::\s*([^\]]*))?\]/g, function (m, role, text) {
      var cfg = ROLES[role.toLowerCase()];
      if (!cfg) return m; // unknown role -> leave literal
      if (cfg.type === "cue") {
        var label = (text && text.trim()) ? text.trim() : role;
        return '<span class="cue ' + cfg.cls + '">' + label + "</span>";
      }
      if (text == null || !text.trim()) return m; // style role needs text
      return '<span class="mk ' + cfg.cls + '">' + text + "</span>";
    });
  }

  window.Markup = { render: render, LEGEND: LEGEND, escapeHtml: escapeHtml };
})();
