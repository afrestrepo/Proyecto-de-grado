import { NextRequest } from "next/server";

// TODO: Proxy RF-6 — Tratamientos
export async function GET(request: NextRequest) {
  return Response.json({ message: "Tratamientos endpoint - no implementado" }, { status: 501 });
}

export async function POST(request: NextRequest) {
  return Response.json({ message: "Tratamientos endpoint - no implementado" }, { status: 501 });
}
