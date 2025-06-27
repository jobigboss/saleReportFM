
// api/admin/login
import { connectMongoDB  } from '../../../../../lib/mongodb';
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

  // --- generate session id ---
  const sessionId = crypto.randomUUID();

  // --- update session ใน DB ---
  user.sessionId = sessionId;
  await user.save();

  // return ให้ client
  return NextResponse.json({
    name: user.name,
    role: user.role,
    sessionId   // <<== ส่งกลับไปด้วย
  });
}