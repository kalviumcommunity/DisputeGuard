// lib/api-response.ts

export function ok<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function fail(code: string, message: string, status: number) {
  return Response.json({ success: false, error: { code, message } }, { status });
}