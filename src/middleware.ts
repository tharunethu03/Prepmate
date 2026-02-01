export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/((?!api/auth|api|_next|favicon.ico|login|signup|landing|profile-setup).*)",
  ],
};
