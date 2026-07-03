/* library.js — local script storage (CRUD + backup/restore) */
(function () {
  "use strict";

  var KEY = "myprompter.scripts.v1";

  function readAll() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function writeAll(list) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch (e) {
      /* ignore */
    }
  }

  function makeId() {
    // Not crypto — just needs to be unique enough within one device.
    return "s_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  function upsert(script) {
    var list = readAll();
    var now = Date.now();
    if (script.id) {
      var idx = list.findIndex(function (s) { return s.id === script.id; });
      if (idx >= 0) {
        list[idx] = Object.assign({}, list[idx], script, { updatedAt: now });
        writeAll(list);
        return list[idx];
      }
    }
    var rec = {
      id: makeId(),
      name: script.name || "Untitled script",
      text: script.text || "",
      updatedAt: now
    };
    list.push(rec);
    writeAll(list);
    return rec;
  }

  function remove(id) {
    writeAll(readAll().filter(function (s) { return s.id !== id; }));
  }

  function get(id) {
    return readAll().find(function (s) { return s.id === id; }) || null;
  }

  // Most-recently-updated first.
  function listSorted() {
    return readAll().sort(function (a, b) { return b.updatedAt - a.updatedAt; });
  }

  function importMany(scripts) {
    if (!Array.isArray(scripts)) return 0;
    var list = readAll();
    var count = 0;
    scripts.forEach(function (s) {
      if (s && typeof s.text === "string") {
        list.push({
          id: makeId(),
          name: s.name || "Imported script",
          text: s.text,
          updatedAt: Date.now()
        });
        count++;
      }
    });
    writeAll(list);
    return count;
  }

  window.Library = {
    listSorted: listSorted,
    upsert: upsert,
    remove: remove,
    get: get,
    readAll: readAll,
    importMany: importMany
  };
})();
