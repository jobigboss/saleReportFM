import { connectMongoDB } from '../../../../../lib/mongodb';
import Admin from '../../../../../models/sale_Report_Adimit';
import LoginLog from '../../../../../models/log_Login';
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectMongoDB();
  const { email } = await req.json();
  const user = await Admin.findOne({ email });
  if (user) {
    user.sessionId = null;
    await user.save();
  }
  // Log logout (จะ log event ทุกครั้งที่ logout)
  await LoginLog.create({
    email,
    event: "logout",
    device: req.headers["user-agent"] || "",
    ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "",
    sessionId: null,
    time: new Date()
  });
  return NextResponse.json({ ok: true });
}
