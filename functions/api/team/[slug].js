export async function onRequestGet({ params, env }) {
  const slug = params.slug;

  const team = await env.DB.prepare(
    "SELECT * FROM teams WHERE slug = ?"
  ).bind(slug).first();

  if (!team) return new Response("Not found", { status: 404 });

  const athletes = await env.DB.prepare(
    "SELECT * FROM athletes WHERE team_id = ? ORDER BY name ASC"
  ).bind(team.id).all();

  const videos = await env.DB.prepare(
    "SELECT * FROM videos WHERE team_id = ? ORDER BY id DESC"
  ).bind(team.id).all();

  return Response.json({
    team,
    athletes: athletes.results,
    videos: videos.results
  });
}
