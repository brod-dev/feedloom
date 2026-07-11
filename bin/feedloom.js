#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { buildFeed } = require('../lib/feed');
const { buildPage } = require('../lib/page');
const { discover } = require('../lib/scan');

const HELP = `feedloom — turn a folder of MP3s into a self-hosted podcast

Usage:
  feedloom init            Create podcast.json and an episodes/ folder here
  feedloom build [dir]     Build public/ (feed.xml + index.html) from [dir] (default: .)
  feedloom --help          Show this help
`;

const TEMPLATE = {
  title: 'My Podcast',
  description: 'A show about things worth hearing.',
  author: 'Your Name',
  siteUrl: 'https://podcast.example.com',
  language: 'en',
  explicit: false,
  coverImage: ''
};

function init(dir) {
  const cfgPath = path.join(dir, 'podcast.json');
  if (fs.existsSync(cfgPath)) {
    console.error('podcast.json already exists — not overwriting.');
    process.exit(1);
  }
  fs.writeFileSync(cfgPath, JSON.stringify(TEMPLATE, null, 2) + '\n');
  fs.mkdirSync(path.join(dir, 'episodes'), { recursive: true });
  console.log('Created podcast.json and episodes/. Drop MP3s into episodes/, edit podcast.json, then run: feedloom build');
}

function build(dir) {
  const cfgPath = path.join(dir, 'podcast.json');
  if (!fs.existsSync(cfgPath)) {
    console.error(`No podcast.json found in ${dir}. Run "feedloom init" first.`);
    process.exit(1);
  }
  const config = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  if (!config.title || !config.siteUrl) {
    console.error('podcast.json must include at least "title" and "siteUrl".');
    process.exit(1);
  }
  const epDir = path.join(dir, 'episodes');
  const episodes = fs.existsSync(epDir) ? discover(epDir) : [];

  const out = path.join(dir, 'public');
  const audioOut = path.join(out, 'audio');
  fs.mkdirSync(audioOut, { recursive: true });
  for (const ep of episodes) fs.copyFileSync(ep.path, path.join(audioOut, ep.file));

  fs.writeFileSync(path.join(out, 'feed.xml'), buildFeed(config, episodes));
  fs.writeFileSync(path.join(out, 'index.html'), buildPage(config, episodes));
  console.log(`Built ${episodes.length} episode(s) → ${path.join(out, 'feed.xml')} and index.html`);
  console.log('Upload public/ to any static host and submit feed.xml to podcast apps.');
}

const [, , cmd, arg] = process.argv;
if (cmd === 'init') init(arg || '.');
else if (cmd === 'build') build(arg || '.');
else console.log(HELP);
