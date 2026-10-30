# ABANDONED, BUT NOT FORGOTTEN & RED HORIZON
### Unified Interactive Historical Space Exploration Storybook (Mars + Moon)

[![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-success.svg)](#)
[![Hosting: Cloudflare Pages / GitHub Pages](https://img.shields.io/badge/Hosting-Cloudflare%20Pages%20%7C%20GitHub%20Pages-blue.svg)](#)
[![License: Open Source Code / Separate Media Terms](https://img.shields.io/badge/License-Dual%20Attribution-informational.svg)](#licensing-and-intellectual-property)
[![Zero External Dependencies](https://img.shields.io/badge/Dependencies-0%20(Pure%20Vanilla%20Web)-brightgreen.svg)](#technology-stack)

**Abandoned, But Not Forgotten** & **Red Horizon: The Mars Chronicles** is an interactive, historically grounded, dual-experience space exploration storybook. It presents the technical feats, human emotions, hardware challenges, and scientific discoveries of humanity's lunar and Martian exploration missions across the 20th and 21st centuries.

Built entirely with standard vanilla web technologies (HTML5, CSS3, Vanilla JavaScript ES6+), it executes 100% client-side in modern web browsers without requiring external frameworks, third-party CDNs, database backends, paid API keys, build steps, or subscriptions.

---

## 📖 Table of Contents
1. [Project Overview & Key Features](#-project-overview--key-features)
2. [Dual Story Experiences (Mars & Moon)](#-dual-story-experiences-mars--moon)
3. [Folder & File Structure](#-folder--file-structure)
4. [How to Run the Website Locally](#-how-to-run-the-website-locally)
5. [How to Deploy to Cloudflare Pages (Recommended)](#-how-to-deploy-to-cloudflare-pages-recommended)
6. [How to Deploy to GitHub Pages](#-how-to-deploy-to-github-pages)
7. [AI-Generated Media Disclosure & Transparency](#-ai-generated-media-disclosure--transparency)
8. [Historical & Scientific Mission Sources](#-historical--scientific-mission-sources)
9. [Technology Stack & System Requirements](#-technology-stack--system-requirements)
10. [Licensing & Intellectual Property](#-licensing--intellectual-property)

---

## 🌌 Project Overview & Key Features

* **Cinematic Opening Gateway:** Welcomes readers with an interactive story selection interface, allowing one-click selection of either Mars or the Moon, preferred language (English or Hindi), and reading mode.
* **Dual-Language Client-Side Narration:**
  * **English (EN):** Natural, articulate spoken delivery with balanced acoustic pitch and rhythm.
  * **Hindi (हिन्दी):** Fluent, grammatically accurate translations incorporating formal scientific and space terminology (e.g., सैटर्न V, अपोलो 11, मंगलयान, रोवर, लैंडर).
* **Narration Voice Pack Selector:** Browse and select from all natural voices installed on your system/browser (e.g., Microsoft Natural voices on Edge/Windows, Google voices on Chrome, Apple voices on Safari).
* **Continuous Automatic & Manual Modes:**
  * **Auto Mode:** Automatically sequences through passages, synchronized videos, and scenes continuously.
  * **Manual Mode:** Gives readers full control to inspect artwork, reread dialogue, and explore interactive dossiers at their own pace.
* **Intelligent Audio & Video Synchronization:**
  * Clips with authentic mission audio automatically pause text-to-speech synthesis and display an on-screen audio status badge (`🔊 Original Video Audio Playing`).
  * Clips categorized for narration overlay allow spoken narration to continue playing over the video.
* **Synchronized Bilingual Subtitles:** Real-time captioning overlay synchronized with spoken narration, with user-selectable font sizing (Small, Medium, Large, Extra Large) in Settings.
* **Educational Hotspot Dossiers:** Interactive points of interest overlaid onto artwork revealing mechanical schematics, mission telemetry, and historical context.
* **Independent State Persistence:** Preserves user chapter progress, audio rate, subtitle size, narrator voice, and language preference independently in browser `localStorage`.

---

## 🚀 Dual Story Experiences (Mars & Moon)

### Story 1: Red Horizon — The Mars Chronicles
* **Subtitle:** *From First Attempts to the Search for Ancient Life*
* **Historical Scope:** 1960 to the present day.
* **Structure:** 6 Chronological Chapters + Epilogue (*The Footprints We Leave Behind*):
  1. **Chapter 1: The Blind Leap** (Soviet Mars Probes | 1960–1965)
  2. **Chapter 2: Touchdown on the Red Planet** (Viking 1 & Viking 2 | 1976–1982)
  3. **Chapter 3: Wheels on Dust** (Sojourner, Spirit & Opportunity | 1997–2019)
  4. **Chapter 4: The Climate Detectives** (Phoenix & InSight | 2008–2022)
  5. **Chapter 5: India's Orbital Triumph** (Mangalyaan: Mars Orbiter Mission | 2013–2022)
  6. **Chapter 6: The Modern Frontier** (Curiosity, Perseverance & Ingenuity | 2012–2026)
  7. **Epilogue:** *The Footprints We Leave Behind*
* **Metrics:** 37 Scenes, 218 Passages, 18 Video Animations, 37 Interactive Dossiers.

### Story 2: Abandoned, But Not Forgotten (The Moon Story)
* **Subtitle:** *The Stories of Humanity's Forgotten Space Equipment*
* **Historical Scope:** 1960s Apollo era through modern Artemis and international lunar science.
* **Structure:** 7 Chronological Chapters + Final Scene (*A Small Blue World*):
  1. **Chapter 1: The Apollo Tests** (Before the Moon Became a Destination)
  2. **Chapter 2: The First Footprints** (Apollo 11)
  3. **Chapter 3: Exploring the Surface** (Apollo 14 & Apollo 15)
  4. **Chapter 4: Beyond the Landings** (Apollo Lunar Surface Experiments Package ALSEP | 1969–1977)
  5. **Chapter 5: Orbiting Echoes** (Lunar Reconnaissance Orbiter | 2009–present)
  6. **Chapter 6: The Modern Frontier** (Artemis & International Lunar Exploration)
  7. **Chapter 7: Legacy Left Behind** (From Apollo 11 to the Future)
  8. **Final Scene:** *A Small Blue World*
* **Metrics:** 45 Scenes, 268 Passages, 24 Video Animations, 45 Interactive Dossiers.

---

## 📁 Folder & File Structure

This folder (`UPLOADING`) represents the standalone, public-ready production website:

```text
UPLOADING/
│
├── index.html                     # MAIN ENTRY POINT: Launches the entire website
├── README.md                      # This beginner-friendly deployment and user guide
├── .gitignore                     # Git ignore rules for system artifacts
├── .nojekyll                      # Disables Jekyll processing on GitHub Pages
├── _headers                       # Cloudflare Pages caching and security headers
│
├── css/
│   └── style.css                  # Responsive design, themes, animations, layouts
│
├── js/
│   ├── app.js                     # Main application controller, UI, HUD, state persistence
│   ├── narration.js               # Web Speech API speech synthesis & voice pack calibration
│   ├── mars-story-data.js         # Complete Mars story script, passages, media & dossiers
│   ├── moon-story-data.js         # Complete Moon story script, passages, media & dossiers
│   └── story-data.js              # Runtime story data bridge
│
└── assets/
    └── images/
        ├── mars images/           # All 239 Mars illustrations and MP4 animations
        └── moon images/           # All 287 Moon illustrations and MP4 animations
```

---

## 🖥️ How to Run the Website Locally

Because this website is 100% static, you do not need complex web servers or package managers. Simply serve the folder using any local HTTP server:

### Option 1: Using Python (Recommended — Pre-installed on most systems)
1. Open your terminal or command prompt in this folder (`UPLOADING`).
2. Run:
   ```bash
   python -m http.server 8080
   ```
3. Open your browser and navigate to:
   ```text
   http://localhost:8080
   ```

### Option 2: Using Node.js (npx serve)
1. Open your terminal in this folder (`UPLOADING`).
2. Run:
   ```bash
   npx serve .
   ```
3. Open the URL shown in your terminal (usually `http://localhost:3000`).

### Option 3: Using VS Code Live Server
1. Open the `UPLOADING` folder in VS Code.
2. Install the **Live Server** extension by Ritwick Dey.
3. Right-click `index.html` and click **"Open with Live Server"**.

---

## ☁️ How to Deploy to Cloudflare Pages (Recommended)

Cloudflare Pages provides free hosting with unlimited bandwidth and edge CDN distribution.

### Step-by-Step Instructions:
1. **Push your code to GitHub:**
   - Create a new repository on GitHub (e.g., `space-exploration-storybook`).
   - Upload the files from inside this `UPLOADING` folder to the repository root.
   - Commit and push to `main`.
2. **Log in to Cloudflare:**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com/) and sign in.
   - In the left sidebar, click **Compute (Workers & Pages)** > **Pages**.
3. **Connect to GitHub:**
   - Click **Create application** > **Pages** > **Connect to Git**.
   - Select your GitHub repository.
4. **Configure Deployment Settings:**
   * **Framework preset:** `None`
   * **Build command:** *(Leave completely blank)*
   * **Build output directory:** `.` (or `/` — project root)
   * **Root directory:** `/`
   * **Environment variables:** *None required*
5. **Deploy:**
   - Click **Save and Deploy**.
   - In about 30 seconds, your site will be live at a free `*.pages.dev` domain!

---

## 🐙 How to Deploy to GitHub Pages

GitHub Pages is also completely free and hosted directly from your GitHub repository.

### Step-by-Step Instructions:
1. Push all files inside `UPLOADING` to your GitHub repository `main` branch.
2. In your GitHub repository, click on **Settings** (top tab bar).
3. In the left navigation, click **Pages**.
4. Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
5. Under **Branch**, select `main` and folder `/(root)`, then click **Save**.
6. Wait 1–2 minutes. GitHub Pages will display your published URL (e.g., `https://<username>.github.io/<repository-name>/`).

> **Note:** The `.nojekyll` file included in this directory ensures GitHub Pages serves all assets and folders without ignoring files with spaces or special characters.

---

## 🎨 AI-Generated Media Disclosure & Transparency

### Origin of Visual & Video Assets
All visual illustrations and animated video clips featured in this project were generated by the project creator using **Google Gemini AI**. They were created specifically as narrative storytelling elements to illustrate the emotional and technical journey of humanity's lunar and Martian space missions.

### Authenticity & Attribution Clarification
* **Artistic Reconstructions:** These visual media are artistic representations and should **not** be interpreted as authentic archival photographs, original mission footage, or official camera releases from space agencies.
* **Agency Independence:** NASA, ISRO, ESA, and Roscosmos are mentioned strictly for educational and historical documentation. **These space agencies did not create, sponsor, approve, or endorse the AI-generated illustrations or videos featured in this project.**
* **Historical Grounding:** While the visual scenes are AI-rendered interpretations, the missions, spacecraft designs, landing sites, launch timelines, scientific instruments, and historical outcomes depicted in the story are grounded in verified historical space exploration records.

---

## 📚 Historical & Scientific Mission Sources

The educational narrative, mission timelines, technical dossiers, and equipment descriptions in this project were developed using publicly available historical mission archives and open scientific documentation, including:
1. **NASA Apollo Lunar Surface Journal (ALSJ):** Mission transcripts, EVA logs, and ALSEP deployment data ([history.nasa.gov/alsj](https://history.nasa.gov/alsj/)).
2. **NASA Mars Exploration Program:** Scientific mission archives for Viking 1 & 2, Pathfinder, Spirit & Opportunity, Phoenix, InSight, Curiosity, and Perseverance ([mars.nasa.gov](https://mars.nasa.gov/)).
3. **NASA Lunar Reconnaissance Orbiter (LRO):** Surface documentation of Apollo landing sites ([lunar.gsfc.nasa.gov](https://lunar.gsfc.nasa.gov/)).
4. **ISRO Mars Orbiter Mission (MOM / Mangalyaan):** Orbital telemetry and science instrumentation archives ([isro.gov.in](https://www.isro.gov.in/)).
5. **NASA Space Science Data Coordinated Archive (NSSDCA):** Spacecraft data for early Soviet Mars probes and Mariner missions ([nssdc.gsfc.nasa.gov](https://nssdc.gsfc.nasa.gov/)).

---

## 💻 Technology Stack & System Requirements

* **Markup & Semantics:** HTML5 (semantic layout, ARIA accessibility landmarks, custom dialogs).
* **Styling & Presentation:** Vanilla CSS3 (CSS Variables, Flexbox, CSS Grid, Ken Burns animation effects, responsive typography).
* **Application Architecture:** Vanilla JavaScript ES6+ (modular design, state preservation in `localStorage`).
* **Speech Synthesis Engine:** Standard W3C Web Speech API (`window.speechSynthesis`).
* **External Dependencies:** **0 npm packages, 0 CDN bundles, 0 external trackers.**
* **Server Requirements:** Pure static web host (no Node.js, Python, PHP, or database required in production).
* **Browser Compatibility:** Google Chrome, Microsoft Edge, Mozilla Firefox, Apple Safari (desktop and mobile).

---

## ⚖️ Licensing & Intellectual Property

* **Application Source Code:** Distributed under the open-source MIT License.
* **Visual & Video Assets:** Created with Google Gemini under Google Terms of Service for educational storytelling. Commercial reuse of the AI imagery should adhere to Google's terms and applicable jurisdictions.
