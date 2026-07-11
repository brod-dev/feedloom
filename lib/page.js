'use strict';

const { xmlEscape, formatDuration, joinUrl } = require('./feed');

function fmtDate(d) {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

const LOGO = `<svg viewBox="0 0 64 64" width="40" height="40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="2" y="2" width="60" height="60" rx="14" fill="#1d2433"/>
  <circle cx="24" cy="40" r="6" fill="#f4a259"/>
  <path d="M34 40a10 10 0 0 0-10-10" fill="none" stroke="#7fb5a2" stroke-width="5" stroke-linecap="round"/>
  <path d="M44 40a20 20 0 0 0-20-20" fill="none" stroke="#e8e3d8" stroke-width="5" stroke-linecap="round"/>
</svg>`;

/** Build the podcast landing page HTML. */
function buildPage(config, episodes) {
  const items = episodes.map((ep) => `      <article class="ep">
        <div class="ep-head">
          <h2>${xmlEscape(ep.title)}</h2>
          <span class="meta">${fmtDate(ep.date)}${ep.duration ? ' &middot; ' + formatDuration(ep.duration) : ''}</span>
        </div>
        ${ep.description ? `<p>${xmlEscape(ep.description)}</p>` : ''}
        <audio controls preload="none" src="audio/${encodeURIComponent(ep.file)}"></audio>
      </article>`).join('\n');

  const empty = `      <div class="empty">
        <p>No episodes yet. Drop an <code>.mp3</code> into your episodes folder and run <code>feedloom build</code> again.</p>
      </div>`;

  return `<!DOCTYPE html>
<html lang="${xmlEscape(config.language || 'en')}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${xmlEscape(config.title)}</title>
<meta name="description" content="${xmlEscape(config.description || '')}">
<link rel="alternate" type="application/rss+xml" title="${xmlEscape(config.title)}" href="feed.xml">
<style>
  :root { --ink:#1d2433; --paper:#faf7f2; --accent:#f4a259; --sage:#7fb5a2; --muted:#6b7280; }
  * { box-sizing:border-box; margin:0; }
  body { font-family:Georgia,'Times New Roman',serif; background:var(--paper); color:var(--ink); line-height:1.6; }
  .wrap { max-width:680px; margin:0 auto; padding:48px 20px 80px; }
  header { display:flex; align-items:center; gap:14px; margin-bottom:8px; }
  h1 { font-size:1.9rem; letter-spacing:-0.02em; }
  .tagline { color:var(--muted); margin-bottom:12px; font-style:italic; }
  .subscribe { display:inline-block; margin-bottom:36px; padding:8px 16px; border:2px solid var(--ink);
    border-radius:999px; color:var(--ink); text-decoration:none; font-family:system-ui,sans-serif;
    font-size:.85rem; font-weight:600; transition:background .15s, color .15s; }
  .subscribe:hover, .subscribe:focus-visible { background:var(--ink); color:var(--paper); }
  .ep { background:#fff; border:1px solid #e5e0d8; border-radius:12px; padding:20px 22px; margin-bottom:18px;
    box-shadow:0 1px 3px rgba(29,36,51,.06); }
  .ep-head { display:flex; flex-wrap:wrap; align-items:baseline; justify-content:space-between; gap:6px; }
  .ep h2 { font-size:1.15rem; }
  .meta { color:var(--muted); font-family:system-ui,sans-serif; font-size:.78rem; }
  .ep p { margin:8px 0 14px; font-size:.95rem; }
  audio { width:100%; }
  .empty { text-align:center; color:var(--muted); padding:60px 20px; border:2px dashed #d8d2c6; border-radius:12px; }
  footer { margin-top:48px; text-align:center; color:var(--muted); font-family:system-ui,sans-serif; font-size:.75rem; }
  @media (max-width:480px){ .wrap{padding-top:28px} h1{font-size:1.5rem} }
</style>
</head>
<body>
  <div class="wrap">
    <header>
      ${LOGO}
      <h1>${xmlEscape(config.title)}</h1>
    </header>
    <p class="tagline">${xmlEscape(config.description || '')}</p>
    <a class="subscribe" href="feed.xml">&#9741; Subscribe via RSS</a>
    <main>
${episodes.length ? items : empty}
    </main>
    <footer>${xmlEscape(config.author || '')}${config.author ? ' &middot; ' : ''}Feed: <a href="feed.xml">feed.xml</a></footer>
  </div>
</body>
</html>
`;
}

module.exports = { buildPage, LOGO };
