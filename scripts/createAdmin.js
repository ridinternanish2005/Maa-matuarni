import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";

const createAdmin = async () => {
  try {
    await connectDB();

    const enrollment = "ADM001";
    const password = "MyPassword123";

    // Check existing admin
    const existingUser = await User.findOne({
      enrollment
    });

    if (existingUser) {
      console.log("⚠️ ADM001 already exists");
      console.log("Role:", existingUser.role);
      console.log("Session:", existingUser.session);
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    // Create admin
    const admin = await User.create({
      name: "System Administrator",
      enrollment: enrollment,
      password: hashedPassword,
      role: "admin",
      session: "2025-26",
      active: true,
      mustChangePassword: true
    });

    console.log("=================================");
    console.log("✅ ADMIN CREATED SUCCESSFULLY");
    console.log("=================================");
    console.log("Enrollment:", admin.enrollment);
    console.log("Role:", admin.role);
    console.log("Session:", admin.session);
    console.log("Active:", admin.active);
    console.log(
      "Must Change Password:",
      admin.mustChangePassword
    );
    console.log("Temporary Password:", password);
    console.log("=================================");

    process.exit(0);

  } catch (error) {
    console.error("❌ Create Admin Error:");
    console.error(error);
    process.exit(1);
  }
};

createAdmin();