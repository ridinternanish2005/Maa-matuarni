import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";

const checkAdmin = async () => {
  try {
    await connectDB();

    const user = await User.findOne({
      enrollment: "ADM001"
    }).select("+password");

    if (!user) {
      console.log("❌ ADM001 not found in database");
      process.exit(1);
    }

    console.log("✅ Admin found");
    console.log("Enrollment:", user.enrollment);
    console.log("Name:", user.name);
    console.log("Role:", user.role);
    console.log("Session:", user.session);
    console.log("Active:", user.active);
    console.log("Must Change Password:", user.mustChangePassword);

    const password = "MyPassword123";

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    console.log(
      "Password Match:",
      passwordMatch ? "✅ YES" : "❌ NO"
    );

    process.exit(0);

  } catch (error) {
    console.error("❌ Check Admin Error:", error);
    process.exit(1);
  }
};

checkAdmin();