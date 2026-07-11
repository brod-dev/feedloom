'use strict';

const fs = require('fs');
const path = require('path');

/** Turn "03-my-first-episode.mp3" into "My First Episode". */
function titleFromFilename(file) {
  return path.basename(file, path.extname(file))
    .replace(/^\d+[-_.\s]*/, '')
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Discover episodes in a directory. Every .mp3 becomes an episode.
 * A sidecar "<name>.json" may provide { title, description, date, duration }.
 * Returns episodes sorted newest-first.
 */
function discover(dir) {
  const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.mp3')).sort();
  const episodes = files.map((file) => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    let meta = {};
    const sidecar = path.join(dir, path.basename(file, path.extname(file)) + '.json');
    if (fs.existsSync(sidecar)) {
      meta = JSON.parse(fs.readFileSync(sidecar, 'utf8'));
    }
    return {
      file,
      path: full,
      bytes: stat.size,
      title: meta.title || titleFromFilename(file),
      description: meta.description || '',
      date: meta.date ? new Date(meta.date) : stat.mtime,
      duration: meta.duration || null,
    };
  });
  episodes.sort((a, b) => b.date - a.date);
  return episodes;
}

module.exports = { discover, titleFromFilename };
