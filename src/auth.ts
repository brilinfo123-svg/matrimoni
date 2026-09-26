import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials?.password
        ) {
          return null;
        }
       
        const email = String(credentials.email)
          .trim()
          .toLowerCase();

        const password = String(credentials.password);

        await connectDB();

        const user = await User.findOne({
          email,
        }).select("+password");

        if (!user) {
          return null;
        }

        if (user.isActive === false) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          password,
          user.password,
        );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.firstName || ""} ${
            user.lastName || ""
          }`.trim(),
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = String(token.id);
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});