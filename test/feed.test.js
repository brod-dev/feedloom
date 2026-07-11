'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { xmlEscape, rfc2822, formatDuration, joinUrl, buildFeed } = require('../lib/feed');

test('xmlEscape escapes all five XML special characters', () => {
  assert.strictEqual(xmlEscape(`Tom & Jerry's <"show">`),
    'Tom &amp; Jerry&apos;s &lt;&quot;show&quot;&gt;');
});

test('rfc2822 formats dates per RSS spec', () => {
  assert.strictEqual(rfc2822(new Date(Date.UTC(2026, 6, 4, 9, 5, 0))),
    'Sat, 04 Jul 2026 09:05:00 GMT');
});

test('formatDuration renders HH:MM:SS', () => {
  assert.strictEqual(formatDuration(3725), '01:02:05');
  assert.strictEqual(formatDuration(59), '00:00:59');
});

test('joinUrl never doubles slashes', () => {
  assert.strictEqual(joinUrl('https://a.com/', '/feed.xml'), 'https://a.com/feed.xml');
  assert.strictEqual(joinUrl('https://a.com', 'feed.xml'), 'https://a.com/feed.xml');
});

test('buildFeed produces valid channel and item structure', () => {
  const xml = buildFeed(
    { title: 'Test & Show', siteUrl: 'https://x.com', author: 'Ann', description: 'desc' },
    [{ file: 'ep 1.mp3', title: 'Ep <1>', description: 'd', date: new Date(Date.UTC(2026, 0, 1)), bytes: 123, duration: 60 }]
  );
  assert.match(xml, /<title>Test &amp; Show<\/title>/);
  assert.match(xml, /<title>Ep &lt;1&gt;<\/title>/);
  assert.match(xml, /enclosure url="https:\/\/x.com\/audio\/ep%201.mp3" length="123" type="audio\/mpeg"/);
  assert.match(xml, /<itunes:duration>00:01:00<\/itunes:duration>/);
  assert.match(xml, /<atom:link href="https:\/\/x.com\/feed.xml"/);
});
