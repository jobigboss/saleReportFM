import mongoose from "mongoose";

// 🔧 กำหนด structure ของเอกสาร (document)
const sale_Report_UserSchema = new mongoose.Schema({
  user_LineID: { type: String, required: true, unique: true },
  user_Name: { type: String, required: true },
  user_Lastname: { type: String, required: true },
  user_Phone: { type: String, required: true },
}, {
  timestamps: true // ✅ createdAt / updatedAt
});


// 🔁 ตรวจสอบก่อนสร้าง model (สำคัญมากสำหรับ Next.js)
const sale_Report_User =
  mongoose.models.sale_Report_User ||
  mongoose.model("sale_Report_User", sale_Report_UserSchema, "sale_Report_User");

export default sale_Report_User;
