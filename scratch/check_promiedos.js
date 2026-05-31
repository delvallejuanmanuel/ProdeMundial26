
const https = require('https');
const options = {
  hostname: 'www.promiedos.com.ar',
  port: 443,
  path: '/',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
  }
};
https.get(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const matches = data.match(/href=.[^>]+fifa-world-cup[^>]+./gi);
    console.log('Matches:', [...new Set(matches)]);
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
});

