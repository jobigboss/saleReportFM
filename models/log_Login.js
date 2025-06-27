import mongoose from "mongoose";

// Define LoginLog schema
const loginLogSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  event: { type: String, enum: ["login", "logout", "force-logout"], required: true },
  device: { type: String },    // user-agent string เช่น "Chrome 125 on Windows 11"
  ip: { type: String },        // ip address
  sessionId: { type: String }, // อ้างอิง session รอบนั้นๆ
  time: { type: Date, default: Date.now }
});

// Hot reload-safe export (Next.js friendly)
export default mongoose.models.LoginLog || mongoose.model("LoginLog", loginLogSchema);
