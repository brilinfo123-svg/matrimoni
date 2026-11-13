const ALLOWED_ORIGINS = [
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "https://evermilan.vercel.app",
  ];
  
  export function getCorsHeaders(request: Request) {
    const origin = request.headers.get("origin") || "";
    const headers = new Headers();
  
    if (ALLOWED_ORIGINS.includes(origin)) {
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set("Access-Control-Allow-Credentials", "true");
      headers.set("Vary", "Origin");
    }
  
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    headers.set("Access-Control-Max-Age", "86400");
  
    return headers;
  }
  
  export function handleCorsOptions(request: Request) {
    const origin = request.headers.get("origin") || "";
  
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return new Response(null, { status: 403 });
    }
  
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(request),
    });
  }
  
  export function addCorsHeaders(
    request: Request,
    response: Response,
  ) {
    const corsHeaders = getCorsHeaders(request);
  
    corsHeaders.forEach((value, key) => {
      response.headers.set(key, value);
    });
  
    return response;
  }