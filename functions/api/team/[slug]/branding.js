function unauthorized() {
  return new Response("Unauthorized", { status: 401 });
}

function cleanHex(s) {
  if (!s) return null;
  const v = s.trim();
  if (!v) return null;
  return /^#[0-9a-fA-F]{6}$/.test(v) ? v : null;
}

export async function onRequestPost({ params, request, env }) {
  const token = request.headers.get("x-admin-token");
  if (!token || token !== env.ADMIN_TOKEN) return unauthorized();

  const slug = params.slug;
  const team = await env.DB.prepare("SELECT id FROM teams WHERE slug = ?")
    .bind(slug).first();

  if (!team) return new Response("Team not found", { status: 404 });

  const body = await request.json();

  const logo_url = (body.logo_url || "").trim() || null;
  const primary_color = cleanHex(body.primary_color);
  const secondary_color = cleanHex(body.secondary_color);
  const accent_color = cleanHex(body.accent_color);

  await env.DB.prepare(`
    UPDATE teams
    SET logo_url=?, primary_color=?, secondary_color=?, accent_color=?
    WHERE id=?
  `).bind(logo_url, primary_color, secondary_color, accent_color, team.id).run();

  return Response.json({ ok: true });
}
