// //api/send-telegram/route.js
// export async function POST(req) {
//   const body = await req.json();
//   console.log("📥 Telegram Request Body:", body);

//   const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
//   const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

//   console.log("🟡 Token loaded?", !!TELEGRAM_TOKEN);
//   console.log("🟡 Chat ID loaded?", TELEGRAM_CHAT_ID);

//   const message = `
// 📢 รายงานใหม่จาก LIFF

// 👤 LINE ID: ${body.user_LineID}
// 🏪 ร้าน: ${body.store_Name}
// 📦 ช่องทาง: ${body.store_Channel}
// 📍 จังหวัด: ${body.store_Province}
// 📍 เขต: ${body.store_Area2}
// 💼 บัญชี: ${body.store_Account}
// `.trim();

//   const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

//   try {
//     const res = await fetch(telegramUrl, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         chat_id: TELEGRAM_CHAT_ID,
//         text: message,
//         parse_mode: "Markdown",
//       }),
//     });

//     const data = await res.json();
//     console.log("📬 Telegram Response:", data);

//     return new Response(JSON.stringify({ success: data.ok }), {
//       status: data.ok ? 200 : 500,
//     });
//   } catch (error) {
//     console.error("❌ Error sending to Telegram:", error);
//     return new Response(JSON.stringify({ success: false }), {
//       status: 500,
//     });
//   }
// }


import { connectMongDB } from "../../../../lib/mongodb"; // 🧠 เชื่อม MongoDB
import sale_Report_User from "../../../../models/sale_Report_User"; // 🔁 Model ที่คุณแนบมา

export async function POST(req) {
  try {
    const body = await req.json();

    await connectMongDB();

    const user = await sale_Report_User.findOne({ user_LineID: body.user_LineID });

    const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    const message = `
📢 รายงานใหม่จาก LIFF

👤 ผู้ส่ง: ${user?.user_Name || "ไม่พบ"}
📞 โทร: ${user?.user_Phone || "-"}
🏪 ร้าน: ${body.store_Name}
📦 ช่องทาง: ${body.store_Channel}
📍 จังหวัด: ${body.store_Province}
📍 เขต: ${body.store_Area2}
💼 บัญชี: ${body.store_Account}
`.trim();

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

    const res = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown"
      }),
    });

    const data = await res.json();
    console.log("📬 [TELEGRAM] Response:", data);

    return new Response(JSON.stringify({ success: data.ok }), {
      status: data.ok ? 200 : 500,
    });
  } catch (err) {
    console.error("❌ Telegram API Error:", err);
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      status: 500,
    });
  }
}
