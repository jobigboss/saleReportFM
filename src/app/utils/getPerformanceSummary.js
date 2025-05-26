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

  // รวมตามวัน
  const dailySummary = {};
  for (const r of reports) {
    const date = r.report_SubmitAt.toISOString().slice(0, 10);
    const bills = r.report_billsSold || 0;

    if (!dailySummary[date]) {
      dailySummary[date] = 0;
    }
    dailySummary[date] += bills;
  }

  // สร้างข้อมูลข้อความสรุปแบบตาราง
  let textTable = `📋 Performance จาก ${from} ถึง ${to}:\nวันที่        | บิลขาย\n-------------|--------`;
  const chartLabels = [];
  const chartData = [];

  for (const date of Object.keys(dailySummary).sort()) {
    textTable += `\n${date}   | ${dailySummary[date]}`;
    chartLabels.push(date.slice(5));
    chartData.push(dailySummary[date]);
  }

  // สร้าง URL สำหรับกราฟด้วย QuickChart
  const chartConfig = {
    type: "bar",
    data: {
      labels: chartLabels,
      datasets: [
        {
          label: "บิลขาย",
          data: chartData,
          backgroundColor: "rgba(54, 162, 235, 0.7)"
        }
      ]
    }
  };
  const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}`;

  // รวมข้อความ
  const result = `${textTable}\n\n📊 กราฟ: ${chartUrl}`;
  return result;
}
