import mongoose from "mongoose";
const { Schema } = mongoose;

const ChangeSchema = new Schema({
  field:   { type: String, required: true },
  before:  { type: Schema.Types.Mixed, default: "" },
  after:   { type: Schema.Types.Mixed, default: "" }
}, { _id: false });

const EditLogSchema = new Schema({
  report_ID:     { type: String, required: true, index: true },
  editedBy:      { type: String, required: true },
  editedByName:  { type: String, default: "" },
  editedAt:      { type: Date, default: Date.now },
  changes:       [ChangeSchema],
  note:          { type: String, default: "" }
}, {
  collection: "sale_Report_EditLog",
  timestamps: false
});

export default mongoose.models.sale_Report_EditLog
  || mongoose.model("sale_Report_EditLog", EditLogSchema);