// lib/mongodb.js
import mongoose from 'mongoose';

const connectMongoDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) return;

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error", error);
  }
};

export { connectMongoDB }; // ✅ เปลี่ยนตรงนี้ให้ถูก