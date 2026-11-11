// Thin wrapper around the static assets:
//  1. thaisweets.nl (apex) -> 301 to https://www.thaisweets.nl, same path and query.
//  2. *.workers.dev (the preview) gets "X-Robots-Tag: noindex, nofollow". Nothing else does.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "thaisweets.nl") {
      return Response.redirect("https://www.thaisweets.nl" + url.pathname + url.search, 301);
    }
    const response = await env.ASSETS.fetch(request);
    if (!url.hostname.endsWith(".workers.dev")) return response;
    const out = new Response(response.body, response);
    out.headers.set("X-Robots-Tag", "noindex, nofollow");
    return out;
  },
};
