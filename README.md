# myPrompter

A clean, minimal **teleprompter** you run from your phone's browser — installable as an offline app (PWA). No accounts, no server, nothing leaves your device.

## Features (v0.1)

- **Smooth scrolling** with adjustable speed, font size, line spacing, and margins
- **Play / pause / restart**, optional 3-2-1 countdown, and a reading guide line
- **Mirror mode** — flip horizontally for beam-splitter rigs, or flip vertically
- **Script library** saved on your device, with **backup / restore** to a file and **.txt import**
- **Keeps the screen awake** while you read
- **Bluetooth remote / pedal support** — bind any button (they act as keyboards). Tap *Assign* in Settings, press the button, done
- **Installable & offline** — "Add to Home Screen" and it works with no connection

## Try it locally

Because it's a PWA, open it through a local web server (not `file://`) so the service worker and manifest work:

```bash
# from the project folder — any static server works:
python -m http.server 8080
#   then visit  http://localhost:8080
```

## Publish to GitHub Pages

1. Create a repo (e.g. `myprompter`) and push these files to the `main` branch.
2. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, pick `main` / `root`, save.
3. Your app is live at `https://<your-username>.github.io/myprompter/`.
4. On your phone, open that URL and choose **Add to Home Screen**.

## Bluetooth remotes

Most teleprompter pedals/remotes pair as a **Bluetooth keyboard** and send keystrokes
(arrows, Page Up/Down, space, volume). myPrompter listens for those keys, so it works on
both iOS and Android. Default bindings:

| Action        | Key        |
|---------------|------------|
| Play / Pause  | Space      |
| Faster        | Arrow Up   |
| Slower        | Arrow Down |
| Restart       | R          |
| Exit          | Escape     |

Rebind any of them under **Settings → Remote & Bluetooth controls → Assign**.

## Project structure

```
index.html            App shell + all screens
css/styles.css        Dark minimal theme
js/settings.js        Persisted settings + key bindings
js/library.js         localStorage script storage
js/scroller.js        requestAnimationFrame scroll engine
js/controls.js        Keyboard / Bluetooth key handling
js/app.js             Wires it all together
manifest.webmanifest  PWA metadata
service-worker.js     Offline caching
icons/icon.svg        App icon
```

## Roadmap

- Two-device remote control (one phone drives another over WebRTC)
- PNG icons for the crispest iOS home-screen icon
- Per-script speed/font presets
