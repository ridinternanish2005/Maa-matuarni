import User from "../models/User.js";
import FacultyMark from "../models/FacultyMark.js";
import StudentProfile from "../models/StudentProfile.js";

export const getStudentResults = async (req, res) => {
  try {
    const enrollment =
      req.session?.erpUser?.enrollment?.toUpperCase();

    if (!enrollment) {
      return res.redirect("/erp/login");
    }

    const student = await User.findOne({
      enrollment,
      role: "student",
      active: true,
    }).select("_id name enrollment session");

    if (!student) {
      return res.status(404).send("Student not found.");
    }

    const marks = await FacultyMark.find({
      studentId: student._id,
      enrollment: student.enrollment,
      session: student.session,
    })
      .sort({
        subject: 1,
        examType: 1,
      })
      .lean();

    // Subject-wise total
    const subjectMap = {};

    marks.forEach((item) => {
      if (!subjectMap[item.subject]) {
        subjectMap[item.subject] = {
          subject: item.subject,
          maxMarks: 0,
          obtainedMarks: 0,
        };
      }

      subjectMap[item.subject].maxMarks += Number(item.maxMarks);
      subjectMap[item.subject].obtainedMarks += Number(item.marks);
    });

    const subjectResults = Object.values(subjectMap);

    let totalMaxMarks = 0;
    let totalObtainedMarks = 0;

    subjectResults.forEach((item) => {
      totalMaxMarks += item.maxMarks;
      totalObtainedMarks += item.obtainedMarks;
    });

    const percentage =
      totalMaxMarks > 0
        ? ((totalObtainedMarks / totalMaxMarks) * 100).toFixed(2)
        : "0.00";

    return res.render("ERP/student-results", {
      erpUser: req.session.erpUser,
      student,
      marks,
      subjectResults,
      totalMaxMarks,
      totalObtainedMarks,
      percentage,
    });

  } catch (error) {
    console.error("Student Result Error:", error);
    return res.status(500).send("Unable to load results.");
  }
};

export const getStudentResultsData = async (req, res) => {
  try {
    const enrollment =
      req.session?.erpUser?.enrollment?.toUpperCase();

    if (!enrollment) {
      return res.status(401).json({
        success: false,
        message: "Student not logged in.",
      });
    }

    const student = await User.findOne({
      enrollment,
      role: "student",
      active: true,
    }).select("_id name enrollment session");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const profile = await StudentProfile.findOne({
      userId: student._id,
      enrollment: student.enrollment,
    }).lean();

    const semester = profile?.semester || "1st Semester";

    const marks = await FacultyMark.find({
      studentId: student._id,
      enrollment: student.enrollment,
      session: student.session,
    })
      .sort({
        subject: 1,
        examType: 1,
      })
      .lean();

    let totalMaxMarks = 0;
    let totalObtainedMarks = 0;

    marks.forEach((item) => {
      totalMaxMarks += Number(item.maxMarks || 0);
      totalObtainedMarks += Number(item.marks || 0);
    });

    const percentage =
      totalMaxMarks > 0
        ? ((totalObtainedMarks / totalMaxMarks) * 100).toFixed(2)
        : "0.00";

    return res.json({
      success: true,
      student: {
        name: student.name,
        enrollment: student.enrollment,
        session: student.session,
        semester,
      },
      marks,
      totalMaxMarks,
      totalObtainedMarks,
      percentage,
    });

  } catch (error) {
    console.error("Student Result Data Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load result data.",
    });
  }
};