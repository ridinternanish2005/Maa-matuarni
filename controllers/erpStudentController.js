import User from "../models/User.js";
import StudentProfile from "../models/StudentProfile.js";
import StudentAttendance from "../models/StudentAttendance.js";

// ==========================================
// STUDENT DASHBOARD
// ==========================================

export const getStudentDashboard = async (req, res) => {
  try {
    if (!req.session?.erpUser) {
      return res.redirect("/erp");
    }

    const enrollment = req.session.erpUser.enrollment;

    const user = await User.findOne({
      enrollment: enrollment,
      role: "student"
    }).select(
      "name enrollment role session active"
    );

    if (!user) {
      return res.status(404).send(
        "Student account not found."
      );
    }

    if (user.active === false) {
      req.session.destroy(() => {});

      return res.status(403).send(
        "Your account has been deactivated."
      );
    }

    // ==========================================
    // STUDENT PROFILE
    // ==========================================

    const profile = await StudentProfile.findOne({
      enrollment: user.enrollment
    }).lean();

    // ==========================================
    // ATTENDANCE
    // ==========================================

    const attendance = await StudentAttendance.find({
      enrollment: user.enrollment
    })
      .sort({ date: -1 })
      .lean();

    // ==========================================
    // ATTENDANCE CALCULATION
    // ==========================================

    const totalClasses = attendance.length;

    const presentClasses = attendance.filter(
      (item) => item.status === "Present"
    ).length;

    const absentClasses = attendance.filter(
      (item) => item.status === "Absent"
    ).length;

    const leaveClasses = attendance.filter(
      (item) => item.status === "Leave"
    ).length;

    const attendancePercentage =
      totalClasses > 0
        ? (
            (presentClasses / totalClasses) * 100
          ).toFixed(2)
        : "0.00";

    // ==========================================
    // ATTENDANCE STATS
    // ==========================================

    const attendanceStats = {
      totalClasses: totalClasses,
      presentClasses: presentClasses,
      absentClasses: absentClasses,
      leaveClasses: leaveClasses,
      attendancePercentage: attendancePercentage
    };

    // ==========================================
    // STUDENT DASHBOARD
    // ==========================================

    return res.render(
      "ERP/student",
      {
        erpUser: req.session.erpUser,

        user: user,

        profile: profile || {},

        attendanceStats: safeAttendanceStats
      }
    );

  } catch (error) {

    console.error(
      "Student Dashboard Error:",
      error
    );

    return res.status(500).send(
      "Unable to load student dashboard."
    );
  }
};


// ==========================================
// STUDENT PROFILE PAGE
// ==========================================

export const getStudentProfile = async (req, res) => {
  try {

    if (!req.session?.erpUser) {
      return res.redirect("/erp");
    }

    const enrollment =
      req.session.erpUser.enrollment;

    const user = await User.findOne({
      enrollment: enrollment,
      role: "student"
    }).select(
      "name enrollment role session active"
    );

    if (!user) {
      return res.status(404).send(
        "Student account not found."
      );
    }

    if (user.active === false) {
      req.session.destroy(() => {});

      return res.status(403).send(
        "Your account has been deactivated."
      );
    }

    const profile = await StudentProfile.findOne({
      enrollment: user.enrollment
    }).lean();

    return res.render(
      "ERP/student-profile",
      {
        erpUser: req.session.erpUser,

        user: user,

        profile: profile || {}
      }
    );

  } catch (error) {

    console.error(
      "Student Profile Error:",
      error
    );

    return res.status(500).send(
      "Unable to load student profile."
    );
  }
};


// ==========================================
// SAVE STUDENT PROFILE
// ==========================================

export const saveStudentProfile = async (req, res) => {
  try {

    if (!req.session?.erpUser) {
      return res.status(401).json({
        success: false,
        message: "Please login first."
      });
    }

    const enrollment =
      req.session.erpUser.enrollment;

    const user = await User.findOne({
      enrollment: enrollment,
      role: "student"
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student account not found."
      });
    }

    if (user.active === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated."
      });
    }

    const {
      course,
      semester,
      mobile,
      email,
      fatherName,
      motherName,
      address,
      admissionDate
    } = req.body;

    const profile =
      await StudentProfile.findOneAndUpdate(
        {
          enrollment: user.enrollment
        },
        {
          userId: user._id,

          enrollment: user.enrollment,

          name: user.name,

          course:
            course?.trim() || "D.Pharm",

          semester:
            semester?.trim() || "1st Semester",

          mobile:
            mobile?.trim() || "",

          email:
            email?.trim().toLowerCase() || "",

          fatherName:
            fatherName?.trim() || "",

          motherName:
            motherName?.trim() || "",

          address:
            address?.trim() || "",

          admissionDate:
            admissionDate
              ? new Date(admissionDate)
              : null
        },
        {
          new: true,
          upsert: true,
          runValidators: true
        }
      );

    return res.json({
      success: true,
      message:
        "Student profile saved successfully.",
      profile
    });

  } catch (error) {

    console.error(
      "Save Student Profile Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to save student profile."
    });
  }
};