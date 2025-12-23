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
<img id="logo"
     alt="Team logo"
     style="width:90px;height:90px;border-radius:14px;object-fit:contain;background:#fff;padding:6px;display:none;border:1px solid rgba(0,0,0,.08);margin-bottom:10px;">

  <h1 id="name">Loading…</h1>
  const logo = document.getElementById('logo');
if (data.team.logo_url) {
  logo.src = data.team.logo_url;
  logo.style.display = 'block';
}


  <h2>Roster / Records</h2>
  <div id="roster"></div>

  <h2 style="margin-top:20px;">Videos</h2>
  <div id="videos"></div>

<script>
(async () => {
  const slug = ${JSON.stringify(slug)};
  const res = await fetch('/api/team/' + encodeURIComponent(slug));
  const data = await res.json();

  document.getElementById('name').textContent =
    data.team.team_name + ' — Season ' + data.team.season_year;

  document.getElementById('roster').innerHTML =
    data.athletes.map(a => '<div>' + a.name + ' — ' + a.wins + '-' + a.losses + '</div>').join('');

  document.getElementById('videos').innerHTML =
    data.videos.map(v =>
      '<div style="margin:16px 0">' +
        '<div><b>' + v.title + '</b></div>' +
        '<iframe width="560" height="315" style="max-width:100%;" ' +
        'src="https://www.youtube.com/embed/' + v.youtube_id + '" allowfullscreen></iframe>' +
      '</div>'
    ).join('');
})();
</script>
</body>
</html>`;

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}
