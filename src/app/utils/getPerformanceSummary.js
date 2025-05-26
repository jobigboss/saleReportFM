import { connectMongoDB } from "../../../lib/mongodb";
import sale_Report from "../../../models/sale_Report";

export async function getPerformanceSummary(from, to) {
  await connectMongoDB();

  const startDate = new Date(from);
  const endDate = new Date(to);
  endDate.setHours(23, 59, 59, 999);

  const reports = await sale_Report.find({
    report_SubmitAt: { $gte: startDate, $lte: endDate },
  });

  if (!reports.length) return "❌ ไม่มีข้อมูลในช่วงวันที่ที่เลือก";

  // รวมตาม Channel -> Account -> Shop
  const grouped = {};

  for (const r of reports) {
    const channel = r.store_Channel || "ไม่ระบุช่องทาง";
    const account = r.store_Account || "ไม่ระบุบัญชี";
    const shop = r.store_Name || "ไม่ระบุร้าน";
    const area = r.store_Area2 || "ไม่ระบุเขต";
    const cheerType = r.report_cheerType || "-";
    const cups = r.report_sampleCups || 0;
    const bills = r.report_billsSold || 0;
    const brandChange = r.report_ChangeBrands || {};
    const changedSum = Object.values(brandChange).reduce((a, b) => a + (Number(b) || 0), 0);

    if (!grouped[channel]) grouped[channel] = {};
    if (!grouped[channel][account]) grouped[channel][account] = [];

    grouped[channel][account].push({
      shop, area, cheerType, cups, bills, changedSum
    });
  }

  let result = `📊 สรุป Performance ระหว่าง ${from} ถึง ${to}\n`;

  for (const [channel, accounts] of Object.entries(grouped)) {
    result += `\n🔹 กลุ่มการขาย: ${channel}`;
    for (const [account, shops] of Object.entries(accounts)) {
      result += `\n  📁 บัญชี: ${account}`;
      for (const s of shops) {
        result += `\n    🏪 ${s.shop} (${s.area})\n      - ประเภท: ${s.cheerType}\n      - ชงชิม: ${s.cups}\n      - บิลขาย: ${s.bills}\n      - ลูกค้ามาจากแบรนด์อื่น: ${s.changedSum}`;
      }
    }
  }

  return result;
}
