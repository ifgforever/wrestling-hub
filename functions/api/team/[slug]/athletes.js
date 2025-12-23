export async function onRequest({ params, env }) {
  const slug = params.slug;

  const team = await env.DB.prepare("SELECT id FROM teams WHERE slug=?").bind(slug).first();
  if (!team) return new Response("Team not found", { status: 404 });

  const athletes = await env.DB.prepare(
    "SELECT id, name, weight_class, wins, losses FROM athletes WHERE team_id=? ORDER BY name ASC"
  ).bind(team.id).all();

  return Response.json({ athletes: athletes.results });
}
