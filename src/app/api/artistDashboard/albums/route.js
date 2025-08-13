
import { getArtistFromSession } from "@/app/(protected)/actions/artistActions";
import { connectDB } from "@/lib/mongoose";
import Album from "@/models/Album";
import { uploadToCloudinary } from "@/lib/cloudinary";
import Artist from "@/models/Artist";
import Song from "@/models/Song";


export async function GET() {
  const artist = await getArtistFromSession();
  if (!artist) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const albums = await Album.find({ artist: artist._id }).populate("songs");

  return Response.json(albums);
}


// to create 
export async function POST(req) {
  const artist = await getArtistFromSession();
  if (!artist) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const image = formData.get("image");

    let image_secure_url = null;
    if (image && typeof image === "object" && image.arrayBuffer) {
      const buffer = Buffer.from(await image.arrayBuffer());
      image_secure_url = await uploadToCloudinary(
        buffer,
        "spotify/albums",
        "image"
      );
    }

    await connectDB();
    const album = await Album.create({
      name,
      description,
      image: image_secure_url,
      artist: artist._id,
    });

    artist.albums.push(album._id)
    await artist.save()

    return Response.json(album);
  } catch (error) {
    return Response.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}

// to update

export async function PUT(req) {
  const artist = await getArtistFromSession();
  if (!artist) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();

  const albumId = formData.get("id");
  const name = formData.get("name");
  const description = formData.get("description");
  const image = formData.get("image");

  let updateFields = {};
  if (name) updateFields.name = name;
  if (description) updateFields.description = description;

  if (image && typeof image === "object" && image.arrayBuffer) {
    const buffer = Buffer.from(await image.arrayBuffer());
    const image_secure_url = await uploadToCloudinary(
      buffer,
      "spotify/albums",
      "image"
    );
    updateFields.image = image_secure_url;
  }

  await connectDB();
  const album = await Album.findOneAndUpdate(
    { _id: albumId, artist: artist._id },
    updateFields,
    { new: true }
  );

  if (!album)
    return Response.json({ error: "Album not found" }, { status: 404 });

  return Response.json(album);
}





// to delete
export async function DELETE(req) {
  const artist = await getArtistFromSession();
  if (!artist) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const id = formData.get("id");

  await connectDB();

  // Try to delete the album that belongs to the artist
  const deleted = await Album.findOneAndDelete({
    _id: id,
    artist: artist._id,
  });

  if (!deleted) {
    return Response.json({ error: "Album not found" }, { status: 404 });
  }

  // Remove the album reference from the artist's albums array
  await Artist.updateOne({ _id: artist._id }, { $pull: { albums: id } });
  // Remove the album reference from all songs that have this album
  await Song.updateMany(
    { album: id },
    { $unset: { album: "" } }
  );
  return Response.json({ success: true });
}
