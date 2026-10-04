import User from "../models/User.js";
import StudentResult from "../models/StudentResult.js";
import FacultyMark from "../models/FacultyMark.js";
import StudentProfile from "../models/StudentProfile.js";


// ======================================================
// GRADE CALCULATION
// ======================================================
const calculateGrade = (percentage) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
};


// ======================================================
// ADMIN RESULT MANAGEMENT PAGE
// ======================================================
export const getResultManagement = async (req, res) => {
  try {
   return res.render("ERP/student-results", {
      erpUser: req.session.erpUser
    });
  } catch (error) {
    console.error("Result Management Page Error:", error);

    return res.status(500).send(
      "Unable to load result management page."
    );
  }
};


// ======================================================
// SAVE / UPDATE RESULT
// ======================================================
export const saveStudentResult = async (req, res) => {
  try {

    const {
      enrollment,
      semester,
      examName,
      subject,
      maxMarks,
      obtainedMarks,
      remarks
    } = req.body;


    // ---------------------------------------------
    // REQUIRED FIELDS
    // ---------------------------------------------
    if (
      !enrollment ||
      !semester ||
      !examName ||
      !subject ||
      maxMarks === undefined ||
      obtainedMarks === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are required."
      });
    }


    // ---------------------------------------------
    // FIND STUDENT
    // ---------------------------------------------
    const student = await User.findOne({
      enrollment: enrollment.trim().toUpperCase(),
      role: "student",
      active: true
    });


    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found."
      });
    }


    // ---------------------------------------------
    // MARKS VALIDATION
    // ---------------------------------------------
    const max = Number(maxMarks);
    const obtained = Number(obtainedMarks);


    if (
      Number.isNaN(max) ||
      Number.isNaN(obtained)
    ) {
      return res.status(400).json({
        success: false,
        message: "Marks must be valid numbers."
      });
    }


    if (max <= 0) {
      return res.status(400).json({
        success: false,
        message: "Maximum marks must be greater than 0."
      });
    }


    if (obtained < 0 || obtained > max) {
      return res.status(400).json({
        success: false,
        message:
          "Obtained marks cannot be greater than maximum marks."
      });
    }


    // ---------------------------------------------
    // PERCENTAGE
    // ---------------------------------------------
    const percentage =
      (obtained / max) * 100;


    const grade =
      calculateGrade(percentage);


    const status =
      percentage >= 40
        ? "Pass"
        : "Fail";


    // ---------------------------------------------
    // SAVE / UPDATE
    // ---------------------------------------------
    const result =
      await StudentResult.findOneAndUpdate(
        {
          enrollment: student.enrollment,
          semester: semester.trim(),
          examName: examName.trim(),
          subject: subject.trim()
        },
        {
          studentId: student._id,

          enrollment: student.enrollment,

          studentName: student.name,

          course: "D.Pharm",

          session: student.session,

          semester: semester.trim(),

          examName: examName.trim(),

          subject: subject.trim(),

          maxMarks: max,

          obtainedMarks: obtained,

          grade: grade,

          status: status,

          remarks: remarks?.trim() || ""
        },
        {
          new: true,
          upsert: true,
          runValidators: true
        }
      );


    return res.status(200).json({
      success: true,
      message: "Student result saved successfully.",
      result: result
    });


  } catch (error) {

    console.error(
      "Save Student Result Error:",
      error
    );


    return res.status(500).json({
      success: false,
      message: "Unable to save student result."
    });
  }
};


// ======================================================
// GET ALL RESULTS
// ======================================================
export const getAllResults = async (req, res) => {
  try {

    const results =
      await StudentResult.find()
        .sort({
          createdAt: -1
        })
        .lean();


    return res.json({
      success: true,
      results: results
    });


  } catch (error) {

    console.error(
      "Get All Results Error:",
      error
    );


    return res.status(500).json({
      success: false,
      message: "Unable to fetch results."
    });
  }
};


// ======================================================
// STUDENT RESULT PAGE
// ======================================================
// ======================================================
// STUDENT RESULT PAGE
// ======================================================
export const getStudentResults = async (req, res) => {
  try {
    if (!req.session?.erpUser) {
      return res.redirect("/erp");
    }

    const enrollment =
      req.session.erpUser.enrollment?.trim().toUpperCase();

    if (!enrollment) {
      return res.redirect("/erp");
    }

    // ---------------------------------------------
    // FIND STUDENT
    // ---------------------------------------------
    const user = await User.findOne({
      enrollment,
      role: "student",
    }).lean();

    if (!user) {
      return res.status(404).send(
        "Student account not found."
      );
    }
    const studentProfile = await StudentProfile.findOne({
  userId: user._id,
  enrollment: user.enrollment
}).lean();

const semester = studentProfile?.semester || "1st Semester";

    // ---------------------------------------------
    // CHECK ACTIVE ACCOUNT
    // ---------------------------------------------
    if (user.active === false) {
      req.session.destroy(() => {});

      return res.status(403).send(
        "Your account has been deactivated."
      );
    }

    // ==================================================
    // GET FACULTY UPLOADED MARKS
    // ==================================================

    const facultyMarks = await FacultyMark.find({
      studentId: user._id,
      enrollment: user.enrollment,
      session: user.session,
    })
      .sort({
        subject: 1,
        examType: 1,
      })
      .lean();


    // ==================================================
    // CONVERT FACULTY MARKS TO RESULT FORMAT
    // ==================================================

    let finalResults = [];

    if (facultyMarks.length > 0) {

      const groupedResults = {};

      facultyMarks.forEach((mark) => {

        // Exam type ko exam name maan rahe hain
        const key = mark.examType || "Assessment";

        if (!groupedResults[key]) {

          groupedResults[key] = {
           semester: semester,

            examName:
              mark.examType || "Assessment",

            results: [],

            totalMarks: 0,

            obtainedMarks: 0,
          };
        }


        const maxMarks =
          Number(mark.maxMarks || 0);

        const obtainedMarks =
          Number(mark.marks || 0);


        const percentage =
          maxMarks > 0
            ? (obtainedMarks / maxMarks) * 100
            : 0;


        const grade =
          calculateGrade(percentage);


        const status =
          percentage >= 40
            ? "Pass"
            : "Fail";


        groupedResults[key].results.push({

          subject:
            mark.subject || "N/A",

          maxMarks,

          obtainedMarks,

          grade,

          status,

          remarks:
            mark.remarks || "",
        });


        groupedResults[key].totalMarks +=
          maxMarks;


        groupedResults[key].obtainedMarks +=
          obtainedMarks;

      });


      // ---------------------------------------------
      // FINAL RESULT SUMMARY
      // ---------------------------------------------

      finalResults =
        Object.values(groupedResults);


      finalResults.forEach((group) => {

        group.percentage =
          group.totalMarks > 0
            ? (
                (group.obtainedMarks /
                  group.totalMarks) *
                100
              ).toFixed(2)
            : "0.00";


        group.grade =
          calculateGrade(
            Number(group.percentage)
          );


        group.status =
          group.results.some(
            (item) =>
              item.status === "Fail"
          )
            ? "Fail"
            : "Pass";

      });

    }


    // ==================================================
    // FALLBACK: OLD STUDENT RESULT SYSTEM
    // ==================================================

    if (facultyMarks.length === 0) {

      const results =
        await StudentResult.find({
          enrollment: user.enrollment,
          session: user.session,
        })
          .sort({
            semester: 1,
            examName: 1,
            subject: 1,
          })
          .lean();


      const groupedResults = {};


      results.forEach((result) => {

        const key =
          `${result.semester}__${result.examName}`;


        if (!groupedResults[key]) {

          groupedResults[key] = {

            semester:
              result.semester,

            examName:
              result.examName,

            results: [],

            totalMarks: 0,

            obtainedMarks: 0,
          };

        }


        groupedResults[key].results.push({

          subject:
            result.subject,

          maxMarks:
            Number(result.maxMarks || 0),

          obtainedMarks:
            Number(result.obtainedMarks || 0),

          grade:
            result.grade || "N/A",

          status:
            result.status || "Fail",

          remarks:
            result.remarks || "",
        });


        groupedResults[key].totalMarks +=
          Number(result.maxMarks || 0);


        groupedResults[key].obtainedMarks +=
          Number(result.obtainedMarks || 0);

      });


      finalResults =
        Object.values(groupedResults);


      finalResults.forEach((group) => {

        group.percentage =
          group.totalMarks > 0
            ? (
                (group.obtainedMarks /
                  group.totalMarks) *
                100
              ).toFixed(2)
            : "0.00";


        group.grade =
          calculateGrade(
            Number(group.percentage)
          );


        group.status =
          group.results.some(
            (item) =>
              item.status === "Fail"
          )
            ? "Fail"
            : "Pass";

      });

    }


    // ==================================================
    // RENDER STUDENT RESULT PAGE
    // ==================================================

    return res.render(
      "ERP/student-results",
      {
        erpUser: req.session.erpUser,

        user: user,

        results: finalResults,
      }
    );


  } catch (error) {

    console.error(
      "Student Results Error:",
      error
    );

    return res.status(500).send(
      "Unable to load student results."
    );
  }
};