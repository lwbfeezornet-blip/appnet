export default async (request, context) => {
  // ── CONFIG ──────────────────────────────────────────────
  const TARGET_HOST = "https://snapp.edrivensports.com:8443";
  // ────────────────────────────────────────────────────────

  const url = new URL(request.url);
  const targetUrl = TARGET_HOST + url.pathname + url.search;

  // Copy incoming headers, replace Host
  const headers = new Headers(request.headers);
  headers.set("Host", new URL(TARGET_HOST).hostname);
  headers.delete("x-forwarded-for");  // clean up

  try {
    const response = await fetch(targetUrl, {
      method:  request.method,
      headers: headers,
      body:    request.method !== "GET" && request.method !== "HEAD"
                 ? request.body
                 : undefined,
      // Important: allows streaming request body (upload direction)
      duplex: "half",
    });

    // Stream the response back (important for XHTTP download direction)
    return new Response(response.body, {
      status:  response.status,
      headers: response.headers,
    });

  } catch (err) {
    return new Response("Relay error: " + err.message, { status: 502 });
  }
};