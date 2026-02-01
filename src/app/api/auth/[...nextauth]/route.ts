import { User } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { compare } from "bcrypt";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string | null;
    profileCompleted: boolean;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      avatar: string | null;
      profileCompleted: boolean;
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
    name: string;
    email: string;
    role: string;
    avatar: string | null;
    profileCompleted: boolean;
    roleTitle?: string;
    field?: string;
    creatorRequest?: boolean;
    portfolioLink?: string;
    linkedinLink?: string;
    githubLink?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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
      async authorize(credentials, req) {
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
          name: user.name || "",
          email: user.email,
          role: user.role || "STUDENT",
          avatar: user.avatar,
          profileCompleted: user.profileCompleted,
        };
      },
    }),
  ],
  callbacks: {
    // JWT token contains all info needed for session
    async jwt({ token, user, trigger, session }) {
      // First login
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.avatar = user.avatar;
        token.role = user.role;
        token.profileCompleted = user.profileCompleted;
      }

      if (trigger === "update" && session) {
        token.name = session.name;
        token.avatar = session.avatar;
        token.role = session.role;
        token.roleTitle = session.roleTitle;
        token.field = session.field;
        token.creatorRequest = session.creatorRequest;
        token.portfolioLink = session.portfolioLink;
        token.linkedinLink = session.linkedinLink;
        token.githubLink = session.githubLink;
        token.profileCompleted = session.profileCompleted;
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
      };
      return session;
    },

    // Handle redirect after login
    redirect: async ({ url, baseUrl }) => {
      // Always allow default redirects
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
