import User from "../models/User.js";
import StudentAttendance from "../models/StudentAttendance.js";

// ==========================================
// STUDENT ATTENDANCE PAGE
// ==========================================

export const getAttendance = async (req, res) => {
  try {
    // Login check
    if (!req.session?.erpUser) {
      return res.redirect("/erp");
    }

    const enrollment = req.session.erpUser.enrollment;

    // Student ko database se find karo
    const user = await User.findOne({
      enrollment,
      role: "student"
    }).select("name enrollment role session active");

    if (!user) {
      return res.status(404).send("Student account not found.");
    }

    // Account inactive hai
    if (user.active === false) {
      req.session.destroy(() => {});
      return res.status(403).send(
        "Your account has been deactivated."
      );
    }

    // Student ki attendance MongoDB se lao
    const attendance = await StudentAttendance.find({
      enrollment: user.enrollment
    })
      .sort({ date: -1 })
      .lean();

    // Total attendance
    const totalClasses = attendance.length;

    // Present count
    const presentClasses = attendance.filter(
      item => item.status === "Present"
    ).length;

    // Absent count
    const absentClasses = attendance.filter(
      item => item.status === "Absent"
    ).length;

    // Leave count
    const leaveClasses = attendance.filter(
      item => item.status === "Leave"
    ).length;

    // Attendance percentage
    const attendancePercentage =
      totalClasses > 0
        ? ((presentClasses / totalClasses) * 100).toFixed(2)
        : "0.00";

    return res.render("ERP/student-attendance", {
      erpUser: req.session.erpUser,
      user,
      attendance,
      stats: {
        totalClasses,
        presentClasses,
        absentClasses,
        leaveClasses,
        attendancePercentage
      }
    });

  } catch (error) {
    console.error("Student Attendance Error:", error);

    return res.status(500).send(
      "Unable to load student attendance."
    );
  }
};