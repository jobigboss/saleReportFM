//api/sent-google/route.js

export async function POST(req) {
  const body = await req.json();

    // ✅ ตรวจสอบว่า field สำคัญของ sale report ครบหรือไม่
    if (!body?.report_ID || !body?.user_LineID ) {
    return new Response(JSON.stringify({
        success: false,
        message: "Missing required fields: report_ID, user_LineID, or store_Name",
    }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
    });
    }

  try {
    const googleScriptURL = "https://script.google.com/macros/s/AKfycbwl_zqQ5qwu07bvYy2DbkUg0plxu7UFV3A6bBtCFif5bbdqK2DGzWcNOd-JBhiOOER11g/exec";

    const res = await fetch(googleScriptURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    console.error("❌ Proxy Error:", err);
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
