function unauthorized() {
  return new Response("Unauthorized", { status: 401 });
}

function extractYouTubeId(input) {
  const s = (input || "").trim();
  if (!s) return null;

  // If it's already an 11-char ID, accept it
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;

  // Try URL patterns
  try {
    const url = new URL(s);
    // youtu.be/<id>
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace("/", "");
      if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }
    // youtube.com/watch?v=<id>
    const v = url.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

    // youtube.com/embed/<id>
    const m = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
  } catch (_) {}

  return null;
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
  const title = (body.title || "").trim();
  const youtube_id = extractYouTubeId(body.youtube);
  const athlete_id = body.athlete_id ? Number(body.athlete_id) : null;

  if (!Number.isFinite(id)) return new Response("Valid id required", { status: 400 });
  if (!title) return new Response("title required", { status: 400 });
  if (!youtube_id) return new Response("valid youtube URL or ID required", { status: 400 });

  // If athlete_id is set, make sure it belongs to this team
  if (athlete_id) {
    const a = await env.DB.prepare("SELECT id FROM athletes WHERE id=? AND team_id=?")
      .bind(athlete_id, team.id).first();
    if (!a) return new Response("athlete_id invalid for this team", { status: 400 });
  }

  // Update only if it belongs to this team
  await env.DB.prepare(
    "UPDATE videos SET title=?, youtube_id=?, athlete_id=? WHERE id=? AND team_id=?"
  ).bind(title, youtube_id, athlete_id, id, team.id).run();

  return Response.json({ ok: true });
}
