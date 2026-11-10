import { NextRequest } from "next/server";

// TODO: Proxy RF-3 — Vulnerabilidades
export async function GET(request: NextRequest) {
  return Response.json({ message: "Vulnerabilidades endpoint - no implementado" }, { status: 501 });
}

export async function POST(request: NextRequest) {
  return Response.json({ message: "Vulnerabilidades endpoint - no implementado" }, { status: 501 });
}
