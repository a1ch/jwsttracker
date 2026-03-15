/**
 * JWST Tracker - Main Application
 * Fetches and displays JWST-related data
 */

const API_BASE = 'https://api.nasa.gov/planetary/apod';

// L2 is ~1.5 million km from Earth - approximate display
const JWST_APPROX_DISTANCE_KM = 1500000;

async function init() {
  updateDistanceDisplay();
  await fetchAPOD();
}

function updateDistanceDisplay() {
  const el = document.getElementById('dist-earth');
  if (el) {
    const millionKm = (JWST_APPROX_DISTANCE_KM / 1_000_000).toFixed(2);
    el.textContent = millionKm;
  }
}

async function fetchAPOD() {
  const loadingEl = document.getElementById('apod-loading');
  const contentEl = document.getElementById('apod-content');
  const errorEl = document.getElementById('apod-error');
  if (!loadingEl || !contentEl || !errorEl) return;

  try {
    const url = new URL(API_BASE);
    url.searchParams.set('api_key', typeof CONFIG !== 'undefined' ? CONFIG.nasaApiKey : 'DEMO_KEY');

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.msg || `HTTP ${res.status}`);
    }

    // Handle video APODs - use thumbnail or skip image
    const mediaType = data.media_type || 'image';
    const imgEl = document.getElementById('apod-image');

    if (mediaType === 'video') {
      imgEl.src = data.thumbnail_url || '';
      imgEl.alt = data.title || 'Video thumbnail';
    } else {
      imgEl.src = data.url || data.hdurl || '';
      imgEl.alt = data.title || 'Astronomy Picture of the Day';
    }

    document.getElementById('apod-title').textContent = data.title || 'Astronomy Picture of the Day';
    document.getElementById('apod-explanation').textContent = data.explanation || '';
    document.getElementById('apod-date').textContent = data.date || '';
    document.getElementById('apod-link').href = data.url || 'https://apod.nasa.gov/';

    loadingEl.style.display = 'none';
    errorEl.style.display = 'none';
    contentEl.style.display = 'grid';
  } catch (err) {
    console.error('APOD fetch error:', err);
    loadingEl.style.display = 'none';
    contentEl.style.display = 'none';
    errorEl.style.display = 'block';
  }
}

init();
