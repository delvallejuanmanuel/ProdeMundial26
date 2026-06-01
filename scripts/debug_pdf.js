const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scratch/FIXTURE.json', 'utf8'));

// Check top-level structure
console.log("Keys:", Object.keys(data));
console.log("Pages count:", data.Pages?.length ?? 'N/A');
if (data.Pages && data.Pages[0]) {
  const page = data.Pages[0];
  console.log("Page keys:", Object.keys(page));
  console.log("Text count:", page.Texts?.length ?? 0);
  if (page.Texts && page.Texts.length > 0) {
    console.log("Sample text[0]:", JSON.stringify(page.Texts[0]));
    console.log("Sample text[1]:", JSON.stringify(page.Texts[1]));
    console.log("Sample text[2]:", JSON.stringify(page.Texts[2]));
  }
}
