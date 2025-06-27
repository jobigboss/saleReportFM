
// api/admin/logout
import { connectMongoDB } from '../../../../../lib/mongodb';
import Admin from '../../../../../models/sale_Report_Adimit';
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectMongoDB();
  const { email } = await req.json();
  const user = await Admin.findOne({ email });
  if (user) {
    user.sessionId = null;
    await user.save();
  }
  return NextResponse.json({ ok: true });
}