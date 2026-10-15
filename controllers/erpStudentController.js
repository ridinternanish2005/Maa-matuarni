
import User from "../models/User.js";
import StudentProfile from "../models/StudentProfile.js";
import StudentAttendance from "../models/StudentAttendance.js";
import StudentFee from "../models/StudentFee.js";

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
      enrollment,
      role: "student"
    }).select("name enrollment role session active");

    if (!user) {
      return res.status(404).send("Student account not found.");
    }

    if (user.active === false) {
      req.session.destroy(() => {});
      return res.status(403).send("Your account has been deactivated.");
    }

    // STUDENT PROFILE: Dashboard only reads the profile
    const profile = await StudentProfile.findOne({
  userId: user._id,
  enrollment: user.enrollment
}).lean();

    // STUDENT FEES
    const fees = await StudentFee.find({
      enrollment: user.enrollment,
      session: user.session
    })
      .sort({ semester: 1 })
      .lean();

    const totalFees = fees.reduce(
      (total, fee) => total + Number(fee.totalFees || 0),
      0
    );

    const paidFees = fees.reduce(
      (total, fee) => total + Number(fee.paidFees || 0),
      0
    );

    const pendingFees = fees.reduce(
      (total, fee) => total + Number(fee.pendingFees || 0),
      0
    );

    // LAST FIVE TRANSACTIONS
    const transactions = [];

    fees.forEach((fee) => {
      if (Array.isArray(fee.payments)) {
        fee.payments.forEach((payment) => {
          transactions.push({
            receiptNo: payment.receiptNo || "-",
            amount: Number(payment.amount || 0),
            paymentDate: payment.paymentDate || null,
            paymentMode: payment.paymentMode || "-",
            status: payment.status || "Paid",
            semester: fee.semester || "-"
          });
        });
      }
    });

    transactions.sort(
      (a, b) =>
        new Date(b.paymentDate || 0) -
        new Date(a.paymentDate || 0)
    );

    const lastFiveTransactions = transactions.slice(0, 5);

    // STUDENT ATTENDANCE
    const attendance = await StudentAttendance.find({
      enrollment: user.enrollment,
      session: user.session
    })
      .sort({ date: -1 })
      .lean();

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
        ? ((presentClasses / totalClasses) * 100).toFixed(2)
        : "0.00";

    const attendanceStats = {
      totalClasses,
      presentClasses,
      absentClasses,
      leaveClasses,
      attendancePercentage
    };
return res.render("ERP/student", {
  erpUser: req.session.erpUser,
  user,
  profile: profile || {},
  attendanceStats,
  attendance,
  fees,
  totalFees,
  paidFees,
  pendingFees,
  lastFiveTransactions
});
  } catch (error) {
    console.error("Student Dashboard Error:", error);
    return res.status(500).send("Unable to load student dashboard.");
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

    const enrollment = req.session.erpUser.enrollment;

    const user = await User.findOne({
      enrollment,
      role: "student"
    }).select("name enrollment role session active");

    if (!user) {
      return res.status(404).send("Student account not found.");
    }

    if (user.active === false) {
      req.session.destroy(() => {});
      return res.status(403).send("Your account has been deactivated.");
    }

    // Supports profiles created before userId was added
    const profile = await StudentProfile.findOne({
      $or: [
        { userId: user._id },
        { enrollment: user.enrollment }
      ]
    }).lean();

    return res.render("ERP/student-profile", {
      erpUser: req.session.erpUser,
      user,
      profile: profile || {}
    });
  } catch (error) {
    console.error("Student Profile Error:", error);
    return res.status(500).send("Unable to load student profile.");
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

    const enrollment = req.session.erpUser.enrollment;

    const user = await User.findOne({
      enrollment,
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

    // Validate date before saving
    let parsedAdmissionDate = null;

    if (admissionDate) {
      parsedAdmissionDate = new Date(admissionDate);

      if (Number.isNaN(parsedAdmissionDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid admission date."
        });
      }
    }

    // Find existing profile by userId OR legacy enrollment
    const existingProfile = await StudentProfile.findOne({
      $or: [
        { userId: user._id },
        { enrollment: user.enrollment }
      ]
    }).select("_id");

    const profile = await StudentProfile.findOneAndUpdate(
      existingProfile
        ? { _id: existingProfile._id }
        : { enrollment: user.enrollment },
      {
        $set: {
          userId: user._id,
          enrollment: user.enrollment,
          name: user.name,
          course: course?.trim() || "D.Pharm",
          semester: semester?.trim() || "1st Semester",
          mobile: mobile?.trim() || "",
          email: email?.trim().toLowerCase() || "",
          fatherName: fatherName?.trim() || "",
          motherName: motherName?.trim() || "",
          address: address?.trim() || "",
          admissionDate: parsedAdmissionDate
        }
      },
      {
        new: true,
        upsert: !existingProfile,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    return res.json({
      success: true,
      message: "Student profile saved successfully.",
      profile
    });
  } catch (error) {
    console.error("Save Student Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save student profile."
    });
  }
};
