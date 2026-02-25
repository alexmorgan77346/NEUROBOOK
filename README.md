# 𝑁 NeuroBook — Mind Architecture Notebook

A modern, offline-capable **Progressive Web App (PWA)** for learning and annotating cognitive architecture. Built as a notebook you can install on any device.

![NeuroBook Preview](icons/icon-512.png)

---

## ✨ Features

- **5 Themes** — Void, Arctic, Ember, Mint, Noir
- **EN / हिंदी** language toggle
- **Collapsible sidebar** with toggle button
- **Add, Edit, Rename, Delete** modules
- **Card grid editing** — Edit/Save/Delete individual cards per module
- **Add new cards** to any module
- **Auto-save** to `localStorage` — your data persists across sessions
- **PDF export** per module
- **Installable PWA** — works offline after first load
- 10 built-in modules covering the full 5-System Cognitive Architecture

---

## 🚀 Deploy to GitHub Pages

### Step 1 — Create a GitHub repo

```bash
git init
git add .
git commit -m "Initial commit: NeuroBook PWA"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/neurobook.git
git push -u origin main
```

### Step 2 — Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / `/ (root)`
4. Click **Save**

Your app will be live at:
```
https://YOUR_USERNAME.github.io/neurobook/
```

> ⚠️ **Important:** Update `manifest.json` → `"start_url"` to match your GitHub Pages path:
> ```json
> "start_url": "/neurobook/index.html"
> ```

---

## 📱 Install as PWA

### On Android (Chrome)
1. Open the GitHub Pages URL in Chrome
2. Tap the **⋮ menu** → **Add to Home screen**
3. Tap **Install**

### On iOS (Safari)
1. Open the URL in Safari
2. Tap the **Share** button (□↑)
3. Tap **Add to Home Screen**

### On Desktop (Chrome/Edge)
1. Open the URL
2. Click the **install icon** (⊕) in the address bar
3. Click **Install**

---

## 📁 File Structure

```
neurobook/
├── index.html        ← Main app shell
├── style.css         ← All styles + themes
├── app.js            ← Full application logic + data
├── sw.js             ← Service Worker (offline support)
├── manifest.json     ← PWA manifest
├── README.md         ← This file
└── icons/
    ├── icon-192.png  ← PWA icon (192×192)
    └── icon-512.png  ← PWA icon (512×512)
```

---

## 💾 Data Persistence

All data is saved automatically to **localStorage** after every change:
- Module list and all content
- Card edits
- Language preference
- Theme preference
- Sidebar state

To reset all data, open browser DevTools → Application → Local Storage → Clear.

---

## 🛠 Local Development

No build step required. Just open `index.html` in a browser, or serve with any static file server:

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .

# VS Code
# Use the Live Server extension
```

---

## 📄 License

MIT — free to use, modify, and distribute.
