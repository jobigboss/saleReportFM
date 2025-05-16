import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../models/sale_Report_User";

export async function POST(req) {
  const data = await req.json();
  const { user_LineID, user_Name, user_Lastname, user_Phone } = data;

  if (!user_LineID || !user_Name || !user_Lastname || !user_Phone) {
    return new Response(
      JSON.stringify({ success: false, message: "กรุณากรอกข้อมูลให้ครบ" }),
      { status: 400 }
    );
  }

  try {
    await connectMongoDB();
    const existing = await User.findOne({ user_LineID });
    if (existing) {
      return new Response(
        JSON.stringify({ success: false, message: "Line นี้เคยลงทะเบียนแล้ว" }),
        { status: 400 }
      );
    }

    await User.create({ user_LineID, user_Name, user_Lastname, user_Phone });

    return new Response(
      JSON.stringify({ success: true, message: "บันทึกสำเร็จ" }),
      { status: 201 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: "เกิดข้อผิดพลาด" }),
      { status: 500 }
    );
  }
}
