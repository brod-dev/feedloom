'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { discover, titleFromFilename } = require('../lib/scan');

test('titleFromFilename strips numbering and prettifies', () => {
  assert.strictEqual(titleFromFilename('03-my-first-episode.mp3'), 'My First Episode');
  assert.strictEqual(titleFromFilename('intro_show.mp3'), 'Intro Show');
});

test('discover reads sidecar metadata and sorts newest-first', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fl-'));
  fs.writeFileSync(path.join(dir, 'old.mp3'), 'aa');
  fs.writeFileSync(path.join(dir, 'new.mp3'), 'bbbb');
  fs.writeFileSync(path.join(dir, 'old.json'), JSON.stringify({ date: '2026-01-01', title: 'Old One' }));
  fs.writeFileSync(path.join(dir, 'new.json'), JSON.stringify({ date: '2026-06-01', duration: 90 }));
  fs.writeFileSync(path.join(dir, 'notes.txt'), 'ignored');
  const eps = discover(dir);
  assert.strictEqual(eps.length, 2);
  assert.strictEqual(eps[0].file, 'new.mp3');
  assert.strictEqual(eps[0].bytes, 4);
  assert.strictEqual(eps[0].duration, 90);
  assert.strictEqual(eps[1].title, 'Old One');
});
