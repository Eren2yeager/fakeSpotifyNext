import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ playbackState: null });
  const user = await User.findById(session.user._id).lean();
  return NextResponse.json({ playbackState: user?.playbackState ?? null });
}

export async function POST(req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { state, updatedAt } = await req.json();

  const user = await User.findById(session.user._id);
  const existing = user.playbackState?.updatedAt ? new Date(user.playbackState.updatedAt).getTime() : 0;
  const incoming = updatedAt ? new Date(updatedAt).getTime() : 0;
  if (incoming < existing) return NextResponse.json({ ok: true, ignored: true });

  user.playbackState = { ...state, updatedAt: new Date() };
  await user.save();
  return NextResponse.json({ ok: true });
}