# Pixhaven - Image Editing & Organization Platform

## Tentang Pixhaven

Pixhaven adalah sebuah platform web app editing dan organisasi foto yang modern dan user-friendly, dibangun dengan HTML5, CSS3, dan Vanilla JavaScript. Platform ini menyediakan berbagai fitur editing canggih seperti Color Curves editor dengan 4-channel RGB control, 10-adjustment sliders (exposure, contrast, saturation, dll), LUTS template library, dan Photo Sorter untuk manajemen file—semuanya diproses langsung di browser menggunakan Canvas API tanpa perlu backend server. Selain editing, Pixhaven juga dilengkapi dengan sistem kalender terintegrasi, inbox reminder, galeri shared items dengan lightbox viewer, dan project management yang intuitif, dengan semua data tersimpan lokal di browser menggunakan localStorage, menjadikannya aplikasi yang dapat berjalan fully offline dengan interface yang responsif dan user experience yang seamless.

---

## Fitur-Fitur Tersedia

| # | Fitur | Deskripsi |
|---|-------|-----------|
| 1 | **Color Curves Editor** | Interactive curve drawing dengan 4-channel control (All, Red, Green, Blue), cubic spline interpolation, save/load preset, dan export PNG |
| 2 | **Adjustment Editor** | 10 adjustment sliders (Exposure, Contrast, Saturation, Tint, Temperature, Sharpen, Highlight, Shadow, Black, White), real-time preview, save/load configuration |
| 3 | **LUTS Templates** | Project-specific LUTS editor untuk 3 template library (Arry, Azalea, Siska) dengan import/export functionality |
| 4 | **Project Management** | Project cards grid dengan thumbnail, project-specific editors untuk adjustment dan LUTS |
| 5 | **Calendar Manager** | 42-hari calendar grid, event creation/management, real-time event tracking dengan has-event indicator |
| 6 | **Inbox Reminders** | Automatic calendar event sync, reminder list, delete functionality, time-ago calculation |
| 7 | **Photo Sorter** | Folder picker, dynamic folder creation, soft delete, file selection persist, breadcrumb navigation |
| 8 | **Shared Gallery** | Lightbox viewer dengan zoom/pan/drag support, mouse wheel zoom, touch support, ESC close |
| 9 | **Settings Page** | Theme toggle (Light/Dark), account settings, notification preferences, privacy options |
| 10 | **Trash Management** | Sampah page dengan restore/empty functionality |
| 11 | **Changelog Modal** | Project changelog popup dengan smooth animations |

---

## Platform Information

### Web-Based (Tanpa Instalasi)

Pixhaven adalah **web application pure** yang berjalan 100% di browser:
- ✅ **Tidak perlu instalasi** - Cukup buka file `index.html` di browser
- ✅ **Offline-friendly** - Semua proses editing dilakukan client-side, data tersimpan di localStorage
- ✅ **Cross-platform** - Kompatibel dengan Windows, macOS, Linux (semua browser modern)
- ✅ **Lightweight** - Tidak ada server backend atau dependency berat
- ✅ **Fast Performance** - Canvas API untuk real-time image processing

### Cara Membuka:
1. Buka file `index.html` langsung di browser
2. Atau jalankan local server: `python -m http.server 8000` (jika perlu)
3. Akses melalui `http://localhost:8000` atau `file:///path/to/index.html`

---

## Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Image Processing** | Canvas API, ImageData API |
| **Storage** | Browser localStorage (client-side) |
| **Icons** | Bootstrap Icons 1.11.3 |
| **Typography** | Google Fonts (Sora, Albert Sans) |

---

## External Dependencies

### CDN Resources

| Resource | Source | Fungsi |
|----------|--------|--------|
| **Bootstrap Icons** | `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css` | Icon library untuk UI elements |
| **Google Fonts (Sora)** | `https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700` | Font heading modern |
| **Google Fonts (Albert Sans)** | `https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;600` | Font body clean |

### Local Assets
- ✅ Semua CSS custom di folder `css/`
- ✅ Semua JavaScript custom di folder `js/`
- ✅ Semua images di folder `assets/images/`
- ✅ Tidak ada external API atau backend calls

---

## Bahasa & Format

| Aspek | Spesifikasi |
|-------|-------------|
| **HTML** | HTML5 (semantic markup) |
| **CSS** | CSS3 (flexbox, grid, animations) |
| **JavaScript** | Vanilla JS ES6+ (no frameworks) |
| **Data Format** | JSON (via localStorage) |
| **Image Format** | PNG (export), JPG (import) |
| **Language** | Indonesian (Bahasa Indonesia) |

---

## Browser Compatibility

- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

**Requirement:** Browser dengan support Canvas API dan localStorage

---

## Notes

- Semua data tersimpan lokal di browser, tidak ada cloud sync
- Project fully functional tanpa internet connection (kecuali saat pertama kali load CDN resources)
- File sizes kecil - loading time sangat cepat
- Responsive design - works on desktop dan tablet
