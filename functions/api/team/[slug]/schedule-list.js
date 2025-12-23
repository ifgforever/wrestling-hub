export async function onRequest({ params, env }) {
  const slug = params.slug;

  const team = await env.DB.prepare("SELECT id FROM teams WHERE slug=?").bind(slug).first();
  if (!team) return new Response("Team not found", { status: 404 });

  const schedule = await env.DB.prepare(
    "SELECT id, event_date, title, opponent, location, notes FROM schedule WHERE team_id=? ORDER BY event_date ASC, id ASC"
  ).bind(team.id).all();

  return Response.json({ schedule: schedule.results });
}
