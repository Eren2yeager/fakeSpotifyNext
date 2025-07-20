import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      await connectDB();
      const existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        await User.create({
          name: user.name,
          email: user.email,
          image: user.image,
          playlists: [
            {
              type: "Liked",
              name: "Liked Songs",
              songs: [],
              image: "/images/liked.png",
              description: "Your liked tracks",
            },
          ],
        });
      }

      return true;
    },

    async session({ session }) {
      console.log(session)
      await connectDB();
      const dbUser = await User.findOne({ email: session.user.email });

      // Attach user ID or playlists if needed
      session.user._id = dbUser._id;
      session.user.playlists = dbUser.playlists;

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
