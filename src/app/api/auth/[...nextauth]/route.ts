import prisma from "@/lib/prisma";
import { compare } from "bcrypt";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";

// I had to extend NextAuth's built-in types because by default the session
// only carries name, email, and image — none of the custom fields I needed
// like role, avatar, profileCompleted, etc. Without this, TypeScript would
// complain every time I tried to access session.user.role anywhere in the app.
declare module "next-auth" {
  interface User {
    id: string;
    name: string | null;
    email: string;
    role: string;
    avatar: string | null;
    profileCompleted: boolean;
    onboardingCompleted: boolean;
    roleTitle: string | null;
    field: string | null;
    creatorRequest: boolean;
    portfolioLink: string | null;
    linkedinLink: string | null;
    githubLink: string | null;
  }

  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string;
      role: string;
      avatar: string | null;
      profileCompleted: boolean;
      onboardingCompleted: boolean;
      roleTitle: string | null;
      field: string | null;
      creatorRequest: boolean;
      portfolioLink: string | null;
      linkedinLink: string | null;
      githubLink: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string | null;
    email: string;
    role: string;
    avatar: string | null;
    profileCompleted: boolean;
    onboardingCompleted: boolean;
    roleTitle?: string | null;
    field?: string | null;
    creatorRequest?: boolean;
    portfolioLink?: string | null;
    linkedinLink?: string | null;
    githubLink?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  // I intentionally left the PrismaAdapter commented out. When I first set this
  // up I tried using it, but it expects to own the session and account tables in
  // the DB, which conflicted with my custom user creation flow in the signIn
  // callback. Switching to pure JWT strategy with manual user creation was much
  // simpler and gave me full control over what goes into the token.
  // adapter: PrismaAdapter(prisma) as Adapter,
  pages: {
    signIn: "/login",
  },
  session: {
    // JWT strategy means sessions live entirely in a cookie — no session table
    // in the DB to maintain. This also works better on Vercel where serverless
    // functions are stateless and can't share an in-memory session store.
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "Enter your email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
        // I added this hidden credential field so the verify-email flow can
        // automatically sign the user in after they click the link in their
        // email — without making them type their password again. The token is
        // generated server-side during email verification and passed here.
        autoLoginToken: {
          label: "Auto Login Token",
          type: "text",
        },
      },
      async authorize(credentials) {
        // Post-verification auto-login via one-time token
        if (credentials?.autoLoginToken) {
          const user = await prisma.user.findFirst({
            where: { autoLoginToken: credentials.autoLoginToken },
          });
          if (
            !user ||
            !user.autoLoginTokenExpires ||
            user.autoLoginTokenExpires < new Date()
          )
            return null;

          // Consume the token immediately so it can't be reused if someone
          // intercepts or replays the verification link
          await prisma.user.update({
            where: { id: user.id },
            data: { autoLoginToken: null, autoLoginTokenExpires: null },
          });

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            profileCompleted: user.profileCompleted,
            onboardingCompleted: user.onboardingCompleted,
            roleTitle: user.roleTitle,
            field: user.field,
            creatorRequest: user.creatorRequest,
            portfolioLink: user.portfolioLink,
            linkedinLink: user.linkedinLink,
            githubLink: user.githubLink,
          };
        }

        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        // If the user signed up via OAuth they won't have a password — returning
        // null here means they'll get a generic "invalid credentials" error which
        // is fine, they should use the OAuth button instead
        if (!user || !user.password) return null;

        const isPasswordValid = await compare(
          credentials.password,
          user.password,
        );
        if (!isPasswordValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          profileCompleted: user.profileCompleted,
          onboardingCompleted: user.onboardingCompleted,
          roleTitle: user.roleTitle,
          field: user.field,
          creatorRequest: user.creatorRequest,
          portfolioLink: user.portfolioLink,
          linkedinLink: user.linkedinLink,
          githubLink: user.githubLink,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Credentials users are handled entirely in authorize() above,
      // so this callback only needs to deal with OAuth providers
      if (account?.provider === "google" || account?.provider === "github") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          // First-time OAuth sign-in — NextAuth won't create the user for us
          // because the adapter is disabled, so I do it manually here.
          // emailVerified is set immediately because the OAuth provider already
          // confirmed the email — no need for a separate verification step.
          const newUser = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name ?? null,
              image: user.image ?? null,
              emailVerified: new Date(),
            },
          });
          user.id = newUser.id;
        } else {
          // OAuth gives us a provider-generated user id, but I need the real
          // DB id so everything else in the app resolves correctly
          user.id = existingUser.id;
          if (!existingUser.profileCompleted) {
            // Returning a URL string from signIn redirects the user there —
            // I use this to force OAuth users through profile setup on first login
            return "/profile-setup";
          }
        }
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      // On first sign-in `user` is populated — copy everything into the token
      // so it's available on every subsequent request without hitting the DB
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.avatar = user.avatar;
        token.role = user.role;
        token.profileCompleted = user.profileCompleted ?? false;
        token.onboardingCompleted = user.onboardingCompleted ?? false;
        token.roleTitle = user.roleTitle;
        token.field = user.field;
        token.creatorRequest = user.creatorRequest;
        token.portfolioLink = user.portfolioLink;
        token.linkedinLink = user.linkedinLink;
        token.githubLink = user.githubLink;
      }

      // When the client calls update() on the session (e.g. after profile setup
      // or settings changes), I re-fetch the user from the DB and write the
      // latest values back into the token. This felt like a workaround but it's
      // actually the recommended NextAuth pattern for keeping the JWT in sync
      // with DB changes without forcing a full sign-out/sign-in cycle.
      if (trigger === "update" && session) {
        const updatedUser = await prisma.user.findUnique({
          where: { id: token.id },
        });
        if (updatedUser) {
          token.name = updatedUser.name;
          token.avatar = updatedUser.avatar;
          token.role = updatedUser.role;
          token.profileCompleted = updatedUser.profileCompleted;
          token.onboardingCompleted = updatedUser.onboardingCompleted;
          token.roleTitle = updatedUser.roleTitle;
          token.field = updatedUser.field;
          token.creatorRequest = updatedUser.creatorRequest;
          token.portfolioLink = updatedUser.portfolioLink;
          token.linkedinLink = updatedUser.linkedinLink;
          token.githubLink = updatedUser.githubLink;
        }
      }

      return token;
    },

    // This callback just maps the JWT fields onto the session object that
    // useSession() returns on the client. Without this step the custom fields
    // would live in the token but never be exposed to the frontend.
    session: async ({ session, token }) => {
      session.user = {
        id: token.id!,
        name: token.name!,
        email: token.email!,
        role: token.role!,
        roleTitle: token.roleTitle ?? null,
        field: token.field ?? null,
        creatorRequest: token.creatorRequest ?? false,
        portfolioLink: token.portfolioLink ?? null,
        linkedinLink: token.linkedinLink ?? null,
        githubLink: token.githubLink ?? null,
        avatar: token.avatar ?? null,
        profileCompleted: token.profileCompleted ?? false,
        onboardingCompleted: token.onboardingCompleted ?? false,
      };
      return session;
    },

    // NextAuth's default redirect behaviour is a bit unpredictable with custom
    // pages, so I wrote this explicitly to make sure relative paths resolve
    // correctly and nothing ever redirects outside the app's own origin
    redirect: async ({ url, baseUrl }) => {
      if (url.startsWith(baseUrl)) return url;
      else if (url.startsWith("/")) return new URL(url, baseUrl).toString();
      return baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
