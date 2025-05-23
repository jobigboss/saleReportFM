//api/send-telegram/route.js
export async function POST(req) {
  const body = await req.json();
  console.log("📥 [TELEGRAM] Body:", body);

  const message = `
📢 รายงานใหม่จาก LIFF

👤 LINE ID: ${body.user_LineID}
🏪 ร้าน: ${body.store_Name}
📦 ช่องทาง: ${body.store_Channel}
📍 จังหวัด: ${body.store_Province}
📍 เขต: ${body.store_Area2}
💼 บัญชี: ${body.store_Account}
`.trim();

  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  console.log("🔑 Token:", TELEGRAM_TOKEN ? "[OK]" : "[MISSING]");
  console.log("🆔 Chat ID:", TELEGRAM_CHAT_ID);

  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

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
  console.log("📬 [TELEGRAM] Response:", data);

  return new Response(JSON.stringify({ success: data.ok }), {
    status: data.ok ? 200 : 500,
  });
}
