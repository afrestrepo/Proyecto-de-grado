import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:5000";
  const limit = request.nextUrl.searchParams.get("limit") ?? "20";
  const res = await fetch(
    `${backendUrl}/risk-assessments?limit=${limit}&skip=0`,
    { cache: "no-store" }
  );
  return Response.json(await res.json(), { status: res.ok ? 200 : res.status });
}
