import { NextRequest } from "next/server";

// TODO: Proxy de autenticación al backend
export async function POST(request: NextRequest) {
  return Response.json({ message: "Auth endpoint - no implementado" }, { status: 501 });
}
