
const https = require('https');
https.get('https://www.promiedos.com.ar/league/fifa-world-cup/fjda', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const match = data.match(/<script id=\"__NEXT_DATA__\" type=\"application\/json\">(.*?)<\/script>/);
    if (!match) {
        console.log('No NEXT_DATA');
        return;
    }
    const json = JSON.parse(match[1]).props.pageProps.data;
    const allGames = json.games.filters.flatMap(f => f.games || []);
    console.log('Total matches:', allGames.length);
    const allTeams = [...new Set(allGames.flatMap(g => g.teams.map(t => t.name)))];
    console.log('Total teams:', allTeams.length);
    const unmappedMatches = allGames.filter(g => g.teams[0].name === 'Portugal' && g.teams[1].name === 'RD Congo');
    if(unmappedMatches.length > 0) {
        console.log('Portugal vs RD Congo exists! Teams:', unmappedMatches[0].teams.map(t => t.id));
    }
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
});

