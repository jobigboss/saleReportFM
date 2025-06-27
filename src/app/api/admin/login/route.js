import { connectMongoDB } from '../../../../../lib/mongodb';
import Admin from '../../../../../models/sale_Report_Adimit';
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req) {
  await connectMongoDB();
  const { email, password, forceLogout } = await req.json();
  let user = await Admin.findOne({ email, isActive: true });
  if (!user) return NextResponse.json({ error: "not found" }, { status: 401 });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return NextResponse.json({ error: "invalid password" }, { status: 401 });

  // ยังมี session เดิม และไม่ได้ force
  if (user.sessionId && !forceLogout) {
    return NextResponse.json({
      error: "active_session",
      message: "บัญชีนี้กำลังใช้งานบนเครื่องอื่น ต้องการ force logout เครื่องเดิมหรือไม่?"
    }, { status: 403 });
  }

  // ถ้า force: เตะเครื่องเก่าออก (sessionId = null) แล้วโหลด user ใหม่
  if (user.sessionId && forceLogout) {
    user.sessionId = null;
    await user.save();
    // reload user object อีกรอบ เพื่อให้ข้อมูลใหม่ล่าสุด
    user = await Admin.findOne({ email, isActive: true });
  }

  // สร้าง session ใหม่
  const sessionId = crypto.randomUUID();
  user.sessionId = sessionId;
  await user.save();

  return NextResponse.json({
    name: user.name,
    role: user.role,
    sessionId
  });
}
