# JWST Tracker

A web app that displays James Webb Space Telescope stats, instruments, and NASA's Astronomy Picture of the Day—often featuring JWST discoveries.

## Features

- **Mission stats** — Distance from Earth, orbit (L2), mirror size, instruments
- **Science instruments** — NIRCam, NIRSpec, MIRI, NIRISS, FGS
- **Astronomy Picture of the Day** — Live from NASA APOD API
- **Key milestones** — Launch, L2 arrival, first images
- **Technical specs** — Mirror, sunshield, wavelength range, partners

## Quick Start

1. **Run locally** (use a local server so the NASA API works properly):
   ```bash
   npx serve .
   ```
   Or with Python: `python -m http.server 8000`

2. Open `http://localhost:3000` (or `http://localhost:8000` with Python)

## Optional: NASA API Key

The app uses NASA's APOD API. A demo key works for light use but has rate limits (30 req/hour). For higher limits:

1. Get a free key at [api.nasa.gov](https://api.nasa.gov/)
2. Edit `config.js` and set `nasaApiKey: 'YOUR_KEY'`

## Deploy to GitHub Pages

1. Create a new repo on [GitHub](https://github.com/new) (e.g. `jwst-tracker`).
2. Push this project:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/jwst-tracker.git
   git branch -M main
   git push -u origin main
   ```
3. In the repo: **Settings → Pages** → Source: **Deploy from a branch**
4. Branch: **main**, folder: **/ (root)** → Save
5. After 1–2 minutes, your site will be at `https://YOUR_USERNAME.github.io/jwst-tracker/`

## Data Sources

- [NASA Open APIs](https://api.nasa.gov/) — Astronomy Picture of the Day
- [JWST at NASA](https://webb.nasa.gov/) — Mission info
- [WebbTelescope.org](https://webbtelescope.org/) — Science & images
