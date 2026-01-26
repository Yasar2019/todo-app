# Pro Todo — Modern 3D Todo App

A professional, minimal todo app with a tasteful 3D tilt UI, built with plain HTML/CSS/JS. Add tasks, see them listed, and delete with a click. Tasks persist in `localStorage`.

## Features
- Modern 3D tilt card with dynamic glare
- Add todos via input + button or Enter
- Toggle completion per item (checkbox-like)
- Filter by All / Active / Completed (segmented control)
- Clean list with per-item delete buttons
- Lightweight, accessible, and responsive
- Persists todos and selected filter locally

## Run
The app is static — just open `index.html`.

### Windows (PowerShell)
```powershell
Start-Process "c:\Users\Asus\todo-app\index.html"
```

### Optional: local server
If you have Python:
```bash
cd c:\Users\Asus\todo-app
python -m http.server 5500
```
Then visit http://localhost:5500 in your browser.
