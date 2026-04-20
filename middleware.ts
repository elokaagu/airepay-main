import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Native iOS shell loads `/m/*` in WKWebView with `?embed=1` once; we set a cookie so in-app navigations
 * (without the query) still hide the duplicate web header + tab bar.
 */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const embed = request.nextUrl.searchParams.get("embed");
  const shellCookie = request.cookies.get("aire_embed_shell")?.value === "1";

  if (embed === "0") {
    requestHeaders.delete("x-aire-native-embed");
  } else if (embed === "1" || shellCookie) {
    requestHeaders.set("x-aire-native-embed", "1");
  }

  const res = NextResponse.next({ request: { headers: requestHeaders } });

  if (embed === "1") {
    res.cookies.set("aire_embed_shell", "1", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      httpOnly: true,
    });
  } else if (embed === "0") {
    res.cookies.delete("aire_embed_shell");
  }

  return res;
}

export const config = {
  matcher: ["/m", "/m/:path*"],
};
