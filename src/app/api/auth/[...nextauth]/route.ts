import prisma from "@/lib/prisma";
import { compare } from "bcrypt";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";

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
  adapter: PrismaAdapter(prisma) as Adapter,
  pages: {
    signIn: "/login",
  },
  session: {
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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
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
      // Only for OAuth
      if (account?.provider === "google" || account?.provider === "github") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        // Redirect if profile not completed
        if (existingUser && !existingUser.profileCompleted) {
          return "/profile-setup";
        }
      }

      return true; // allow login
    },
    // JWT token contains all info needed for session
    async jwt({ token, user, trigger, session }) {
      // First login
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

      if (trigger === "update" && session) {
        console.log("JWT UPDATE TRIGGERED");

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

    // Session reads directly from JWT
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

    // Handle redirect after login
    redirect: async ({ url, baseUrl }) => {
      if (url.startsWith(baseUrl)) return url;
      else if (url.startsWith("/")) return new URL(url, baseUrl).toString();
      return baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
