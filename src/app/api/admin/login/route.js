import { connectMongoDB } from '../../../../../lib/mongodb';
import Admin from '../../../../../models/sale_Report_Adimit';
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req) {
  await connectMongoDB();
  const { email, password, forceLogout } = await req.json(); // เพิ่ม forceLogout

  const user = await Admin.findOne({ email, isActive: true });
  if (!user) return NextResponse.json({ error: "not found" }, { status: 401 });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return NextResponse.json({ error: "invalid password" }, { status: 401 });

  // มี session อยู่แล้ว และไม่ได้ force logout
  if (user.sessionId && !forceLogout) {
    return NextResponse.json({
      error: "active_session",
      message: "บัญชีนี้กำลังใช้งานอยู่บนเครื่องอื่น ต้องการ force logout เครื่องเดิมไหม?",
    }, { status: 403 });
  }

  // --- generate session id ---
  const sessionId = crypto.randomUUID();
  user.sessionId = sessionId;
  await user.save();

  return NextResponse.json({
    name: user.name,
    role: user.role,
    sessionId
  });
}
