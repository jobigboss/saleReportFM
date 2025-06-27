import { connectMongoDB } from '../../../../../lib/mongodb';
import Admin from '../../../../../models/sale_Report_Adimit';
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req) {
  await connectMongoDB();
  const { email, password, forceLogout } = await req.json();
  const user = await Admin.findOne({ email, isActive: true });
  if (!user) return NextResponse.json({ error: "not found" }, { status: 401 });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return NextResponse.json({ error: "invalid password" }, { status: 401 });

  // Case: มี session เดิม + ยังไม่ได้ force logout → แจ้งเตือน
  if (user.sessionId && !forceLogout) {
    return NextResponse.json({
      error: "active_session",
      message: "บัญชีนี้กำลังใช้งานบนเครื่องอื่น ต้องการ force logout เครื่องเดิมหรือไม่?"
    }, { status: 403 });
  }

  // --- Force logout: เตะ session เก่าออกก่อน
  if (user.sessionId && forceLogout) {
    user.sessionId = null;
    await user.save();
    // **สำคัญ**: ต้องรีเฟรชข้อมูลในตัวแปร user
    // reload user จาก DB อีกรอบ (optional)
  }

  // --- สร้าง session ใหม่ (หรือ กรณีปกติ)
  const sessionId = crypto.randomUUID();
  user.sessionId = sessionId;
  await user.save();

  return NextResponse.json({
    name: user.name,
    role: user.role,
    sessionId
  });
}
