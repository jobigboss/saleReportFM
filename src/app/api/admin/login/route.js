// /api/admin/login/route.js
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

  // ถ้ามี session อยู่ และยังไม่กด force logout
  if (user.sessionId && !forceLogout) {
    return NextResponse.json({
      error: "active_session",
      message: "บัญชีนี้กำลังใช้งานบนเครื่องอื่น ต้องการ force logout เครื่องเดิมหรือไม่?"
    }, { status: 403 });
  }

  // ถ้า forceLogout = true ให้เตะเครื่องเก่า (ลบ sessionId เดิมก่อน)
  if (forceLogout) {
    user.sessionId = null;
    await user.save();
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
