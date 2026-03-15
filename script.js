/* ══════════════════════════════════════════════════════════════
   67 FINDER — main.js
══════════════════════════════════════════════════════════════ */

const GOOGLE_MAPS_API_KEY = "AIzaSyACRbO1wBGid-IdpPk_HsN6vbwm-2jwHBs";

/* ── NAV / PAGE SWITCHING ─────────────────────────────────── */
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));

  document.getElementById("page-" + id).classList.add("active");
  document.querySelector(`.nav-link[data-page="${id}"]`).classList.add("active");

  // show/hide lava lamp canvas
  const canvas = document.getElementById("lava-canvas");
  if (canvas) canvas.style.display = id === "home" ? "block" : "none";

  window.scrollTo({ top: 0, behavior: "instant" });

  if (id === "about") initAbout();
}

/* ── HOME: CITY SEARCH ────────────────────────────────────── */
const cityInput = document.getElementById("cityInput");
const cityClear = document.getElementById("cityClear");
const mapContainer = document.getElementById("mapContainer");
const mapContent   = document.getElementById("mapContent");

function escHtml(str) {
  return str.replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

function doSearch() {
  const city = cityInput.value.trim();
  if (!city) { cityInput.focus(); return; }

  const query    = '"67",' + city;
  const embedUrl = "https://www.google.com/maps/embed/v1/search?key=" +
                   encodeURIComponent(GOOGLE_MAPS_API_KEY) +
                   "&q=" + encodeURIComponent(query) + "&zoom=13";
  const mapsUrl  = "https://www.google.com/maps/search/" + encodeURIComponent(query);

  mapContainer.style.display = "block";
  mapContent.innerHTML =
    '<div class="map-loading">' +
    '<div class="spinner"></div>Finding 67s in ' + escHtml(city) + "</div>";

  document.getElementById("mapTitle").textContent   = "All 67s in " + city;
  document.getElementById("mapSub").textContent     = "Showing streets, avenues, drives, etc.";
  document.getElementById("mapOpenBtn").href         = mapsUrl;

  const iframe = document.createElement("iframe");
  iframe.className = "map-iframe";
  iframe.src = embedUrl;
  iframe.loading = "lazy";
  iframe.allowFullscreen = true;

  setTimeout(() => {
    mapContent.innerHTML = "";
    mapContent.appendChild(iframe);
  }, 500);

  mapContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function clearCity() {
  cityInput.value = "";
  cityClear.classList.remove("visible");
  cityInput.focus();
}

function setCity(city) {
  cityInput.value = city;
  cityClear.classList.add("visible");
  cityInput.focus();
}

if (cityInput) {
  cityInput.addEventListener("input", () => {
    cityClear.classList.toggle("visible", cityInput.value.length > 0);
  });
  cityInput.addEventListener("keydown", e => {
    if (e.key === "Enter") doSearch();
  });
}

/* ══════════════════════════════════════════════════════════════
   ABOUT PAGE
══════════════════════════════════════════════════════════════ */
let aboutInited = false;

function initAbout() {
  if (aboutInited) return;
  aboutInited = true;

  initGradientScroll();
  initScrollReveal();
  init67Parallax();
}

/* ── Gradient background: red→orange→yellow→black ── */
function initGradientScroll() {
  const bg = document.getElementById("aboutGradientBg");
  if (!bg) return;

  // Colour stops along the scroll journey
  // Each stop: { scrollFraction, topColor, bottomColor }
  const stops = [
    { f: 0.00, top: "#ffd23f", bot: "#1a0d00" },   // yellow
    { f: 0.25, top: "#ffaa00", bot: "#1a0800" },    // amber
    { f: 0.45, top: "#ff6b35", bot: "#200500" },    // orange
    { f: 0.65, top: "#ff3300", bot: "#1a0200" },    // red
    { f: 0.80, top: "#cc1100", bot: "#0a0000" },    // deep red
    { f: 1.00, top: "#0a0a0a", bot: "#0a0a0a" },    // back to black
  ];

  function lerpHex(a, b, t) {
    const ra = parseInt(a.slice(1,3),16), ga = parseInt(a.slice(3,5),16), ba_ = parseInt(a.slice(5,7),16);
    const rb = parseInt(b.slice(1,3),16), gb = parseInt(b.slice(3,5),16), bb_ = parseInt(b.slice(5,7),16);
    const r = Math.round(ra + (rb-ra)*t);
    const g = Math.round(ga + (gb-ga)*t);
    const bl= Math.round(ba_ + (bb_-ba_)*t);
    return `rgb(${r},${g},${bl})`;
  }

  function getColors(frac) {
    for (let i = 0; i < stops.length - 1; i++) {
      const s = stops[i], e = stops[i+1];
      if (frac >= s.f && frac <= e.f) {
        const t = (frac - s.f) / (e.f - s.f);
        return { top: lerpHex(s.top, e.top, t), bot: lerpHex(s.bot, e.bot, t) };
      }
    }
    return { top: stops[stops.length-1].top, bot: stops[stops.length-1].bot };
  }

  function onScroll() {
    const page     = document.getElementById("page-about");
    if (!page) return;
    const scrollTop = page.scrollTop !== undefined ? page.scrollTop : window.scrollY;
    const maxScroll  = document.documentElement.scrollHeight - window.innerHeight;
    const frac = Math.min(1, Math.max(0, window.scrollY / Math.max(1, maxScroll)));
    const { top, bot } = getColors(frac);
    bg.style.background = `linear-gradient(to bottom, ${top} 0%, ${bot} 100%)`;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ── 67 disappears as you scroll ── */
function init67Parallax() {
  const el = document.getElementById("about67");
  if (!el) return;

  function onScroll() {
    const heroH = window.innerHeight;
    const scrolled = window.scrollY;
    const progress = Math.min(1, scrolled / (heroH * 0.7));

    const opacity = 1 - progress;
    const scale   = 1 - progress * 0.12;
    const translateY = -scrolled * 0.3;

    el.style.opacity   = opacity;
    el.style.transform = `translateY(${translateY}px) scale(${scale})`;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ── Scroll-reveal for videos + editorial text ── */
function initScrollReveal() {
  const targets = document.querySelectorAll(
    ".video-card, .editorial-eyebrow, .editorial-headline, .editorial-pull-quote, .editorial-p, .editorial-stamp"
  );

  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(t => observer.observe(t));
}

/* ── Boot ── */
document.addEventListener("DOMContentLoaded", () => {
  showPage("home");
  initLavaLamp();
});

/* ══════════════════════════════════════════════════════════════
   LAVA LAMP — single unified glowing blob, rises & falls
   yellow core → orange mid → red outer → black edges
══════════════════════════════════════════════════════════════ */
function initLavaLamp() {
  const canvas = document.getElementById("lava-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  let t = 0;

  function draw() {
    t += 0.004;
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // ── Dark base ──
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, W, H);

    // ── Blob center: drifts vertically like a lava lamp ──
    // Slow sinusoidal rise & fall, slightly wobbly horizontally
    const bx = W * 0.5 + Math.sin(t * 0.7) * W * 0.06;
    const by = H * 0.62
               + Math.sin(t)         * H * 0.14   // primary rise/fall
               + Math.sin(t * 1.7)   * H * 0.05   // secondary wobble
               + Math.sin(t * 0.4)   * H * 0.08;  // slow drift

    // ── Blob size breathes ──
    const blobR = W * 0.55 + Math.sin(t * 1.1) * W * 0.06;

    // ── Layer 1: wide dark-red ambient halo (fills whole screen warmly) ──
    const halo = ctx.createRadialGradient(bx, by, 0, bx, by, W * 1.1);
    halo.addColorStop(0,   "rgba(180,30,5,0.30)");
    halo.addColorStop(0.4, "rgba(120,15,3,0.18)");
    halo.addColorStop(1,   "rgba(10,10,10,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, W, H);

    // ── Layer 2: orange mid-glow ──
    const orange = ctx.createRadialGradient(bx, by, 0, bx, by, blobR);
    orange.addColorStop(0,   "rgba(255,100,20,0.50)");
    orange.addColorStop(0.45,"rgba(220,60,10,0.30)");
    orange.addColorStop(0.8, "rgba(150,20,5,0.12)");
    orange.addColorStop(1,   "rgba(10,10,10,0)");
    ctx.fillStyle = orange;
    ctx.fillRect(0, 0, W, H);

    // ── Layer 3: bright yellow-white hot core ──
    const coreR = blobR * 0.42 + Math.sin(t * 1.9) * blobR * 0.05;
    const core = ctx.createRadialGradient(bx, by, 0, bx, by, coreR);
    core.addColorStop(0,    "rgba(255,240,160,0.55)");
    core.addColorStop(0.25, "rgba(255,210,60,0.45)");
    core.addColorStop(0.6,  "rgba(255,140,20,0.25)");
    core.addColorStop(1,    "rgba(200,60,10,0)");
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, W, H);

    // ── Dark vignette corners to keep it contained ──
    const vignette = ctx.createRadialGradient(W/2, H/2, H * 0.3, W/2, H/2, H * 1.1);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.82)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);

    requestAnimationFrame(draw);
  }

  draw();
}