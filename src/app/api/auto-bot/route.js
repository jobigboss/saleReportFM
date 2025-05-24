import sale_Report from "../../../../models/sale_Report";
import { connectMongoDB } from "../../../../lib/mongodb";

export async function getCheerSummaryByChannel(from, to, weekendOnly = false) {
  await connectMongoDB();

  const start = new Date(from);
  const end = new Date(to);
  end.setHours(23,59,59,999);

  // กรองตามวันที่
  const filter = {
    report_SubmitAt: { $gte: start, $lte: end },
    report_cheerType: { $exists: true, $ne: "" }
  };

  let reports = await sale_Report.find(filter);

  // ถ้าเอาเฉพาะเสาร์อาทิตย์
  if (weekendOnly) {
    reports = reports.filter(r => {
      const d = new Date(r.report_SubmitAt);
      const day = d.getDay();
      return day === 0 || day === 6;
    });
  }

  // แยก Channel
  const summaryByChannel = { MT: [], GT: [] };
  reports.forEach(r => {
    const ch = (r.store_Channel || "ไม่ระบุ").toUpperCase();
    if (ch.includes("MT")) summaryByChannel.MT.push(r);
    else if (ch.includes("GT")) summaryByChannel.GT.push(r);
  });

  // สรุปแต่ละ Channel
  function getStats(arr) {
    let totalSample = 0, totalBills = 0;
    arr.forEach(r => {
      totalSample += r.report_sampleCups || 0;
      totalBills += r.report_billsSold || 0;
    });
    return {
      activities: arr.length,
      totalSample,
      totalBills,
      avgSample: arr.length ? (totalSample / arr.length).toFixed(1) : 0,
      avgBills: arr.length ? (totalBills / arr.length).toFixed(1) : 0
    };
  }

  const MT = getStats(summaryByChannel.MT);
  const GT = getStats(summaryByChannel.GT);

  // สรุปข้อความ
  let txt = `📊 สรุปยอดเชียร์ขาย (${from} ถึง ${to})\n(เฉพาะ${weekendOnly ? "เสาร์-อาทิตย์" : "ทุกวัน"})\n\n`;
  txt += `【MT】\n`;
  txt += `- จำนวนกิจกรรม: ${MT.activities}\n- ตัวอย่างแจก: ${MT.totalSample.toLocaleString()} ถ้วย\n- ปิดการขาย: ${MT.totalBills.toLocaleString()} บิล\n- ตัวอย่างเฉลี่ย: ${MT.avgSample}/กิจกรรม\n- บิลเฉลี่ย: ${MT.avgBills}/กิจกรรม\n\n`;
  txt += `【GT】\n`;
  txt += `- จำนวนกิจกรรม: ${GT.activities}\n- ตัวอย่างแจก: ${GT.totalSample.toLocaleString()} ถ้วย\n- ปิดการขาย: ${GT.totalBills.toLocaleString()} บิล\n- ตัวอย่างเฉลี่ย: ${GT.avgSample}/กิจกรรม\n- บิลเฉลี่ย: ${GT.avgBills}/กิจกรรม\n\n`;

  // รวม (ถ้าต้องการ)
  const ALL = getStats(reports);
  txt += `【รวมทั้งหมด】\n`;
  txt += `- จำนวนกิจกรรม: ${ALL.activities}\n- ตัวอย่างแจก: ${ALL.totalSample.toLocaleString()} ถ้วย\n- ปิดการขาย: ${ALL.totalBills.toLocaleString()} บิล\n`;

  return txt;
}
