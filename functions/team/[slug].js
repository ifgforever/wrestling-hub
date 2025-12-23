export async function onRequest({ params }) {
  const slug = params.slug;

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Team - ${slug}</title>
  <style>
    :root{
      --bg:#0b0f19;
      --card:#111827;
      --text:#e5e7eb;
      --muted:#9ca3af;
      --accent:#fbbf24;
      --border:rgba(255,255,255,.12);
    }
    body{ margin:0; font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial; background:var(--bg); color:var(--text); }
    .wrap{ max-width:1100px; margin:0 auto; padding:18px 14px 60px; }
    .header{
      display:flex; gap:14px; align-items:center;
      border:1px solid var(--border);
      background:linear-gradient(180deg, rgba(255,255,255,.06), transparent);
      border-radius:18px; padding:14px;
    }
    .logo{
      width:84px;height:84px;border-radius:16px;object-fit:contain;
      background:#fff; padding:8px;
      border:3px solid var(--accent);
      box-shadow: 0 0 0 3px rgba(0,0,0,.25);
    }
    h1{ margin:0; font-size:26px; line-height:1.15; }
    .meta{ margin-top:6px; color:var(--muted); font-size:14px; }
    .sections{ display:grid; grid-template-columns: 1fr; gap:14px; margin-top:14px; }
    @media(min-width: 900px){ .sections{ grid-template-columns: 360px 1fr; } }
    .card{ background:var(--card); border:1px solid var(--border); border-radius:16px; padding:12px; }
    .titleRow{ display:flex; justify-content:space-between; align-items:center; gap:10px; }
    .tag{
      font-size:12px; padding:4px 10px; border-radius:999px;
      border:1px solid color-mix(in oklab, var(--accent) 55%, transparent);
      background:color-mix(in oklab, var(--accent) 18%, transparent);
      color:color-mix(in oklab, var(--accent) 85%, white);
      white-space:nowrap;
    }
    .list{ display:flex; flex-direction:column; gap:10px; margin-top:10px; }
    .row{ display:flex; justify-content:space-between; gap:10px; align-items:flex-start; padding:10px; border-radius:12px;
      border:1px solid rgba(255,255,255,.10); background:rgba(255,255,255,.03);
    }
    .left{ display:flex; flex-direction:column; gap:4px; }
    iframe{ width:100%; aspect-ratio:16/9; border:0; border-radius:12px; }
    .grid{ display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:12px; margin-top:10px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <img id="logo" class="logo" alt="Team logo" style="display:none;">
      <div>
        <h1 id="name">Loading…</h1>
        <div class="meta" id="school"></div>
      </div>
    </div>

    <div class="sections">
      <div style="display:flex; flex-direction:column; gap:14px;">
        <div class="card">
          <div class="titleRow">
            <div><b>Schedule</b></div>
            <div class="tag" id="scheduleCount"></div>
          </div>
          <div class="list" id="schedule"></div>
        </div>

        <div class="card">
          <div class="titleRow">
            <div><b>Roster</b></div>
            <div class="tag" id="rosterCount"></div>
          </div>
          <div class="list" id="roster"></div>
        </div>
      </div>

      <div class="card">
        <div class="titleRow">
          <div><b>Videos</b></div>
          <div class="tag" id="videoCount"></div>
        </div>
        <div class="grid" id="videos"></div>
      </div>
    </div>
  </div>

<script>
function esc(s){return (s??"").toString().replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

(async () => {
  const slug = ${JSON.stringify(slug)};
  const res = await fetch('/api/team/' + encodeURIComponent(slug));
  if (!res.ok) {
    document.getElementById('name').textContent = 'Team not found';
    return;
  }
  const data = await res.json();

  // theme
  if (data.team.primary_color) document.documentElement.style.setProperty('--bg', data.team.primary_color);
  if (data.team.secondary_color) document.documentElement.style.setProperty('--card', data.team.secondary_color);
  if (data.team.accent_color) document.documentElement.style.setProperty('--accent', data.team.accent_color);

  // header
  document.getElementById('name').textContent =
    data.team.team_name + ' — Season ' + data.team.season_year;
  document.getElementById('school').textContent = data.team.school_name || '';

  const logo = document.getElementById('logo');
  if (data.team.logo_url) {
    logo.src = data.team.logo_url;
    logo.style.display = '';
  }

  // schedule
  document.getElementById('scheduleCount').textContent = (data.schedule?.length || 0) + ' events';
  document.getElementById('schedule').innerHTML =
    (data.schedule || []).map(e => \`
      <div class="row">
        <div class="left">
          <div><b>\${esc(e.event_date)} — \${esc(e.title)}</b></div>
          <div class="meta">
            \${e.opponent ? 'Opponent: ' + esc(e.opponent) : ''}
            \${(e.opponent && e.location) ? ' · ' : ''}
            \${e.location ? 'Location: ' + esc(e.location) : ''}
            \${e.notes ? '<div style="margin-top:4px;">' + esc(e.notes) + '</div>' : ''}
          </div>
        </div>
      </div>
    \`).join('') || '<div class="meta">No events yet.</div>';

  // roster
  document.getElementById('rosterCount').textContent = (data.athletes?.length || 0) + ' athletes';
  document.getElementById('roster').innerHTML =
    (data.athletes || []).map(a => \`
      <div class="row">
        <div class="left">
          <div><b>\${esc(a.name)}</b></div>
          \${a.weight_class ? '<div class="meta">Weight: ' + esc(a.weight_class) + '</div>' : ''}
        </div>
        <div class="tag">\${a.wins}-\${a.losses}</div>
      </div>
    \`).join('') || '<div class="meta">No athletes yet.</div>';

  // videos (✅ now shows athlete name)
  document.getElementById('videoCount').textContent = (data.videos?.length || 0) + ' videos';
  document.getElementById('videos').innerHTML =
    (data.videos || []).map(v => \`
      <div style="display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
          <div><b>\${esc(v.title)}</b></div>
          \${v.athlete_name ? '<div class="tag" style="font-size:11px;">' + esc(v.athlete_name) + '</div>' : ''}
        </div>
        <iframe src="https://www.youtube.com/embed/\${esc(v.youtube_id)}" allowfullscreen></iframe>
      </div>
    \`).join('') || '<div class="meta">No videos yet.</div>';
})();
</script>
</body>
</html>`;

  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" }});
}
