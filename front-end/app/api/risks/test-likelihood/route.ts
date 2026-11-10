import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:5000";
  const body = await request.json();
  const res = await fetch(
    `${backendUrl}/risk-assessments/test-likelihood`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  return Response.json(await res.json(), { status: res.ok ? 200 : res.status });
}
