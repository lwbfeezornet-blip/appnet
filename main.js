const TARGET     = "https://snapp.edrivensports.com:8443";
const NO_BODY    = new Set(["GET", "HEAD"]);
const HOP_BY_HOP = new Set([
  "host","connection","keep-alive","transfer-encoding",
  "te","trailer","upgrade","proxy-authenticate","proxy-authorization",
]);

async function relay(request) {
  try {
    const { pathname, search } = new URL(request.url);
    const targetUrl = TARGET + pathname + search;

    const outHeaders = new Headers();
    for (const [k, v] of request.headers) {
      if (!HOP_BY_HOP.has(k.toLowerCase())) outHeaders.set(k, v);
    }
    outHeaders.set("host", "snapp.edrivensports.com");

    const body = !NO_BODY.has(request.method) && request.body
      ? await request.arrayBuffer()
      : null;

    const upstream = await fetch(targetUrl, {
      method:   request.method,
      headers:  outHeaders,
      redirect: "manual",
      body,
    });

    const resHeaders = new Headers();
    for (const [k, v] of upstream.headers) {
      if (k.toLowerCase() !== "transfer-encoding") resHeaders.set(k, v);
    }

    return new Response(upstream.body, {
      status:  upstream.status,
      headers: resHeaders,
    });

  } catch (err) {
    return new Response("relay error: " + err.message, { status: 502 });
  }
}

Deno.serve(relay);
