import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    await connectDB();
    const {id} = await params;
     const albumId = id;

    // Remove the album from the user's library.albums array
    const result = await User.updateOne(
      { email: session.user.email },
      { $pull: { "library.albums": { album: albumId } } }
    );

    // Optionally, check if anything was modified
    if (result.modifiedCount === 0) {
      return new Response("Album not found in library", { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("❌ Failed to remove album from library:", error);
    return new Response("Server Error", { status: 500 });
  }
}
