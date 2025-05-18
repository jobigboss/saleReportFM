// /api/gen-id/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import sale_Report from "../../../../models/sale_Report";
import { connectMongoDB } from "../../../../lib/mongodb";

export async function GET() {
  try {
    await connectMongoDB();

    // ✅ วันที่ไทย (UTC+7)
    const now = new Date();
    const thaiDate = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const yy = thaiDate.getFullYear().toString().slice(-2);
    const mm = String(thaiDate.getMonth() + 1).padStart(2, "0");
    const dd = String(thaiDate.getDate()).padStart(2, "0");
    const datePrefix = `${yy}${mm}${dd}`; // e.g., "250518"

    // ✅ ตรวจสอบจำนวน ID ที่ใช้ไปแล้ววันนี้
    const regex = new RegExp(`^PER${datePrefix}`);
    const todayCount = await sale_Report.countDocuments({
      report_ID: { $regex: regex },
    });

    const runningNumber = String(todayCount + 1).padStart(3, "0"); // 001
    const generatedID = `PER${datePrefix}${runningNumber}`;

    return NextResponse.json({ id: generatedID });
  } catch (error) {
    console.error("❌ Failed to generate ID:", error);
    return NextResponse.json({ error: "Failed to generate ID" }, { status: 500 });
  }
}
