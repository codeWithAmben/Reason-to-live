# Reasons to Live

A tiny, heartfelt slideshow that celebrates the small, meaningful moments that make life beautiful.

This project is a simple, elegant site that pairs cinematic background images with a soft, calming piano track—designed to gently remind you of life’s tiny, meaningful moments.

## ✨ Why this exists

We wanted a calm, minimal experience that encourages reflection and gratitude. The slideshow is intentionally slow and meditative, pairing imagery with a soft piano track so you can pause and appreciate the small things.

## 🎯 Key features

- A slow slideshow with contemplative images and short descriptors.
- Background audio that starts at a specific time (skips the first 5 seconds) to provide a soft, immediate mood.
- Responsive images: local assets for the first slide and responsive loading for remote images via `srcset`.
- Mobile-friendly design with a rotate hint overlay for portrait phones to encourage optimal viewing.
- Simple controls: manual pause/play (Sound On / Sound Off) and Replay.

## 🛠️ How to run

This site is static — no build or install required. Simply open the file in the browser:

- Double-click `index.html` or open it with your browser.

For a better development environment, you can use a static server such as `live-server` or any simple HTTP server.

On Windows using PowerShell, run:

```powershell
npm install -g live-server
live-server .
```

Then open the page served at the address displayed by `live-server`.

## 🔍 Quick test checklist

- Start the page: click the landing area (“Tell me a reason to live?”).
- Audio behavior:
  - The audio will start from the 5-second mark as part of the user gesture.
  - If the browser blocks autoplay, the audio button will show "Sound On" so the user can enable sound manually.
- Responsive images:
  - The first slide uses a local `sunset.png` and is responsive.
  - Remote images use `srcset` to deliver smaller images to mobile devices.
- Rotate hint (mobile):
  - On small portrait screens, a rotate overlay should appear suggesting landscape for better viewing.
  - Dismiss the overlay using “Continue anyway” and it will not reappear for the session.

## 🧩 Dev tips & debugging

- Clear the rotate overlay from the current session in your browser dev console:

```js
sessionStorage.removeItem('rotateDismissed');
// or use the helper in the page:
window.__resetRotateHint();
```

- If you want to force the rotate overlay (for testing), append `?showRotate=1` to the URL.

- If the audio sounds low-quality, try playing `sailor.mp3` locally (double-click the file).
  - If it sounds poor in a player like VLC or Windows Media Player, the file itself may be low bitrate.
  - If it sounds good locally but poor in the browser, we try to wait for `canplaythrough` before playback to ensure enough data has loaded.

## 🧮 Accessibility & friendly tips

- Overlay uses `role="dialog"` and `aria-live` to provide better accessibility.
- The UI respects the browser's autoplay rules and prompts the user when needed.

## 🤝 Contributing

If you want to improve the site or add extra slides:

- Add the image and description to the `slides` array in `index.html`.
- Prefer responsive sizes or a `srcset` for remote images (examples are included).
- If you add additional audio tracks, use high-quality (320kbps) MP3s or consider `webm/ogg` for better compression.

## 🎁 Inspiration & note

This project is a gentle reminder — take a breath, watch a moment, listen to a note. Life’s reasons don’t always arrive as headlines; they’re small — a sunset, a cup of coffee, a hand you hold. Be kind and keep going.

---

Made with calm in mind. 🌅
