/** Consistent JSON error shape for all API routes. */
export function apiError(
  status: number,
  error: string,
  message: string,
): Response {
  return new Response(JSON.stringify({ error, message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function apiOk<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Wrap a route handler so any unhandled throw becomes a 500. */
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (err: unknown) {
    // Re-throw intentional API errors (already a Response)
    if (err instanceof Response) return err;
    console.error("[api]", err);
    return apiError(500, "INTERNAL_ERROR", "An unexpected error occurred.");
  }
}
