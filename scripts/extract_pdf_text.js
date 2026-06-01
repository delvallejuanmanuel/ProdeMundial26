const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scratch/FIXTURE.json', 'utf8'));

// Extract all text elements
const texts = [];
const page = data.Pages?.[0];
if (page && page.Texts) {
  for (const t of page.Texts) {
    const decoded = t.R?.map(r => decodeURIComponent(r.T)).join('') || '';
    if (decoded.trim()) {
      texts.push({ x: Math.round(t.x * 10) / 10, y: Math.round(t.y * 10) / 10, text: decoded.trim() });
    }
  }
}

// Sort by Y then X
texts.sort((a, b) => a.y - b.y || a.x - b.x);
texts.forEach(t => console.log(`[${t.y}] [${t.x}] ${t.text}`));
