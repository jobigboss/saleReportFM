// //api/send-telegram/route.js
import { connectMongDB } from "../../../../lib/mongodb";
import sale_Report_User from "../../../../models/sale_Report_User";

export async function POST(req) {
  const body = await req.json();
  await connectMongDB();

  const user = await sale_Report_User.findOne({ user_LineID: body.user_LineID });

  const message = `
📢 รายงานใหม่จาก LIFF

👤 ผู้ส่ง: ${user?.user_Name || "ไม่พบ"}
🏪 ร้าน: ${body.store_Name}
📦 ช่องทาง: ${body.store_Channel}
📍 จังหวัด: ${body.store_Province}
📍 เขต: ${body.store_Area2}
💼 บัญชี: ${body.store_Account}
`.trim();

  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message }),
  });

  const data = await res.json();
  return new Response(JSON.stringify({ success: data.ok }), { status: data.ok ? 200 : 500 });
}
