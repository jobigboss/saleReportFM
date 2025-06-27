// api/admin/login
import { connectMongoDB } from '../../../../../lib/mongodb';
import Admin from '../../../../../models/sale_Report_Adimit';
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

  // สร้าง sessionId ใหม่
  const sessionId = crypto.randomUUID();
  user.sessionId = sessionId;
  await user.save();    // <--- สำคัญมาก ต้อง save ได้จริง

  // ส่ง sessionId กลับ
  return NextResponse.json({
    name: user.name,
    role: user.role,
    sessionId,
  });
}
