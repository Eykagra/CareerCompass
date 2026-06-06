import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Auth.js (NextAuth v5) configuration.
 * - "Continue with Google" OAuth sign-in.
 * - JWT session strategy, so NO database is required. This keeps the app
 *   stateless and aligned with its localStorage-first design, which is ideal
 *   for a single-container EC2 deployment.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  trustHost: true,
});
