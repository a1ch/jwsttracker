/**
 * Solar system diagram - positions update for selected date (daily/live).
 * Uses simplified Keplerian orbits; ecliptic plane view.
 */

(function () {
  'use strict';

  // J2000 = Jan 1, 2000 12:00 TT (approximate as UTC for simplicity)
  var J2000_MS = new Date('2000-01-01T12:00:00Z').getTime();

  // Planets: { name, a_AU, period_days, lon_J2000_deg, color, radius_px }
  var PLANETS = [
    { name: 'Mercury', a: 0.387, T: 87.969, L0: 252.25, color: '#b5b5b5', r: 4 },
    { name: 'Venus', a: 0.723, T: 224.701, L0: 181.98, color: '#e6c229', r: 6 },
    { name: 'Earth', a: 1.0, T: 365.256, L0: 100.46, color: '#6b93d6', r: 6 },
    { name: 'Mars', a: 1.524, T: 686.98, L0: 355.43, color: '#c1440e', r: 5 },
    { name: 'Jupiter', a: 5.203, T: 4332.59, L0: 34.33, color: '#d8ca9d', r: 12 },
    { name: 'Saturn', a: 9.537, T: 10759.2, L0: 50.08, color: '#f4d59e', r: 10 },
    { name: 'Uranus', a: 19.19, T: 30687, L0: 314.2, color: '#d1e7e7', r: 7 },
    { name: 'Neptune', a: 30.07, T: 60190, L0: 304.22, color: '#5b5ddf', r: 7 }
  ];

  // JWST at Sun-Earth L2: ~1.01 AU from Sun, same angle as Earth (trailing Earth)
  var JWST_L2_AU = 1.01;

  function daysSinceJ2000(date) {
    return (date.getTime() - J2000_MS) / (24 * 60 * 60 * 1000);
  }

  function longitudeAtDate(a_AU, T_days, L0_deg, date) {
    var days = daysSinceJ2000(date);
    var deg = (L0_deg + (360 * days) / T_days) % 360;
    if (deg < 0) deg += 360;
    return (deg * Math.PI) / 180;
  }

  function positionAU(angleRad, a_AU) {
    return { x: a_AU * Math.cos(angleRad), y: a_AU * Math.sin(angleRad) };
  }

  function getPlanetPositions(date) {
    var out = [];
    PLANETS.forEach(function (p) {
      var lon = longitudeAtDate(p.a, p.T, p.L0, date);
      out.push({
        name: p.name,
        pos: positionAU(lon, p.a),
        color: p.color,
        r: p.r
      });
    });
    return out;
  }

  function getJWSTPosition(date, earthPos) {
    var angle = Math.atan2(earthPos.y, earthPos.x);
    var pos = positionAU(angle, JWST_L2_AU);
    return { name: 'JWST', pos: pos, color: '#e8c547', r: 8 };
  }

  var canvas, ctx, scale, cx, cy, dateInput, timeLabel, useLiveCheckbox;
  var zoomLevel = 1;
  var MIN_ZOOM = 0.25;
  var MAX_ZOOM = 8;
  var ZOOM_STEP = 1.15;

  function getScaleAndCenter() {
    var w = canvas.width;
    var h = canvas.height;
    cx = w / 2;
    cy = h / 2;
    var maxAU = 32;
    var baseScale = Math.min(w, h) * 0.45 / maxAU;
    scale = baseScale * zoomLevel;
  }

  function setZoom(newZoom) {
    zoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    if (window.solarZoomLabel) window.solarZoomLabel.textContent = Math.round(zoomLevel * 100) + '%';
  }

  function toScreen(au) {
    return { x: cx + au.x * scale, y: cy - au.y * scale };
  }

  function drawOrbits() {
    ctx.strokeStyle = 'rgba(120, 100, 200, 0.2)';
    ctx.lineWidth = 1;
    PLANETS.forEach(function (p) {
      ctx.beginPath();
      for (var i = 0; i <= 100; i++) {
        var t = (i / 100) * 2 * Math.PI;
        var pos = positionAU(t, p.a);
        var s = toScreen(pos);
        if (i === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
      }
      ctx.closePath();
      ctx.stroke();
    });
    // L2 orbit hint (small circle near Earth)
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    for (var j = 0; j <= 50; j++) {
      var t = (j / 50) * 2 * Math.PI;
      var p = positionAU(t, JWST_L2_AU);
      var s = toScreen(p);
      if (j === 0) ctx.moveTo(s.x, s.y);
      else ctx.lineTo(s.x, s.y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawSun() {
    var r = 16;
    var g = ctx.createRadialGradient(cx - 5, cy - 5, 0, cx, cy, r);
    g.addColorStop(0, '#fff8c4');
    g.addColorStop(0.5, '#ffe066');
    g.addColorStop(1, '#e8b020');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#e8e6f0';
    ctx.font = '11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sun', cx, cy + r + 14);
  }

  function drawBody(screenPos, color, r, label) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    if (label) {
      ctx.fillStyle = '#a0a0b8';
      ctx.font = '10px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, screenPos.x, screenPos.y + r + 12);
    }
  }

  function drawJWST(screenPos) {
    var r = 8;
    ctx.fillStyle = '#e8c547';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e8e6f0';
    ctx.font = 'bold 11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('JWST', screenPos.x, screenPos.y + r + 14);
  }

  function drawDiagram() {
    var date = dateInput ? new Date(dateInput.value + 'T12:00:00Z') : new Date();
    if (isNaN(date.getTime())) date = new Date();

    getScaleAndCenter();
    ctx.fillStyle = 'rgba(10, 10, 15, 0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawOrbits();
    drawSun();

    var positions = getPlanetPositions(date);
    var earthPos = positions[2].pos;

    positions.forEach(function (b, i) {
      var s = toScreen(b.pos);
      drawBody(s, b.color, b.r, b.name);
    });

    var jwst = getJWSTPosition(date, earthPos);
    var jwstScreen = toScreen(jwst.pos);
    var earthScreen = toScreen(earthPos);
    var dx = jwstScreen.x - earthScreen.x;
    var dy = jwstScreen.y - earthScreen.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 12 && dist > 0) {
      var n = 14 / dist;
      jwstScreen.x = earthScreen.x + dx * n;
      jwstScreen.y = earthScreen.y + dy * n;
    }
    drawJWST(jwstScreen);

    if (timeLabel) {
      timeLabel.textContent = 'Positions for: ' + date.toUTCString().replace(' GMT', ' UTC');
    }
  }

  function tick() {
    if (useLiveCheckbox && useLiveCheckbox.checked) {
      var now = new Date();
      if (dateInput) {
        var y = now.getUTCFullYear();
        var m = String(now.getUTCMonth() + 1).padStart(2, '0');
        var d = String(now.getUTCDate()).padStart(2, '0');
        dateInput.value = y + '-' + m + '-' + d;
      }
    }
    drawDiagram();
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    tick();
  }

  window.SolarSystemDiagram = {
    init: function (opts) {
      canvas = opts.canvas;
      dateInput = opts.dateInput || null;
      timeLabel = opts.timeLabel || null;
      useLiveCheckbox = opts.useLiveCheckbox || null;
      window.solarZoomLabel = opts.zoomLabel || null;
      if (!canvas || !canvas.getContext) return;
      ctx = canvas.getContext('2d');
      zoomLevel = 1;
      resize();
      window.addEventListener('resize', resize);
      if (dateInput) dateInput.addEventListener('change', tick);
      if (dateInput) dateInput.addEventListener('input', tick);
      if (useLiveCheckbox) useLiveCheckbox.addEventListener('change', tick);

      canvas.addEventListener('wheel', function (e) {
        e.preventDefault();
        if (e.deltaY > 0) setZoom(zoomLevel / ZOOM_STEP);
        else setZoom(zoomLevel * ZOOM_STEP);
        tick();
      }, { passive: false });

      if (opts.zoomInBtn) opts.zoomInBtn.addEventListener('click', function () {
        setZoom(zoomLevel * ZOOM_STEP);
        tick();
      });
      if (opts.zoomOutBtn) opts.zoomOutBtn.addEventListener('click', function () {
        setZoom(zoomLevel / ZOOM_STEP);
        tick();
      });
      if (opts.zoomResetBtn) opts.zoomResetBtn.addEventListener('click', function () {
        setZoom(1);
        tick();
      });

      setZoom(zoomLevel);
      setInterval(tick, 60000);
    }
  };
})();
