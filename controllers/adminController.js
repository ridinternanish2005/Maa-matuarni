import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";

// ==========================================
// ADMIN DASHBOARD
// ==========================================
export const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalFaculty,
      totalAdmins,
      totalPrincipals,
      activeUsers,
      inactiveUsers
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        role: "student"
      }),

      User.countDocuments({
        role: "faculty"
      }),

      User.countDocuments({
        role: "admin"
      }),

      User.countDocuments({
        role: "principal"
      }),

      User.countDocuments({
        active: true
      }),

      User.countDocuments({
        active: false
      })
    ]);

    const recentUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.render("ERP/admin", {
      erpUser: req.session.erpUser,

      stats: {
        totalUsers,
        totalStudents,
        totalFaculty,
        totalAdmins,
        totalPrincipals,
        activeUsers,
        inactiveUsers
      },

      recentUsers
    });

  } catch (error) {
    console.error("Admin Dashboard Error:", error);

    return res.status(500).send(
      "Unable to load admin dashboard."
    );
  }
};


// ==========================================
// GET USERS
// ==========================================
export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      users
    });

  } catch (error) {
    console.error("Get Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch users"
    });
  }
};


// ==========================================
// CREATE USER
// ==========================================
export const createUser = async (req, res) => {
  try {
    const {
      name,
      enrollment,
      password,
      role,
      session
    } = req.body;

    // Required fields
    if (
      !name ||
      !enrollment ||
      !password ||
      !role ||
      !session
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Allowed roles
    const allowedRoles = [
      "student",
      "faculty",
      "admin",
      "principal"
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }

    // Password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    // Normalize enrollment
    const normalizedEnrollment =
      enrollment.trim().toUpperCase();

    // Check duplicate enrollment
    const existingUser = await User.findOne({
      enrollment: normalizedEnrollment
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Enrollment already exists"
      });
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name: name.trim(),
      enrollment: normalizedEnrollment,
      password: hashedPassword,
      role,
      session: session.trim(),
      active: true,
      mustChangePassword: true
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",

      user: {
        id: user._id,
        name: user.name,
        enrollment: user.enrollment,
        role: user.role,
        session: user.session,
        active: user.active,
        mustChangePassword: user.mustChangePassword
      }
    });

  } catch (error) {
    console.error("Create User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create user"
    });
  }
};


// ==========================================
// UPDATE USER
// ==========================================
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      enrollment,
      role,
      session
    } = req.body;

    // Check ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    // Required fields
    if (
      !name ||
      !enrollment ||
      !role ||
      !session
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Allowed roles
    const allowedRoles = [
      "student",
      "faculty",
      "admin",
      "principal"
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }

    const normalizedEnrollment =
      enrollment.trim().toUpperCase();

    // Check duplicate enrollment
    const existingUser = await User.findOne({
      enrollment: normalizedEnrollment,
      _id: { $ne: id }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Enrollment already exists"
      });
    }

    // Find user
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update
    user.name = name.trim();
    user.enrollment = normalizedEnrollment;
    user.role = role;
    user.session = session.trim();

    await user.save();

    return res.json({
      success: true,
      message: "User updated successfully",

      user: {
        id: user._id,
        name: user.name,
        enrollment: user.enrollment,
        role: user.role,
        session: user.session,
        active: user.active
      }
    });

  } catch (error) {
    console.error("Update User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update user"
    });
  }
};


// ==========================================
// TOGGLE USER STATUS
// ==========================================
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Admin cannot deactivate own account
    if (
      req.session?.erpUser?.id ===
      user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account"
      });
    }

    // Toggle status
    user.active = !user.active;

    await user.save();

    return res.json({
      success: true,

      message: user.active
        ? "User activated successfully"
        : "User deactivated successfully",

      active: user.active
    });

  } catch (error) {
    console.error(
      "Toggle User Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to change user status"
    });
  }
};