// Thin wrapper around the static assets. Its only job: keep the preview out of search engines.
// Applies on *.workers.dev only, so thaisweets.nl (custom domain) is not affected.
export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const { hostname } = new URL(request.url);
    if (!hostname.endsWith(".workers.dev")) return response;
    const out = new Response(response.body, response);
    out.headers.set("X-Robots-Tag", "noindex, nofollow");
    return out;
  },
};
