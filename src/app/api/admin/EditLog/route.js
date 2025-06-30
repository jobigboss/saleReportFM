// api/admin/EditLog
import sale_Report_EditLog from "../../../../../models/sale_Report_EditLog";
import sale_Report from "../../../../../models/sale_Report";

// อัพเดท + log การแก้ไข
export async function PUT(req, { params }) {
  const { id } = params;
  const body = await req.json();

  // 1. ดึงข้อมูลเดิม
  const oldReport = await sale_Report.findOne({ report_ID: id });
  if (!oldReport) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // 2. เปรียบเทียบความแตกต่าง (exclude meta field)
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

  // 3. เก็บ log ถ้ามี diff
  if (changes.length > 0) {
    await sale_Report_EditLog.create({
      report_ID: id,
      editedBy: body._editorUserID || "unknown",
      editedByName: body._editorName || "",
      editedAt: new Date(),
      changes
    });
  }

  // 4. update main data
  const updated = await sale_Report.findOneAndUpdate({ report_ID: id }, body, { new: true });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated, { status: 200 });
}