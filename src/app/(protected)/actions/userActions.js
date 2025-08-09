"use server";

import cloudinary from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";
import User from "@/models/User";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function editUserProfile(formData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return false;

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) return false;

    const name = formData.get("name");
    const image = formData.get("image");

    if (name) user.name = name;

    if (image && typeof image === "object") {
      const buffer = await image.arrayBuffer();
      const bytes = Buffer.from(buffer);

      const uploaded = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "spotify/users",
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(bytes);
      });

      user.image = uploaded.secure_url;
    }

    await user.save();
    
    session.user.name = user.name
    session.user.image = user.image

    revalidatePath("/profile");
    return true;
  } catch (err) {
    console.error("Failed to update profile:", err);
    return false;
  }
}





import Artist from "@/models/Artist";

/**
 * Check if a follower (user or artist) is following a target (user or artist).
 * @param {Object} params
 * @param {string} followerId - The ID of the follower (user or artist)
 * @param {string} followerType - "Profile" or "Artist"
 * @param {string} targetId - The ID of the target (user or artist)
 * @param {string} targetType - "Profile" or "Artist"
 * @returns {Promise<boolean>}
 */
// Yes, this will work as parameters.
// The function expects an object with keys: followerId, followerType, targetId, targetType.
// Example usage:
// isFollowing({followerId: session.user._id, followerType: session.user.type, targetId: artist._id, targetType: artist.type})
export async function isFollowing({ followerId, followerType, targetId, targetType }) {
  try {
    await connectDB();

    let follower;
    if (followerType === "Profile") {
      follower = await User.findById(followerId);
    } else if (followerType === "Artist") {
      follower = await Artist.findById(followerId);
    }
    if (!follower) return false;

    let followingArr;
    if (targetType === "Profile") {
      followingArr = follower.following?.users || [];
    } else if (targetType === "Artist") {
      followingArr = follower.following?.artists || [];
    } else {
      return false;
    }

    const found = followingArr.some(followedId => followedId.toString() === targetId.toString());
    return !!found;
  } catch (err) {
    console.error("Failed to check following:", err);
    return false;
  }
}

/**
 * Toggle following/unfollowing between any user/artist and any user/artist.
 * @param {Object} params
 * @param {string} followerId - The ID of the follower (user or artist)
 * @param {string} followerType - "Profile" or "Artist"
 * @param {string} targetId - The ID of the target (user or artist)
 * @param {string} targetType - "Profile" or "Artist"
 * @returns {Promise<{following: boolean, error?: string}>}
 */
export async function toggleIsFollowing({ followerId, followerType, targetId, targetType }) {
  try {
    await connectDB();

    // Get follower (user or artist)
    let follower;
    if (followerType === "Profile") {
      follower = await User.findById(followerId);
    } else if (followerType === "Artist") {
      follower = await Artist.findById(followerId);
    }
    if (!follower) throw new Error("Follower not found");

    // Get target (user or artist)
    let target;
    if (targetType === "Profile") {
      target = await User.findById(targetId);
    } else if (targetType === "Artist") {
      target = await Artist.findById(targetId);
    }
    if (!target) throw new Error("Target not found");

    // Prepare following/followers arrays
    if (!follower.following) follower.following = { users: [], artists: [] };
    if (!target.followers) target.followers = { users: [], artists: [] };

    // Check if already following
    let isFollowing = false;
    if (targetType === "Profile") {
      isFollowing = follower.following.users.some(id => id.toString() === targetId.toString());
    } else if (targetType === "Artist") {
      isFollowing = follower.following.artists.some(id => id.toString() === targetId.toString());
    }

    // Toggle follow/unfollow
    if (isFollowing) {
      // Unfollow
      if (targetType === "Profile") {
        follower.following.users = follower.following.users.filter(id => id.toString() !== targetId.toString());
        if (followerType === "Profile") {
          target.followers.users = target.followers.users.filter(id => id.toString() !== followerId.toString());
        } else if (followerType === "Artist") {
          target.followers.artists = target.followers.artists.filter(id => id.toString() !== followerId.toString());
        }
      } else if (targetType === "Artist") {
        follower.following.artists = follower.following.artists.filter(id => id.toString() !== targetId.toString());
        if (followerType === "Profile") {
          target.followers.users = target.followers.users.filter(id => id.toString() !== followerId.toString());
        } else if (followerType === "Artist") {
          target.followers.artists = target.followers.artists.filter(id => id.toString() !== followerId.toString());
        }
        // If follower is user, also remove from user.library.artists
        if (followerType === "Profile" && follower.library && Array.isArray(follower.library.artists)) {
          follower.library.artists = follower.library.artists.filter(
            item => item.artist.toString() !== targetId.toString()
          );
        }
      }
    } else {
      // Follow
      if (targetType === "Profile") {
        if (!follower.following.users.some(id => id.toString() === targetId.toString())) {
          follower.following.users.push(target._id);
        }
        if (followerType === "Profile") {
          if (!target.followers.users.some(id => id.toString() === followerId.toString())) {
            target.followers.users.push(follower._id);
          }
        } else if (followerType === "Artist") {
          if (!target.followers.artists.some(id => id.toString() === followerId.toString())) {
            target.followers.artists.push(follower._id);
          }
        }
      } else if (targetType === "Artist") {
        if (!follower.following.artists.some(id => id.toString() === targetId.toString())) {
          follower.following.artists.push(target._id);
        }
        if (followerType === "Profile") {
          if (!target.followers.users.some(id => id.toString() === followerId.toString())) {
            target.followers.users.push(follower._id);
          }
          // Also add to user.library.artists if not already present
          if (!follower.library) follower.library = {};
          if (!Array.isArray(follower.library.artists)) follower.library.artists = [];
          if (!follower.library.artists.some(item => item.artist.toString() === targetId.toString())) {
            follower.library.artists.push({ artist: target._id, added: new Date() });
          }
        } else if (followerType === "Artist") {
          if (!target.followers.artists.some(id => id.toString() === followerId.toString())) {
            target.followers.artists.push(follower._id);
          }
        }
      }
    }

    await follower.save();
    await target.save();

    return !isFollowing
  } catch (err) {
    console.error("Failed to toggle following:", err);
    return {  error: err.message };
  }
}
