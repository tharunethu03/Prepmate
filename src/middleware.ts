import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

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
  ],
};
