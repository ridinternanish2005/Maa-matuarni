import User from "../models/User.js";
import StudentProfile from "../models/StudentProfile.js";
import StudentAttendance from "../models/StudentAttendance.js";
import StudentFee from "../models/StudentFee.js";

// ==========================================
// STUDENT DASHBOARD
// ==========================================

export const getStudentDashboard = async (req, res) => {
  try {
    // ------------------------------------------
    // LOGIN CHECK
    // ------------------------------------------
    if (!req.session?.erpUser) {
      return res.redirect("/erp");
    }

    const enrollment = req.session.erpUser.enrollment;

    // ------------------------------------------
    // FIND STUDENT USER
    // ------------------------------------------
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

    // ------------------------------------------
    // ACTIVE CHECK
    // ------------------------------------------
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
    // STUDENT FEES
    // ==========================================

    const fees = await StudentFee.find({
      enrollment: user.enrollment,
      session: user.session
    })
      .sort({ semester: 1 })
      .lean();

    // ------------------------------------------
    // TOTAL FEES
    // ------------------------------------------

    const totalFees = fees.reduce(
      (total, fee) => {
        return total + Number(fee.totalFees || 0);
      },
      0
    );

    // ------------------------------------------
    // PAID FEES
    // ------------------------------------------

    const paidFees = fees.reduce(
      (total, fee) => {
        return total + Number(fee.paidFees || 0);
      },
      0
    );

    // ------------------------------------------
    // PENDING FEES
    // ------------------------------------------

    const pendingFees = fees.reduce(
      (total, fee) => {
        return total + Number(fee.pendingFees || 0);
      },
      0
    );

    // ==========================================
    // LAST FIVE TRANSACTIONS
    // ==========================================

    const transactions = [];

    fees.forEach((fee) => {
      if (Array.isArray(fee.payments)) {
        fee.payments.forEach((payment) => {
          transactions.push({
            receiptNo: payment.receiptNo || "-",

            amount: Number(
              payment.amount || 0
            ),

            paymentDate:
              payment.paymentDate || null,

            paymentMode:
              payment.paymentMode || "-",

            status:
              payment.status || "Paid",

            semester:
              fee.semester || "-"
          });
        });
      }
    });

    // Latest transaction first
    transactions.sort(
      (a, b) => {
        return (
          new Date(b.paymentDate || 0) -
          new Date(a.paymentDate || 0)
        );
      }
    );

    // Only latest 5 transactions
    const lastFiveTransactions =
      transactions.slice(0, 5);

    // ==========================================
    // STUDENT ATTENDANCE
    // ==========================================

    const attendance =
      await StudentAttendance.find({
        enrollment: user.enrollment
      })
        .sort({ date: -1 })
        .lean();

    // ==========================================
    // ATTENDANCE CALCULATION
    // ==========================================

    const totalClasses =
      attendance.length;

    const presentClasses =
      attendance.filter(
        (item) =>
          item.status === "Present"
      ).length;

    const absentClasses =
      attendance.filter(
        (item) =>
          item.status === "Absent"
      ).length;

    const leaveClasses =
      attendance.filter(
        (item) =>
          item.status === "Leave"
      ).length;

    const attendancePercentage =
      totalClasses > 0
        ? (
            (presentClasses /
              totalClasses) *
            100
          ).toFixed(2)
        : "0.00";

    // ==========================================
    // ATTENDANCE STATS
    // ==========================================

    const attendanceStats = {
      totalClasses:
        totalClasses,

      presentClasses:
        presentClasses,

      absentClasses:
        absentClasses,

      leaveClasses:
        leaveClasses,

      attendancePercentage:
        attendancePercentage
    };

    // ==========================================
    // RENDER STUDENT DASHBOARD
    // ==========================================

    return res.render(
      "ERP/student",
      {
        erpUser:
          req.session.erpUser,

        user:
          user,

        profile:
          profile || {},

        attendanceStats:
          attendanceStats,

        fees:
          fees,

        totalFees:
          totalFees,

        paidFees:
          paidFees,

        pendingFees:
          pendingFees,

        lastFiveTransactions:
          lastFiveTransactions
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

export const getStudentProfile = async (
  req,
  res
) => {

  try {

    // ------------------------------------------
    // LOGIN CHECK
    // ------------------------------------------

    if (!req.session?.erpUser) {
      return res.redirect("/erp");
    }

    const enrollment =
      req.session.erpUser.enrollment;

    // ------------------------------------------
    // FIND STUDENT
    // ------------------------------------------

    const user =
      await User.findOne({
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

    // ------------------------------------------
    // ACTIVE CHECK
    // ------------------------------------------

    if (user.active === false) {

      req.session.destroy(() => {});

      return res.status(403).send(
        "Your account has been deactivated."
      );
    }

    // ------------------------------------------
    // GET PROFILE
    // ------------------------------------------

    const profile =
      await StudentProfile.findOne({
        enrollment: user.enrollment
      }).lean();

    // ------------------------------------------
    // RENDER PROFILE
    // ------------------------------------------

    return res.render(
      "ERP/student-profile",
      {
        erpUser:
          req.session.erpUser,

        user:
          user,

        profile:
          profile || {}
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

export const saveStudentProfile = async (
  req,
  res
) => {

  try {

    // ------------------------------------------
    // LOGIN CHECK
    // ------------------------------------------

    if (!req.session?.erpUser) {

      return res.status(401).json({
        success: false,
        message:
          "Please login first."
      });

    }

    const enrollment =
      req.session.erpUser.enrollment;

    // ------------------------------------------
    // FIND STUDENT
    // ------------------------------------------

    const user =
      await User.findOne({
        enrollment: enrollment,
        role: "student"
      });

    if (!user) {

      return res.status(404).json({
        success: false,
        message:
          "Student account not found."
      });

    }

    // ------------------------------------------
    // ACTIVE CHECK
    // ------------------------------------------

    if (user.active === false) {

      return res.status(403).json({
        success: false,
        message:
          "Your account has been deactivated."
      });

    }

    // ------------------------------------------
    // GET FORM DATA
    // ------------------------------------------

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

    // ------------------------------------------
    // SAVE / UPDATE PROFILE
    // ------------------------------------------

    const profile =
      await StudentProfile.findOneAndUpdate(

        {
          enrollment:
            user.enrollment
        },

        {

          userId:
            user._id,

          enrollment:
            user.enrollment,

          name:
            user.name,

          course:
            course?.trim() ||
            "D.Pharm",

          semester:
            semester?.trim() ||
            "1st Semester",

          mobile:
            mobile?.trim() ||
            "",

          email:
            email
              ?.trim()
              .toLowerCase() ||
            "",

          fatherName:
            fatherName?.trim() ||
            "",

          motherName:
            motherName?.trim() ||
            "",

          address:
            address?.trim() ||
            "",

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

    // ------------------------------------------
    // SUCCESS
    // ------------------------------------------

    return res.json({

      success: true,

      message:
        "Student profile saved successfully.",

      profile:
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