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
    const cups = r.report_sampleCups || 0;

    if (!dailySummary[date]) {
      dailySummary[date] = { bills: 0, cups: 0 };
    }
    dailySummary[date].bills += bills;
    dailySummary[date].cups += cups;
  }

  const formatNumber = (num) => num.toLocaleString("en-US");

  // สร้างข้อมูลข้อความสรุปแบบตาราง
  let textTable = `📋 Performance \n จาก ${from} ถึง ${to} \n
     วันที่            | บิลขาย | แก้วชงชิม | CR %`;
  const chartLabels = [];
  const chartBills = [];
  const chartCups = [];

  for (const date of Object.keys(dailySummary).sort()) {
    const { bills, cups } = dailySummary[date];
    const percent = cups > 0 ? ((bills / cups) * 100).toFixed(1) + '%' : '-';
    textTable += `\n${date} | ${formatNumber(bills)} | ${formatNumber(cups)} | ${percent}`;
    chartLabels.push(date.slice(5));
    chartBills.push(bills);
    chartCups.push(cups);
  }

  // สร้าง URL สำหรับกราฟด้วย QuickChart พร้อมแสดงค่า
  const chartConfig = {
    type: "bar",
    data: {
      labels: chartLabels,
      datasets: [
        {
          label: "บิลขาย",
          data: chartBills,
          backgroundColor: "rgba(54, 162, 235, 0.7)"
        },
        {
          label: "แก้วชงชิม",
          data: chartCups,
          backgroundColor: "rgba(255, 206, 86, 0.7)"
        }
      ]
    },
    options: {
      plugins: {
        datalabels: {
          display: true,
          anchor: 'end',
          align: 'top',
          color: '#000',
          font: {
            weight: 'bold'
          },
          formatter: function(value, context) {
            const dataset = context.dataset;
            const label = dataset.label;
            return `${label}: ${value.toLocaleString("en-US")}`;
          }
        }
      }
    }
  };

  const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&plugins=datalabels`;

  // รวมข้อความ
  const result = `${textTable}\n\n📊 กราฟ: ${chartUrl}`;
  return result;
}
