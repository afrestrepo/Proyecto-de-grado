import { NextRequest, NextResponse } from "next/server";

// TODO: Implementar protección de rutas cuando se integre autenticación
// Por ahora permite todo el tráfico
export function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/(dashboard)/:path*"],
};
