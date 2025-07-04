const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/interview", {
      useNewUrlParser: true,
      useUnifiedTopology: true, // ✅ Fixed spelling
    });
    console.log("✅ MongoDB connected successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
};

// ✅ Correct way to export
module.exports = connectDb;
