export async function onRequest({ params, env }) {
  const slug = params.slug;

  const team = await env.DB.prepare("SELECT id FROM teams WHERE slug=?").bind(slug).first();
  if (!team) return new Response("Team not found", { status: 404 });

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const schedule = await env.DB.prepare(
    "SELECT id, event_date, title, opponent, location, notes FROM schedule WHERE team_id=? AND event_date >= ? ORDER BY event_date ASC, id ASC"
  ).bind(team.id, today).all();

  return Response.json({ schedule: schedule.results });
}
