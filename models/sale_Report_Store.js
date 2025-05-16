import mongoose from "mongoose";

// 🔧 กำหนด structure ของเอกสาร (document)
const sale_Report_StoreSchema = new mongoose.Schema({
  store_Channel: { type: String },
  store_Account: { type: String},
  store_Name: { type: String },
  store_Province: { type: String},
  store_Area1: { type: String},
  store_Area2: { type: String},

});


// 🔁 ตรวจสอบก่อนสร้าง model (สำคัญมากสำหรับ Next.js)
const sale_Report_Store =
  mongoose.models.sale_Report_User ||
  mongoose.model("sale_Report_Store", sale_Report_StoreSchema, "sale_Report_Store");

export default sale_Report_Store;
