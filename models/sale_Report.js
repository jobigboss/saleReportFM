import mongoose from "mongoose";

const sale_ReportSchema = new mongoose.Schema({
  report_ID: { type: String, unique: true },
  user_LineID: { type: String },
  store_Channel: { type: String },
  store_Account: { type: String },
  store_Name: { type: String },
  store_Province: { type: String },
  store_Area1: { type: String },
  store_Area2: { type: String },
  quantities: { type: mongoose.Schema.Types.Mixed },
  report_cheerType: { type: String },
  report_sampleCups: { type: Number },
  report_billsSold: { type: Number },
  report_ChangeBrands: { type: Object },
  report_customerQuestions:{ type: [String] },
  report_foremostPromos: { type: [String] },
  report_competitorPromos: { type: [String] },
  report_cheerGirls: { type: [String] },
  report_imageList:{type: [String] }


});

const sale_Report =
  mongoose.models.sale_Report || mongoose.model("sale_Report", sale_ReportSchema, "sale_Report");

export default sale_Report;
