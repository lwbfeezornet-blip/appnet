const TARGET = "https://snapp.edrivensports.com:8443";

export default async (request, context) => {
  const url = new URL(request.url);
  const targetUrl = TARGET + url.pathname + url.search;

  const headers = new Headers(request.headers);
  headers.set("Host", "snapp.edrivensports.com");

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== "GET" && request.method !== "HEAD"
              ? request.body
              : undefined,
      duplex: "half",
    });

    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });

  } catch (err) {
    return new Response("relay error: " + err.message, { status: 502 });
  }
};
