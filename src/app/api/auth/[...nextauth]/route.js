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
        // First, create the user with an empty library (all arrays required by schema)
        const newUser = await User.create({
          name: user.name,
          email: user.email,
          image: user.image,
          library: {
            playlists: [],
            albums: [],
            artists: [],
          },
        });

        // Create the "Liked Songs" playlist and link it to the user
        const likedPlaylist = await (await import("@/models/Playlist")).default.create({
          type: "Playlist",
          specialtype: "Liked",
          name: "Liked Songs",
          songs: [],
          image: "/images/liked.png",
          description: "Your liked tracks",
          createdBy: newUser._id,
        });

        // Add the liked playlist to the user's library.playlists array
        newUser.library.playlists.push({
          playlist: likedPlaylist._id,
          added: new Date(),
        });

        await newUser.save();
      }

      return true;
    },

    async session({ session }) {
      await connectDB();
      const dbUser = await User.findOne({ email: session.user.email });

      // Attach user ID or playlists if needed
      session.user._id = dbUser._id;
      session.user.type = dbUser.type;
      session.user.isArtist = dbUser.isArtist;
      if(dbUser.image){
        session.user.image = dbUser.image;
      }
      console.log(session)
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
