<script>
(async () => {
  const elName = document.getElementById('name');
  const elRoster = document.getElementById('roster');

  try {
    const slug = ${JSON.stringify(slug)};
    const url = '/api/team/' + encodeURIComponent(slug);

    elName.textContent = 'Fetching: ' + url;

    const res = await fetch(url);
    const text = await res.text();

    if (!res.ok) {
      elName.textContent = 'API error ' + res.status;
      elRoster.textContent = text.slice(0, 500);
      return;
    }

    const data = JSON.parse(text);

    elName.textContent = data.team.team_name + ' — Season ' + data.team.season_year;

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

  } catch (e) {
    elName.textContent = 'JS/FETCH ERROR';
    elRoster.textContent = String(e);
  }
})();
</script>
