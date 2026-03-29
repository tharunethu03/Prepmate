import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    // Admin routes — require ADMIN role
    if (pathname.startsWith("/admin")) {
      if (!token || token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      // Let withAuth handle auth check — our middleware function handles role checks
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/interview/:path*",
    "/profile/:path*",
    "/create-interviews/:path*",
    "/explore-interviews/:path*",
    "/leaderboard/:path*",
    "/challenges/:path*",
    "/saved-interviews/:path*",
    "/settings/:path*",
    "/help-center/:path*",
    "/add-friends/:path*",
    "/admin/:path*",
  ],
};
