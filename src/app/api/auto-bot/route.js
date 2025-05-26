import { getCheerSummaryByChannel } from "../../utils/getPerformanceSummary";
import { getPerformanceSummary } from "../../utils/getPerformanceSummary"; // สมมุติมีอีก function นี้

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

export async function POST(req) {
  const body = await req.json();
  const chatId = body.message?.chat.id || body.callback_query?.message?.chat.id;
  const text = body.message?.text?.trim() || body.callback_query?.data;

  // 1. ทักทาย
  if (text && text.toLowerCase().includes("hello demon")) {
    await sendText(chatId, "มีอะไรให้ผมรับใช้ครับ", [
      [
        { text: "สรุปยอดเชียร์ขาย", callback_data: "summary_cheer" },
        { text: "สรุปยอด Performance", callback_data: "summary_perf" }
      ]
    ]);
    return Response.json({ ok: true });
  }

  // 2. กดปุ่มเลือก (เชียร์ขาย/Performance)
  if (text === "summary_cheer" || text === "summary_perf") {
    await sendText(chatId, "โปรดเลือกช่วงวันที่", [
      [
        { text: "7 วันล่าสุด", callback_data: `daterange_${text}_last7` },
        { text: "เดือนนี้", callback_data: `daterange_${text}_thismonth` }
      ],
      [
        { text: "กำหนดเอง", callback_data: `daterange_${text}_custom` }
      ]
    ]);
    return Response.json({ ok: true });
  }

  // 3. เลือกช่วงวัน (ตัวอย่างแบบสำเร็จรูป)
  if (text?.startsWith("daterange_summary_cheer")) {
    let from, to;
    const today = new Date();
    if (text.endsWith("last7")) {
      to = today.toISOString().slice(0, 10);
      from = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    } else if (text.endsWith("thismonth")) {
      to = today.toISOString().slice(0, 10);
      from = `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2, '0')}-01`;
    }
    // (true=เฉพาะเสาร์อาทิตย์, false=ทุกวัน)
    const summaryText = await getCheerSummaryByChannel(from, to, false); 
    await sendText(chatId, summaryText);
    return Response.json({ ok: true });
  }
  if (text?.startsWith("daterange_summary_perf")) {
    // เหมือนด้านบน แค่เรียก getPerformanceSummary แทน
    // ...
    return Response.json({ ok: true });
  }

  // 4. ถ้าเลือก "กำหนดเอง"
  if (text?.startsWith("daterange_summary_cheer_custom")) {
    await sendText(chatId, "โปรดพิมพ์ช่วงวันที่ที่ต้องการ (เช่น 2025-05-01 ถึง 2025-05-25)");
    return Response.json({ ok: true });
  }

  // 5. ถ้า user พิมพ์วันที่เอง
  if (/^\d{4}-\d{2}-\d{2}\s*ถึง\s*\d{4}-\d{2}-\d{2}$/.test(text)) {
    const [from, to] = text.split("ถึง").map(s => s.trim());
    const summaryText = await getCheerSummaryByChannel(from, to, false);
    await sendText(chatId, summaryText);
    return Response.json({ ok: true });
  }

  return Response.json({ ok: true });
}

// Helper ส่งข้อความ+ปุ่ม
async function sendText(chatId, text, buttons = null) {
  const payload = {
    chat_id: chatId,
    text,
    ...(buttons && {
      reply_markup: {
        inline_keyboard: buttons
      }
    })
  };
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}
