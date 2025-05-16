// app/api/checkUser/route.js
import { connectMongoDB } from "../../../../lib/mongodb";
import sale_Report_User from "../../../../models/sale_Report_User";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const user_LineID = searchParams.get("lineID");

  await connectMongoDB();
  const user = await sale_Report_User.findOne({ user_LineID });

  return new Response(JSON.stringify({ exists: !!user }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
