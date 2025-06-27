import { connectMongoDB } from '../../../../../lib/mongodb';
import Admin from '../../../../../models/sale_Report_Adimit';
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectMongoDB();
  const { email, sessionId } = await req.json();
  const user = await Admin.findOne({ email, isActive: true });

  // ต้องเทียบ sessionId ตรงเป๊ะ (และไม่ใช่ null)
  if (!user || !user.sessionId || user.sessionId !== sessionId) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
  return NextResponse.json({ valid: true, name: user.name, role: user.role });
}
