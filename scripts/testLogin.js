import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";

const testLogin = async () => {
  try {
    await connectDB();

    const enrollment = "ADM001";
    const password = "MyPassword123";
    const session = "2025-26";

    console.log("Enrollment:", enrollment);
    console.log("Session:", session);

    const user = await User.findOne({
      enrollment: enrollment.trim().toUpperCase(),
      session: session.trim()
    }).select("+password");

    if (!user) {
      console.log("❌ USER NOT FOUND");
      process.exit(1);
    }

    console.log("✅ USER FOUND");
    console.log("Name:", user.name);
    console.log("Enrollment:", user.enrollment);
    console.log("Role:", user.role);
    console.log("Session:", user.session);
    console.log("Active:", user.active);

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    console.log(
      "Password Match:",
      passwordMatch ? "✅ YES" : "❌ NO"
    );

    if (passwordMatch) {
      console.log("=================================");
      console.log("✅ LOGIN DATA IS CORRECT");
      console.log("=================================");
    }

    process.exit(0);

  } catch (error) {
    console.error("❌ ERROR:", error);
    process.exit(1);
  }
};

testLogin();