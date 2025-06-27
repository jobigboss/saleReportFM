import { connectMongoDB } from '../../../../../lib/mongodb';
import Admin from '../../../../../models/sale_Report_Adimit';
import LoginLog from '../../../../../models/log_Login';
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req) {
  await connectMongoDB();
  const { email, password } = await req.json();
  const user = await Admin.findOne({ email, isActive: true });
  if (!user) return NextResponse.json({ error: "not found" }, { status: 401 });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return NextResponse.json({ error: "invalid password" }, { status: 401 });

  // Create new sessionId every login
  const sessionId = crypto.randomUUID();
  user.sessionId = sessionId;
  await user.save();

  // Log Login
  await LoginLog.create({
    email,
    event: "login",
    device: req.headers["user-agent"] || "",
    ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "",
    sessionId,
    time: new Date()
  });

  return NextResponse.json({
    name: user.name,
    role: user.role,
    sessionId
  });
}
