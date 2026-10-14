
import express from "express";
import User from "../models/User.js";
import FacultyProfile from "../models/FacultyProfile.js";
import Course from "../models/Course.js";
import StudentAttendance from "../models/StudentAttendance.js";
import StudentFee from "../models/StudentFee.js";
import Notice from "../models/Notice.js";

const router = express.Router();

router.get("/dashboard", async (req, res) => {
  try {
    // Check login
    if (!req.session?.erpUser) {
      return res.redirect("/erp");
    }

    // Principal access only
    if (
      String(req.session.erpUser.role || "").toLowerCase() !== "principal"
    ) {
      return res.status(403).send("Principal access only.");
    }

    const session = req.session.erpUser.session;

    // Load dashboard data
    const [
      students,
      faculty,
      courses,
      attendanceRecords,
      feeRecords,
      notices,
      recentStudents,
      recentNotices,
      facultyUsers,
      courseList,
      attendanceList,
      profiles
    ] = await Promise.all([
      User.countDocuments({
        role: "student",
        active: true,
        session
      }),

      User.countDocuments({
        role: "faculty",
        active: true,
        session
      }),

      Course.countDocuments({ active: true }),

      StudentAttendance.countDocuments({ session }),

      StudentFee.countDocuments({ session }),

      Notice.countDocuments({}),

      User.find({ role: "student", session })
        .select("name fullName enrollment enrollmentNumber session")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      Notice.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      User.find({ role: "faculty" })
        .select(
          "name fullName enrollment enrollmentNumber session active createdAt"
        )
        .sort({ createdAt: -1 })
        .lean(),

      Course.find({ active: true })
        .sort({ courseName: 1 })
        .lean(),

      StudentAttendance.find({ session })
        .sort({ date: -1 })
        .limit(100)
        .lean(),

      FacultyProfile.find({}).lean()
    ]);

    // Match faculty profiles with user IDs
    const profileMap = new Map();

    profiles.forEach((profile) => {
      if (profile.userId) {
        profileMap.set(String(profile.userId), profile);
      }
    });

    // Prepare faculty data
    const facultyList = facultyUsers.map((facultyUser) => {
      const profile =
        profileMap.get(String(facultyUser._id)) || {};

      return {
        _id: facultyUser._id,
        profileId: profile._id || null,
        hasProfile: Boolean(profile._id),

        name:
          facultyUser.name ||
          facultyUser.fullName ||
          profile.name ||
          profile.fullName ||
          "—",

        enrollment:
          facultyUser.enrollment ||
          facultyUser.enrollmentNumber ||
          profile.enrollment ||
          profile.enrollmentNumber ||
          "—",

        session: facultyUser.session || "—",
        active: facultyUser.active,

        department: profile.department || "—",
        designation: profile.designation || "Faculty",
        qualification: profile.qualification || "—",
        mobile: profile.mobile || "—",
        email: profile.email || "—"
      };
    });

const feeSummaryResult = await StudentFee.aggregate([
  {
    $match: {
      session: session,
      active: true
    }
  },
  {
    $group: {
      _id: null,
      totalFees: { $sum: "$totalFees" },
      paidFees: { $sum: "$paidFees" },
      pendingFees: { $sum: "$pendingFees" },
      records: { $sum: 1 }
    }
  }
]);

const feeSummary = feeSummaryResult[0] || {
  totalFees: 0,
  paidFees: 0,
  pendingFees: 0,
  records: 0
};

const feeList = await StudentFee.find({
  session: session,
  active: true
})
  .select(
    "studentName enrollment course semester totalFees paidFees pendingFees status"
  )
  .sort({ studentName: 1 })
  .lean();

  
const attendanceSummaryResult = await StudentAttendance.aggregate([
  {
    $match: {
      session: session
    }
  },
  {
    $group: {
      _id: null,
      present: {
        $sum: {
          $cond: [{ $eq: ["$status", "Present"] }, 1, 0]
        }
      },
      absent: {
        $sum: {
          $cond: [{ $eq: ["$status", "Absent"] }, 1, 0]
        }
      },
      leave: {
        $sum: {
          $cond: [{ $eq: ["$status", "Leave"] }, 1, 0]
        }
      },
      total: { $sum: 1 }
    }
  }
]);

const attendanceSummary = attendanceSummaryResult[0] || {
  present: 0,
  absent: 0,
  leave: 0,
  total: 0
};

attendanceSummary.percentage =
  attendanceSummary.total > 0
    ? Number(
        (
          (attendanceSummary.present / attendanceSummary.total) * 100
        ).toFixed(2)
      )
    : 0;

    // Render principal dashboard
  
return res.render("ERP/principal", {
  principal: {
    name: req.session.erpUser.name || "Principal",
    enrollment: req.session.erpUser.enrollment || "",
    role: req.session.erpUser.role,
    session
  },

  stats: {
    students: students || 0,
    faculty: faculty || 0,
    courses: courses || 0,
    attendanceRecords: attendanceRecords || 0,
    feeRecords: feeRecords || 0,
    notices: notices || 0
  },

  feeSummary,
  feeList,

  attendanceSummary,

  recentStudents: recentStudents || [],
  recentNotices: recentNotices || [],
  facultyList: facultyList || [],
  courseList: courseList || [],
  attendanceList: attendanceList || []
});

  } catch (error) {
    console.error("Principal Dashboard Error:", error);
    return res.status(500).send("Unable to load Principal Dashboard.");
  }
});

export default router;
