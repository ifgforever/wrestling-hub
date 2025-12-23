function unauthorized(){ return new Response("Unauthorized", { status: 401 }); }

export async function onRequestPost({ params, request, env }) {
  const token = request.headers.get("x-admin-token");
  if (!token || token !== env.ADMIN_TOKEN) return unauthorized();

  const { slug } = params;
  const body = await request.json();
  const id = Number(body.id);

  const team = await env.DB.prepare("SELECT id FROM teams WHERE slug=?").bind(slug).first();
  if (!team) return new Response("Team not found", { status: 404 });
  if (!Number.isFinite(id)) return new Response("Valid id required", { status: 400 });

  await env.DB.prepare("DELETE FROM schedule WHERE id=? AND team_id=?").bind(id, team.id).run();

  return Response.json({ ok: true });
}
