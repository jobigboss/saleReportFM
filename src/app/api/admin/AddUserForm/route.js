// api/admin/AddUserForm
import { connectMongoDB  } from '../../../../../lib/mongodb';
import Admin from '../../../../../models/sale_Report_Adimit';
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await connectMongoDB();

  const { name, email, phone, password, role } = await req.json();

  // Validate input เพิ่มเติมฝั่ง backend เพื่อความปลอดภัย
  if (!name || !email || !phone || !password || !role) {
    return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });
  }

  // Check email ซ้ำ
  const exist = await Admin.findOne({ email });
  if (exist) {
    return NextResponse.json({ error: "Email นี้มีอยู่แล้ว" }, { status: 400 });
  }

  // Hash password
  const hash = await bcrypt.hash(password, 10);

  // Create User
  const user = await Admin.create({
    name,
    email,
    phone,
    password: hash,
    role,           // รับค่าจาก frontend ตรงๆ
    isActive: true, // default
    resignedAt: null,
  });

  return NextResponse.json({
    message: "เพิ่มผู้ใช้งานสำเร็จ",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
    },
  });
}
