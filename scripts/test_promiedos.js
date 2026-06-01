const https = require('https');

async function run() {
  const url = 'https://www.promiedos.com.ar/team/x/cdhi';
  const html = await new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
  
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
  if (match) {
    const data = JSON.parse(match[1]);
    const squad = data.props?.pageProps?.data?.squad;
    if (squad && squad.groups) {
        squad.groups.forEach(g => {
            console.log("Group:", g.title, "Rows:", g.rows.length);
            if(g.rows.length > 0) {
                console.log("Sample entity object:", Object.keys(g.rows[0].entity.object));
                console.log("Full entity object:", g.rows[0].entity.object);
            }
        });
    }
  }
}
run();
