'use strict';

/** Escape a string for safe inclusion in XML text or attributes. */
function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Format a Date as RFC 2822, as required by RSS <pubDate>. */
function rfc2822(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const p = (n) => String(n).padStart(2, '0');
  return `${days[date.getUTCDay()]}, ${p(date.getUTCDate())} ${months[date.getUTCMonth()]} ` +
    `${date.getUTCFullYear()} ${p(date.getUTCHours())}:${p(date.getUTCMinutes())}:${p(date.getUTCSeconds())} GMT`;
}

/** Format seconds as HH:MM:SS for itunes:duration. */
function formatDuration(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const p = (n) => String(n).padStart(2, '0');
  return `${p(h)}:${p(m)}:${p(sec)}`;
}

/** Join a site URL and a path without doubling slashes. */
function joinUrl(base, path) {
  return base.replace(/\/+$/, '') + '/' + String(path).replace(/^\/+/, '');
}

/**
 * Build an RSS 2.0 feed with iTunes podcast tags.
 * @param {object} config  podcast.json contents
 * @param {Array}  episodes  sorted newest-first
 */
function buildFeed(config, episodes) {
  const site = config.siteUrl || 'https://example.com';
  const items = episodes.map((ep) => {
    const url = joinUrl(site, 'audio/' + encodeURIComponent(ep.file));
    const lines = [
      '    <item>',
      `      <title>${xmlEscape(ep.title)}</title>`,
      `      <description>${xmlEscape(ep.description || '')}</description>`,
      `      <pubDate>${rfc2822(ep.date)}</pubDate>`,
      `      <enclosure url="${xmlEscape(url)}" length="${ep.bytes}" type="audio/mpeg"/>`,
      `      <guid isPermaLink="false">${xmlEscape(url)}</guid>`,
    ];
    if (ep.duration) lines.push(`      <itunes:duration>${formatDuration(ep.duration)}</itunes:duration>`);
    lines.push('    </item>');
    return lines.join('\n');
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(config.title)}</title>
    <link>${xmlEscape(site)}</link>
    <description>${xmlEscape(config.description || '')}</description>
    <language>${xmlEscape(config.language || 'en')}</language>
    <atom:link href="${xmlEscape(joinUrl(site, 'feed.xml'))}" rel="self" type="application/rss+xml"/>
    <itunes:author>${xmlEscape(config.author || '')}</itunes:author>
    <itunes:explicit>${config.explicit ? 'true' : 'false'}</itunes:explicit>
${config.coverImage ? `    <itunes:image href="${xmlEscape(joinUrl(site, config.coverImage))}"/>\n` : ''}${items}
  </channel>
</rss>
`;
}

module.exports = { xmlEscape, rfc2822, formatDuration, joinUrl, buildFeed };
