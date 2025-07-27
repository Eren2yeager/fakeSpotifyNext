import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import Song from "@/models/Song";
import Artist from "@/models/Artist";


// This code is not correct for a Next.js API route for several reasons:
// 1. The function signature for GET should be `GET(req, { params })` if you want to access route parameters.
// 2. The way `.populate()` is used is incorrect. The correct usage is to pass an object or array of objects, not two separate arguments.
// 3. The response should not double-serialize the object (i.e., don't use `JSON.stringify` inside `Response.json`).
// 4. The error message for a missing artist should be 404 (not found), not 401 (unauthorized).

// Here is a corrected version:

export async function GET(req, { params }) {
  await connectDB();

  const { id } =await params;

  // Populate songs (with album details) and albums (with their details)
  console.log(id)
  const artist = await Artist.findById(id)
    .populate({
      path: "songs",
      populate: { path: "artist", select: "_id name image bio" }
    })
    .populate({
      path: "albums"
    });

    console.log(artist)
  if (!artist) {
    return new Response(JSON.stringify({ error: "Artist not found" }), {
      status: 404,
    });
  }

  return new Response(JSON.stringify(artist), {
    status: 200,
  });
}





