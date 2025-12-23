export async function onRequest({ params, env }) {
  const slug = params.slug;

  const team = await env.DB.prepare("SELECT id FROM teams WHERE slug=?").bind(slug).first();
  if (!team) return new Response("Team not found", { status: 404 });

  const videos = await env.DB.prepare(
    "SELECT id, title, youtube_id FROM videos WHERE team_id=? ORDER BY id DESC"
  ).bind(team.id).all();

  return Response.json({ videos: videos.results });
}
