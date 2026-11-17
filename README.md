# XR Smart Learning

An interactive Augmented Reality (AR), 3D visualization, Virtual Classroom, and Learning Management prototype built with React, TypeScript, Vite, Tailwind CSS, Three.js, and Recharts for Malaysian secondary schools and universities.

- **Public GitHub Pages URL**: `https://kuuhakuxyz.github.io/XR-Smart-Learning/`
- **Repository**: `https://github.com/kuuhakuxyz/XR-Smart-Learning`

## Core Features

1. **AR 3D Learning Materials** — Seven interactive multi-part Three.js models (*Human Heart*, *Human Skeleton*, *Human Cell*, *Water Molecule*, *Atomic Structure*, *Solar System*, *Earth's Layers*) with exploded view, clickable labels, live HTTPS webcam AR overlay (`getUserMedia`), and a simulated study desk AR fallback mode.
2. **Virtual Classrooms** — Three navigable 3D environments (*Human Anatomy Laboratory*, *Solar System Exploration*, *Earth & Environmental Science*) with interactive learning stations and smooth camera transitions.
3. **Interactive Learning Activities** — Multiple-choice quizzes and drag-and-drop / tap-to-match challenges with instant feedback, answer explanations, and score calculation.
4. **Learning Progress Tracking** — Dynamic completion percentages, weekly study & subject performance Recharts visualizations, achievement badges, and `localStorage` persistence.
5. **Online Learning Management System (LMS)** — Separate Student and Teacher workspaces for assigned lessons, coursework submission, grading, material publishing, and quiz creation.

---

## 1. Install Dependencies

Ensure Node.js 18+ (recommended Node 20) and npm are installed:

```bash
npm install
```

## 2. Run Locally

Start the Vite development server:

```bash
npm run dev
```

Because `vite.config.ts` sets `base: '/XR-Smart-Learning/'` for GitHub Pages compatibility, open:

- `http://localhost:3000/XR-Smart-Learning/` (visiting `http://localhost:3000/` redirects automatically during local dev)

## 3. Build the Production Version

Typecheck and generate the optimized static bundle inside `dist/`:

```bash
npm run lint
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

Then open `http://localhost:4173/XR-Smart-Learning/`.

## 4. Deploy Using GitHub Actions

This repository includes `.github/workflows/deploy.yml`, which automatically builds and deploys `dist/` whenever commits are pushed to the `main` branch (or manually via **Actions → Deploy XR Smart Learning to GitHub Pages → Run workflow**).

```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

## 5. Enable GitHub Pages in Repository Settings

1. Open your repository on GitHub: `https://github.com/kuuhakuxyz/XR-Smart-Learning`.
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Wait for the **Deploy XR Smart Learning to GitHub Pages** workflow in the **Actions** tab to finish with a green checkmark.
5. Visit `https://kuuhakuxyz.github.io/XR-Smart-Learning/`.

> **Note on HTTPS & Camera AR**: GitHub Pages serves over HTTPS by default, enabling browser camera access (`navigator.mediaDevices.getUserMedia`) on supported devices. If camera permission is declined or unavailable, the AR Viewer automatically provides the Simulated Study Desk AR fallback mode.
