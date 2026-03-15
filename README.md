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

## Data Sources

- [NASA Open APIs](https://api.nasa.gov/) — Astronomy Picture of the Day
- [JWST at NASA](https://webb.nasa.gov/) — Mission info
- [WebbTelescope.org](https://webbtelescope.org/) — Science & images
