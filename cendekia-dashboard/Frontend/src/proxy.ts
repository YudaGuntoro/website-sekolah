import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// Legacy clinic screens are not part of the school CMS.
export function proxy(request: NextRequest) { return NextResponse.redirect(new URL("/", request.url)); }
export const config = { matcher: ["/patients/:path*", "/doctors/:path*", "/doctor/:path*", "/appointments/:path*", "/follow-ups/:path*", "/treatments/:path*", "/payments/:path*", "/queue/:path*", "/reports/:path*", "/layar-antrean/:path*", "/kiosk-antrean/:path*"] };
