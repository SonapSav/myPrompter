# myPrompter

**A clean, minimal teleprompter that runs entirely in your browser — installable as an offline app (PWA).**
No accounts, no build step, no dependencies, no server. Everything stays on your device.

![PWA – installable](https://img.shields.io/badge/PWA-installable-ffcc33)
![Dependencies – none](https://img.shields.io/badge/dependencies-none-46d17f)
![Vanilla JS](https://img.shields.io/badge/built%20with-HTML%20%C2%B7%20CSS%20%C2%B7%20JS-8fbcff)
![License – MIT](https://img.shields.io/badge/license-MIT-blue)

**▶ Live app:** https://sonapsav.github.io/myPrompter/ · Open it on your phone and **Add to Home Screen**.

<!-- Replace the placeholder images below with your own screenshots (e.g. drop PNGs in an assets/ folder and update the paths). -->
![myPrompter banner](https://placehold.co/1200x360/0b0b0d/ffcc33?text=myPrompter)

---

## What is it?

myPrompter turns any phone, tablet, or laptop into a teleprompter. Paste a script, hit start,
and it scrolls at your pace with big, readable type on a dark screen. It’s designed to be
**fast, private, and offline-first** — once loaded it needs no connection, and your scripts
never leave the device.

It also supports **Bluetooth remotes/pedals**, **beam-splitter mirror rigs**, and inline
**delivery cues** that color parts of your script to remind you to emphasize, soften, pause,
or change pace.

<p>
  <img src="https://placehold.co/460x300/0b0b0d/f4f4f6?text=Editor" alt="Editor screen" width="46%">
  <img src="https://placehold.co/460x300/000000/ffcc33?text=Prompter+%2B+cues" alt="Prompter with delivery cues" width="46%">
</p>

## Features

- **Smooth scroll engine** — adjustable speed, font size, line spacing, and side margins
- **Play / pause / restart**, optional 3-2-1 countdown, and an eye-line reading guide
- **Jump forward / back** through the script at any time (on-screen or by remote)
- **Mirror mode** — flip horizontally for beam-splitter rigs, or flip vertically
- **Hide-controls mode** — an unobstructed screen driven by your Bluetooth remote; tap to reveal controls for a moment
- **Bluetooth remote / pedal support** — remotes act as keyboards; bind any button with a “learn key” flow
- **Delivery cues** — color words with labeled brackets to cue emphasis, tone, and pacing
- **Script library** on your device — save, rename, edit, delete
- **Import & export** — import `.txt`, download a single script as `.txt`, or back up / restore your whole library as JSON
- **Keeps the screen awake** while you read, and runs **fullscreen**
- **Installable & fully offline** — “Add to Home Screen” and it works with no connection

## Delivery cues

Wrap parts of your script in **labeled brackets** to color them on the prompter:

| You type | On the prompter | Use it to |
|---|---|---|
| `[emphasis: text]` | amber, bold | hit these words hard |
| `[soft: text]` | dim blue, italic | drop your voice |
| `[slow: text]` | orange | slow your pace |
| `[fast: text]` | pink | speed up |
| `[pause]` | green **PAUSE** chip | a silent beat (not spoken) |
| `[breathe]` | teal **BREATHE** chip | take a breath (not spoken) |

Aliases also work: `emphasize` / `strong`, `whisper`, `breath`. Anything else in brackets
(like `[1]`) is left untouched, so ordinary brackets in a script are safe.

**Example**

```
Welcome everyone. [emphasis: This is the big announcement.] [pause]
[soft: I know it's been a long wait]... but [fast: here it finally is!]
```

## Remote & keyboard controls

Most teleprompter pedals/remotes pair as a **Bluetooth keyboard** and send keystrokes, so
myPrompter works with them on both iOS and Android — no pairing code in the app. Default keys:

| Action | Key |
|---|---|
| Play / Pause | Space |
| Faster | Arrow Up |
| Slower | Arrow Down |
| Jump back | Arrow Left |
| Jump forward | Arrow Right |
| Restart | R |
| Exit | Escape |

Rebind any of them under **Settings → Remote & Bluetooth controls → Assign** — tap *Assign*,
press the button on your remote, done.

---

## Getting started

myPrompter is a static site — **no build tools, no `npm install`, no dependencies**. To clone
and run it locally you only need `git` and any static file server.

### 1. Clone

```bash
# HTTPS
git clone https://github.com/SonapSav/myPrompter.git

# …or SSH
git clone git@github.com:SonapSav/myPrompter.git
```

```bash
cd myPrompter
```

### 2. Serve it locally

Open the app through a **local web server** (opening `index.html` directly as a `file://`
disables the service worker and install prompt). Pick whichever server you already have —
this works the same on **Windows, macOS, and Linux**:

**Python 3** (pre-installed on most macOS/Linux systems)
```bash
# macOS / Linux
python3 -m http.server 3015

# Windows
py -m http.server 3015
```

**Node.js**
```bash
npx serve -l 3015
```

**PHP**
```bash
php -S localhost:3015
```

Then open **http://localhost:3015** in your browser.

> Any port works — `3015` is just the project’s convention. Chrome/Edge DevTools “device
> toolbar” is handy for previewing the mobile layout.

### 3. Install on a phone

Open the local URL (or your deployed URL) in the phone’s browser, then choose
**Add to Home Screen**. It installs like a native app and runs offline.

## Deploy your own (GitHub Pages)

Because it’s pure static files, hosting is free on GitHub Pages:

1. Push the project to your repository’s `main` branch.
2. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   choose `main` / `root`, and save.
3. Your app goes live at `https://<your-username>.github.io/<repo>/`.
4. Open that URL on your phone and **Add to Home Screen**.

Any other static host (Netlify, Vercel, Cloudflare Pages, an S3 bucket…) works too — just
serve the folder as-is.

## Data & privacy

- Scripts and settings are stored **locally in your browser** (`localStorage`) under the
  origin you run it on. Nothing is uploaded and there are no accounts.
- Because it’s device-local, use **Backup** (Library panel) to export all scripts to a JSON
  file, and **Restore** to bring them back — handy for moving to another device or before
  clearing browser data.

## How it works

No frameworks — just HTML, CSS, and a few small vanilla-JS modules:

```
index.html            App shell + all screens
css/styles.css        Dark, minimal theme
js/app.js             Wires the screens, settings, and prompter session together
js/scroller.js        requestAnimationFrame scroll engine
js/controls.js        Keyboard / Bluetooth key handling + learn-key
js/markup.js          Delivery-cue parser (safe, HTML-escaped)
js/library.js         localStorage script storage + backup/restore
js/settings.js        Persisted settings + key bindings
manifest.webmanifest  PWA metadata
service-worker.js     Offline caching (cache-first app shell)
icons/icon.svg        App icon
```

The service worker caches the app shell so it loads instantly and works offline; a cache
version bump ships updates to installed instances on next launch.

## Contributing

Issues and pull requests are welcome. There’s no build step — edit the files and reload a
local server. If you clone the repo and plan to commit, enable the project’s git hook once:

```bash
git config --local core.hooksPath .githooks
```

## Roadmap

- Two-device remote control (one phone drives another over WebRTC)
- Customizable cue colors and additional cue roles
- Press-and-hold seek for continuous scrubbing
- PNG icons for the crispest iOS home-screen icon
- Per-script speed / font presets

## License

[MIT](LICENSE) © Panos Vasilopoulos
