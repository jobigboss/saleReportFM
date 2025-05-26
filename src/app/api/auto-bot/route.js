import { getCheerSummaryByChannel } from "../../utils/getPerformanceSummary";
import { getPerformanceSummary } from "../../utils/getPerformanceSummary";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

export async function POST(req) {
  const body = await req.json();
  const chatId = body.message?.chat.id || body.callback_query?.message?.chat.id;
  const text = body.message?.text?.trim() || body.callback_query?.data;

  console.log("📥 ได้รับข้อความ:", text);

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

  // 2. เลือกประเภทสรุป
  if (text === "summary_cheer" || text === "summary_perf") {
    await sendText(chatId, "โปรดเลือกช่วงวันที่", [
      [
        { text: "7 วันล่าสุด", callback_data: `daterange_${text}_last7` },
        { text: "เดือนนี้", callback_data: `daterange_${text}_thismonth` }
      ],
      [{ text: "กำหนดเอง", callback_data: `daterange_${text}_custom` }]
    ]);
    return Response.json({ ok: true });
  }

  // 3. เลือกช่วงวันที่ (7 วัน / เดือนนี้)
  if (text?.startsWith("daterange_summary_cheer") || text?.startsWith("daterange_summary_perf")) {
    let from, to;
    const today = new Date();

    if (text.endsWith("last7")) {
      to = today.toISOString().slice(0, 10);
      from = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    } else if (text.endsWith("thismonth")) {
      to = today.toISOString().slice(0, 10);
      from = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-01`;
    }

    if (from && to) {
      try {
        if (text.includes("summary_cheer")) {
          const summaryText = await getCheerSummaryByChannel(from, to, false);
          await sendText(chatId, summaryText);
        } else if (text.includes("summary_perf")) {
          const summary = await getPerformanceSummary(from, to);
          if (typeof summary === "string") {
            await sendText(chatId, summary);
          } else {
            await sendText(chatId, summary.text);
            if (summary.image) await sendPhoto(chatId, summary.image);
          }
        }
      } catch (err) {
        console.error("❌ Error summary:", err);
        await sendText(chatId, "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    } else {
      await sendText(chatId, "❌ ไม่สามารถคำนวณช่วงวันที่ได้");
    }

    return Response.json({ ok: true });
  }

  // 4. ถ้าเลือก "กำหนดเอง"
  if (text?.startsWith("daterange_summary_cheer_custom")) {
    await sendText(chatId, "📅 พิมพ์ช่วงวันที่ เช่น:\ncustom_cheer:2025-05-01 ถึง 2025-05-25");
    return Response.json({ ok: true });
  }

  if (text?.startsWith("daterange_summary_perf_custom")) {
    await sendText(chatId, "📅 พิมพ์ช่วงวันที่ เช่น:\ncustom_perf:2025-05-01 ถึง 2025-05-25");
    return Response.json({ ok: true });
  }

  // 5. พิมพ์ custom date range
  if (/^custom_cheer:\d{4}-\d{2}-\d{2}\s*ถึง\s*\d{4}-\d{2}-\d{2}$/.test(text)) {
    const [from, to] = text.replace("custom_cheer:", "").split("ถึง").map((s) => s.trim());
    try {
      const summaryText = await getCheerSummaryByChannel(from, to, false);
      await sendText(chatId, summaryText);
    } catch (err) {
      console.error("❌ Error cheer custom:", err);
      await sendText(chatId, "เกิดข้อผิดพลาดในการโหลดข้อมูลเชียร์ขาย");
    }
    return Response.json({ ok: true });
  }

  if (/^custom_perf:\d{4}-\d{2}-\d{2}\s*ถึง\s*\d{4}-\d{2}-\d{2}$/.test(text)) {
    const [from, to] = text.replace("custom_perf:", "").split("ถึง").map((s) => s.trim());
    try {
      const summary = await getPerformanceSummary(from, to);
      if (typeof summary === "string") {
        await sendText(chatId, summary);
      } else {
        await sendText(chatId, summary.text);
        if (summary.image) await sendPhoto(chatId, summary.image);
      }
    } catch (err) {
      console.error("❌ Error perf custom:", err);
      await sendText(chatId, "เกิดข้อผิดพลาดในการโหลดข้อมูล Performance");
    }
    return Response.json({ ok: true });
  }

  // fallback
  if (text) {
    await sendText(chatId, `📝 คุณพิมพ์ว่า: ${text}\nลองพิมพ์ตามรูปแบบ เช่น: custom_perf:2025-05-01 ถึง 2025-05-25`);
  }

  return Response.json({ ok: true });
}

// Helper function ส่งข้อความ + ปุ่ม
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

  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const result = await res.json();
  console.log("📤 ส่งข้อความแล้ว:", result.ok ? "✅ OK" : result);
}

// Helper function ส่งรูปภาพ
async function sendPhoto(chatId, imageUrl, caption = '') {
  await fetch(`${TELEGRAM_API}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      photo: imageUrl,
      caption: caption
    })
  });
}
