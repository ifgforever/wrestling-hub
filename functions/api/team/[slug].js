export async function onRequest({ params, env }) {
  const slug = params.slug;

  // 1) Find team
  const team = await env.DB
    .prepare("SELECT * FROM teams WHERE slug = ?")
    .bind(slug)
    .first();

  if (!team) {
    return new Response("Team not found", { status: 404 });
  }

  // 2) Athletes (includes weight_class)
  const athletes = await env.DB
    .prepare("SELECT id, team_id, name, weight_class, wins, losses FROM athletes WHERE team_id = ? ORDER BY name ASC")
    .bind(team.id)
    .all();

  // 3) Videos
  const videos = await env.DB.prepare(`
  SELECT v.id, v.team_id, v.title, v.youtube_id, v.athlete_id,
         a.name AS athlete_name
  FROM videos v
  LEFT JOIN athletes a ON a.id = v.athlete_id
  WHERE v.team_id = ?
  ORDER BY v.id DESC
`).bind(team.id).all();


  // 4) Schedule
  const schedule = await env.DB
    .prepare("SELECT id, team_id, event_date, title, location, opponent, notes FROM schedule WHERE team_id = ? ORDER BY event_date ASC, id ASC")
    .bind(team.id)
    .all();

  return Response.json({
    team,
    athletes: athletes.results,
    videos: videos.results,
    schedule: schedule.results
  });
}
