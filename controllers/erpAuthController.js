import bcrypt from "bcryptjs";
import User from "../models/User.js";

// ===============================
// SHOW LOGIN PAGE
// ===============================
export const showLogin = (req, res) => {
  res.render("ERP/login", {
    error: null
  });
};


// ===============================
// LOGIN
// ===============================
export const login = async (req, res) => {
  try {
    const { enrollment, password, session } = req.body;

    if (!enrollment || !password || !session) {
      return res.status(400).json({
        success: false,
        message: "All fields are required."
      });
    }

    const normalizedEnrollment = enrollment.trim().toUpperCase();

    const user = await User.findOne({
      enrollment: normalizedEnrollment,
      session: session.trim()
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid enrollment or password."
      });
    }

    // Account status
    if (user.active === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated."
      });
    }

    // Password check
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid enrollment or password."
      });
    }

    // ===============================
    // CREATE SESSION
    // ===============================
    req.session.erpUser = {
      id: user._id.toString(),
      name: user.name,
      enrollment: user.enrollment,
      role: user.role,
      session: user.session,
      mustChangePassword: user.mustChangePassword
    };

    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

   

    // ===============================
    // ROLE BASED REDIRECT
    // ===============================
    let redirect;

    if (user.role === "student") {
      redirect = "/erp/student";
    } else if (user.role === "faculty") {
      redirect = "/erp/faculty";
    } else if (user.role === "admin") {
      redirect = "/erp/admin";
    } else if (user.role === "principal") {
      redirect = "/erp/principal";
    } else {
      return res.status(403).json({
        success: false,
        message: "Invalid user role."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      redirect
    });

  } catch (error) {
    console.error("ERP Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again."
    });
  }
};



// ===============================
// CHANGE PASSWORD
// ===============================
export const changePassword = async (req, res) => {
  try {
    // Login required
    if (!req.session?.erpUser) {
      return res.status(401).json({
        success: false,
        message: "Please login first."
      });
    }

    const { newPassword, confirmPassword } = req.body;

    // Required fields
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required."
      });
    }

    // Password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match."
      });
    }

    // Minimum length
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters."
      });
    }

    // Get user from database
    const user = await User.findOne({
      enrollment: req.session.erpUser.enrollment
    }).select("+password");

    if (!user) {
      req.session.destroy(() => {});

      return res.status(404).json({
        success: false,
        message: "User account not found."
      });
    }

    if (user.active === false) {
      req.session.destroy(() => {});

      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated."
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    user.mustChangePassword = false;

    await user.save();

    // Update session
    req.session.erpUser.mustChangePassword = false;

    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Role based dashboard
    let redirect;

    if (user.role === "student") {
      redirect = "/erp/student";
    } else if (user.role === "faculty") {
      redirect = "/erp/faculty";
    } else if (user.role === "admin") {
      redirect = "/erp/admin";
    } else if (user.role === "principal") {
      redirect = "/erp/principal";
    } else {
      return res.status(403).json({
        success: false,
        message: "Invalid user role."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
      redirect
    });

  } catch (error) {
    console.error("Change Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to change password."
    });
  }
};


// ===============================
// LOGOUT
// ===============================
export const logout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Logout Error:", error);
      return res.status(500).send("Unable to logout.");
    }

    // Your server uses erp.sid
    res.clearCookie("erp.sid");

    return res.redirect("/erp");
  });
};