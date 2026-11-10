import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:5000";
  const { searchParams } = request.nextUrl;
  const params = new URLSearchParams({
    count:           searchParams.get("count")           ?? "10",
    useAI:           searchParams.get("useAI")           ?? "true",
    threatsPerAsset: searchParams.get("threatsPerAsset") ?? "3",
  });
  const res = await fetch(
    `${backendUrl}/risk-assessments/bulk-test?${params}`,
    { cache: "no-store" }
  );
  return Response.json(await res.json(), { status: res.ok ? 200 : res.status });
}
