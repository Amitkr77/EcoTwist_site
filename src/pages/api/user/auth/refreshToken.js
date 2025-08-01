import { NextResponse } from "next/server";
import User from "@/models/User.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";

export async function POST(req) {
  await dbConnect();
  const { refreshToken } = await req.json();

  try {
    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token required" }, { status: 400 });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    const newToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return NextResponse.json({ token: newToken }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await mongoose.connection.close();
  }
}