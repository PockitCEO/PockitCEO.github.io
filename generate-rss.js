#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://pockitceo.github.io';
const SITE_TITLE = 'PockitCEO';
const SITE_DESCRIPTION = 'Onchain game architecture, Diamond patterns, and computational game design.';

function parseMarkdownPost(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  let title = '';
  let date = '';
  let description = '';
  
  // Extract title (first # heading)
  const titleMatch = content.match(/^# (.+)$/m);
  if (titleMatch) title = titleMatch[1];
  
  // Extract date (first *Date* line)
  const dateMatch = content.match(/^\*(.+)\*$/m);
  if (dateMatch) {
    const dateStr = dateMatch[1].trim();
    date = new Date(dateStr).toUTCString();
  }
  
  // Extract first paragraph as description
  const paragraphs = content.split('\n\n').filter(p => !p.startsWith('#') && !p.startsWith('*'));
  if (paragraphs.length > 0) {
    description = paragraphs[0].replace(/\n/g, ' ').substring(0, 200) + '...';
  }
  
  const filename = path.basename(filePath, '.md');
  
  return {
    title,
    date,
    description,
    link: `${SITE_URL}/blog/${filename}.html`,
    filename
  };
}

function generateRSS() {
  const postsDir = path.join(__dirname, 'blog/posts');
  const posts = [];
  
  // Read all markdown files
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
  
  for (const file of files) {
    const filePath = path.join(postsDir, file);
    posts.push(parseMarkdownPost(filePath));
  }
  
  // Sort by date (newest first)
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Generate RSS XML
  const items = posts.map(post => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${post.link}</link>
      <guid>${post.link}</guid>
      <pubDate>${post.date}</pubDate>
      <description>${escapeXml(post.description)}</description>
    </item>`).join('');
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;
  
  return rss;
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Generate and write RSS feed
const rss = generateRSS();
fs.writeFileSync(path.join(__dirname, '_site/feed.xml'), rss);
console.log('✓ Generated feed.xml');
