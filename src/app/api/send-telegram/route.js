//api/send-telegram/route.js
export async function POST(req) {
  const body = await req.json();

  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  console.log("TELEGRAM_TOKEN", TELEGRAM_TOKEN);
  console.log("TELEGRAM_CHAT_ID", TELEGRAM_CHAT_ID);

  const message = `✅ ทดสอบส่งเข้ากลุ่มจาก API\n\nร้าน: ${body.store_Name || "-"}\nLINE ID: ${body.user_LineID || "-"}`;

  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

  const res = await fetch(telegramUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message }),
  });

  const data = await res.json();
  console.log("RESPONSE:", data);

  return new Response(JSON.stringify({ success: data.ok }), { status: data.ok ? 200 : 500 });
}
