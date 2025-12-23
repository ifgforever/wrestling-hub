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
  const id = Number(body.id);
  const event_date = (body.event_date || "").trim();
  const title = (body.title || "").trim();
  const location = (body.location || "").trim() || null;
  const opponent = (body.opponent || "").trim() || null;
  const notes = (body.notes || "").trim() || null;

  if (!Number.isFinite(id)) return new Response("Valid id required", { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event_date)) {
    return new Response("event_date must be YYYY-MM-DD", { status: 400 });
  }
  if (!title) return new Response("title required", { status: 400 });

  // Update only if it belongs to this team
  await env.DB.prepare(
    "UPDATE schedule SET event_date=?, title=?, location=?, opponent=?, notes=? WHERE id=? AND team_id=?"
  ).bind(event_date, title, location, opponent, notes, id, team.id).run();

  return Response.json({ ok: true });
}
