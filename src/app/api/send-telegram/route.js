//api/send-telegram/route.js

import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../models/sale_Report_User";

export async function POST(req) {
  const body = await req.json();
  console.log("📥 Telegram Request Body:", body);

  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  console.log("🟡 Token loaded?", !!TELEGRAM_TOKEN);
  console.log("🟡 Chat ID loaded?", TELEGRAM_CHAT_ID);

  // ✅ เชื่อม MongoDB และค้นหา user จาก user_LineID
  await connectMongoDB();
  const user = await User.findOne({ user_LineID: body.user_LineID });

  const userName = user?.user_Name || "ไม่ทราบชื่อ";
  const userLastname = user?.user_Lastname || "";
  const userPhone = user?.user_Phone || "ไม่ทราบเบอร์";

  // ✅ สร้างข้อความสำหรับ Telegram
  const message = `
📢 รายงานใหม่จาก LIFF

รหัส Report : ${body.report_ID}
ผู้ส่งรายงาน: ${userName} ${userLastname}
เบอร์โทร: ${userPhone}
ร้าน: ${body.store_Name}
ช่องทาง: ${body.store_Channel}
จังหวัด: ${body.store_Province}
เขต: ${body.store_Area2}
บัญชี: ${body.store_Account}
`.trim();

  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

  try {
    const res = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    const data = await res.json();
    console.log("📬 Telegram Response:", data);

    return new Response(JSON.stringify({ success: data.ok }), {
      status: data.ok ? 200 : 500,
    });
  } catch (error) {
    console.error("❌ Error sending to Telegram:", error);
    return new Response(JSON.stringify({ success: false }), {
      status: 500,
    });
  }
}