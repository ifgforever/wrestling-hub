function unauthorized() {
  return new Response("Unauthorized", { status: 401 });
}

export async function onRequestPost({ params, request, env }) {
  const token = request.headers.get("x-admin-token");
  if (!token || token !== env.ADMIN_TOKEN) return unauthorized();

  const slug = params.slug;
  const team = await env.DB.prepare("SELECT id FROM teams WHERE slug = ?")
    .bind(slug).first();

  if (!team) return new Response("Team not found", { status: 404 });

  const body = await request.json();
  const name = (body.name || "").trim();
  const weight_class = (body.weight_class || "").trim() || null;

  const wins = Number.isFinite(+body.wins) ? +body.wins : 0;
  const losses = Number.isFinite(+body.losses) ? +body.losses : 0;

  if (!name) return new Response("Name required", { status: 400 });

  await env.DB.prepare(
    "INSERT INTO athletes (team_id, name, weight_class, wins, losses) VALUES (?, ?, ?, ?, ?)"
  ).bind(team.id, name, weight_class, wins, losses).run();

  return Response.json({ ok: true });
}
