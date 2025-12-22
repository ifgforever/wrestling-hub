export async function onRequest({ params }) {
  const slug = params.slug;

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Team - ${slug}</title>
</head>
<body style="font-family:system-ui; padding:16px;">
  <h1 id="name">Loading…</h1>

  <h2>Roster / Records</h2>
  <div id="roster"></div>

  <h2 style="margin-top:20px;">Videos</h2>
  <div id="videos"></div>

<script>
(async () => {
  const res = await fetch('/api/team/' + encodeURIComponent(${JSON.stringify(slug)}));
  if (!res.ok) { document.getElementById('name').textContent = 'Team not found'; return; }
  const data = await res.json();

  document.getElementById('name').textContent =
    data.team.team_name + ' — Season ' + data.team.season_year;

  document.getElementById('roster').innerHTML =
    data.athletes.map(a => '<div>' + a.name + ' — ' + a.wins + '-' + a.losses + '</div>').join('');

  document.getElementById('videos').innerHTML =
    data.videos.map(v =>
      '<div style="margin:16px 0">' +
        '<div><b>' + v.title + '</b>' + (v.athlete_name ? (' — ' + v.athlete_name) : '') + '</div>' +
        '<iframe width="560" height="315" style="max-width:100%;" ' +
        'src="https://www.youtube.com/embed/' + v.youtube_id + '" allowfullscreen></iframe>' +
      '</div>'
    ).join('');
})();
</script>
</body>
</html>`;

  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" }});
}
