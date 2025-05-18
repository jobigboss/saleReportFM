// /src/app/api/sale-report/route.js

import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb"; // แก้ path ให้ถูกกับโปรเจกต์คุณ
import sale_Report from "../../../../models/sale_Report";

export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json();

    const result = await sale_Report.create(body);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("❌ Failed to save report:", error);
    return NextResponse.json({ success: false, error: "Save failed" }, { status: 500 });
  }
}
