//api/user-name-line/route.js
import { connectMongDB } from "../../../../lib/mongodb";
import sale_Report_User from "../../../../models/sale_Report_User";

export async function POST(req) {
  const body = await req.json();

  try {
    await connectMongDB();
    const user = await sale_Report_User.findOne({ user_LineID: body.user_LineID });

    if (!user) {
      return new Response(JSON.stringify({ success: false, message: "User not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ success: true, user_Name: user.user_Name }), {
      status: 200,
    });
  } catch (error) {
    console.error("❌ Error in /api/user-name:", error);
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 500,
    });
  }
}
