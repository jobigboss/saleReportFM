import { connectMongoDB } from "@/lib/mongodb";
import sale_Report_User from "@/models/sale_Report_User";

export async function GET(req) {
  const url = new URL(req.url);
  const user_LineID = url.searchParams.get("user_LineID");

  if (!user_LineID || user_LineID === "null") {
    return new Response(JSON.stringify({ exists: false, error: "Missing or invalid user_LineID" }), {
      status: 400,
    });
  }

  try {
    await connectMongoDB();
    const user = await sale_Report_User.findOne({ user_LineID });

    return new Response(JSON.stringify({ exists: !!user }), {
      status: 200,
    });
  } catch (error) {
    console.error("MongoDB error:", error);
    return new Response(JSON.stringify({ exists: false, error: "DB error" }), {
      status: 500,
    });
  }
}