import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:5000";
  const useAI = request.nextUrl.searchParams.get("useAI") ?? "true";
  const res = await fetch(
    `${backendUrl}/risk-assessments/simulate?useAI=${useAI}`,
    { cache: "no-store" },
  );
  const data = await res.json();
  return Response.json(data, { status: res.ok ? 200 : res.status });
}

export async function POST(request: NextRequest) {
  return Response.json({ message: "Riesgos endpoint - no implementado" }, { status: 501 });
}
