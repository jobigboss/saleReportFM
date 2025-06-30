import { connectMongoDB } from '../../../../../../lib/mongodb';
import sale_Report  from '../../../../../../models/sale_Report';
import sale_Report_EditLog from '../../../../../../models/sale_Report_EditLog'; // 👈 import log model
import { NextResponse } from "next/server";

// ดึงข้อมูลตาม id
export async function GET(req, context) {
  await connectMongoDB();
  const { id } = await context.params;
  const report = await sale_Report.findOne({ report_ID: id });
  if (!report) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  return new Response(JSON.stringify(report), { status: 200 });
}

// อัพเดต + log การเปลี่ยนแปลง
export async function PUT(req, context) {
  await connectMongoDB();
  const { id } = await context.params;
  const body = await req.json();

  // 1. ดึงข้อมูลเดิม
  const oldReport = await sale_Report.findOne({ report_ID: id });
  if (!oldReport) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });

  // 2. หา field ที่เปลี่ยนแปลง (exclude meta)
  let changes = [];
  for (let key in body) {
    if (
      key !== "_editorUserID" &&
      key !== "_editorName" &&
      body[key] !== oldReport[key]
    ) {
      changes.push({ field: key, before: oldReport[key], after: body[key] });
    }
  }

  // 3. ถ้ามี diff → สร้าง log
  if (changes.length > 0) {
    await sale_Report_EditLog.create({
      report_ID: id,
      editedBy: body._editorUserID || "unknown",
      editedByName: body._editorName || "",
      editedAt: new Date(),
      changes
    });
  }

  // 4. อัพเดตข้อมูลจริง
  const updated = await sale_Report.findOneAndUpdate({ report_ID: id }, body, { new: true });
  if (!updated) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  return new Response(JSON.stringify(updated), { status: 200 });
}
