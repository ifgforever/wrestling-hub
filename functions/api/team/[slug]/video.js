function unauthorized() {
  return new Response("Unauthorized", { status: 401 });
}

function youtubeIdFromInput(input) {
  if (!input) return null;
  const s = input.trim();

  // raw ID (most are 11 chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;

  try {
    const url = new URL(s);
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace("/", "");
      return id ? id.slice(0, 11) : null;
    }
    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v");
      return id ? id.slice(0, 11) : null;
    }
  } catch {}

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
  const title = (body.title || "").trim();
  const youtube_id = youtubeIdFromInput(body.youtube || "");

  if (!title) return new Response("Title required", { status: 400 });
  if (!youtube_id) return new Response("Valid YouTube link or ID required", { status: 400 });

  await env.DB.prepare(
    "INSERT INTO videos (team_id, title, youtube_id) VALUES (?, ?, ?)"
  ).bind(team.id, title, youtube_id).run();

  return Response.json({ ok: true, youtube_id });
}
