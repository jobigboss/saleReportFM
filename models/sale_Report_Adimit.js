import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hash แล้ว
    avatarUrl: { type: String, default: "" }, // optional
    role: { type: String, enum: ["admin", "user","sup","sale"], default: "user" },
    phone: { type: String, default: "" },
    isActive: { type: Boolean, default: true }, // <<< เพิ่ม field นี้
    resignedAt: { type: Date, default: null },  // <<< เพิ่ม field นี้
    sessionId: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    collection: "sale_Report_admin"
  }
);

// Middleware: update updatedAt on save
AdminSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Admin =
  mongoose.models.Admin ||
  mongoose.model("Admin", AdminSchema);

export default Admin;
