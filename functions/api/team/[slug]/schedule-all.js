export async function onRequest({ params, env }) {
  const slug = params.slug;

  const team = await env.DB.prepare("SELECT id FROM teams WHERE slug=?").bind(slug).first();
  if (!team) return new Response("Team not found", { status: 404 });

  // Get ALL schedule events (past and future) for video filtering
  const schedule = await env.DB.prepare(
    "SELECT id, event_date, title, opponent, location, notes FROM schedule WHERE team_id=? ORDER BY event_date DESC, id DESC"
  ).bind(team.id).all();

  return Response.json({ schedule: schedule.results });
}
