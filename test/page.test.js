'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { buildPage } = require('../lib/page');

const cfg = { title: 'My Show', description: 'About things', author: 'Ann' };

test('buildPage renders episodes with audio players', () => {
  const html = buildPage(cfg, [{ file: 'a.mp3', title: 'Hello', description: '', date: new Date(Date.UTC(2026, 0, 5)), duration: 120 }]);
  assert.match(html, /<h1>My Show<\/h1>/);
  assert.match(html, /<audio controls preload="none" src="audio\/a.mp3">/);
  assert.match(html, /00:02:00/);
});

test('buildPage shows an empty state with no episodes', () => {
  const html = buildPage(cfg, []);
  assert.match(html, /No episodes yet/);
});
