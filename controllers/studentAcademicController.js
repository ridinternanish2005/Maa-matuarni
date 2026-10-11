import User from "../models/User.js";
import StudentProfile from "../models/StudentProfile.js";
import Course from "../models/Course.js";

// ==========================================
// STUDENT ACADEMIC MANAGEMENT PAGE
// ==========================================

export const getStudentAcademicManagement = async (req, res) => {
  try {
    const students = await User.find({
      role: "student"
    })
      .select("name enrollment session active")
      .sort({ name: 1 })
      .lean();

    const profiles = await StudentProfile.find({})
      .lean();

    const courses = await Course.find({
      active: true
    })
      .sort({ courseName: 1 })
      .lean();

    const studentList = students.map((student) => {
      const profile = profiles.find(
        (item) =>
          item.userId &&
          item.userId.toString() === student._id.toString()
      );

      return {
        ...student,
        profile: profile || null
      };
    });

    return res.render(
      "ERP/student-academic-management",
      {
        erpUser: req.session.erpUser,
        students: studentList,
        courses
      }
    );

  } catch (error) {

    console.error(
      "Student Academic Management Error:",
      error
    );

    return res.status(500).send(
      "Unable to load student academic management."
    );
  }
};


// ==========================================
// GET COURSES
// ==========================================

export const getAcademicCourses = async (req, res) => {
  try {

    const courses = await Course.find({
      active: true
    })
      .sort({ courseName: 1 })
      .lean();

    return res.json({
      success: true,
      courses
    });

  } catch (error) {

    console.error(
      "Get Academic Courses Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load courses."
    });
  }
};


// ==========================================
// ASSIGN COURSE + SEMESTER TO STUDENT
// ==========================================

export const assignStudentAcademic = async (req, res) => {
  try {

    const { studentId, courseId, semesterId } = req.body;

    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (!studentId || !courseId || !semesterId) {

      return res.status(400).json({
        success: false,
        message:
          "Student, course and semester are required."
      });
    }

    // ------------------------------------------
    // FIND STUDENT
    // ------------------------------------------

    const student = await User.findOne({
      _id: studentId,
      role: "student"
    });

    if (!student) {

      return res.status(404).json({
        success: false,
        message: "Student not found."
      });
    }

    // ------------------------------------------
    // FIND COURSE
    // ------------------------------------------

    const course = await Course.findOne({
      _id: courseId,
      active: true
    });

    if (!course) {

      return res.status(404).json({
        success: false,
        message: "Course not found."
      });
    }

    // ------------------------------------------
    // FIND SEMESTER
    // ------------------------------------------

    const semester = course.semesters.id(
      semesterId
    );

    if (!semester) {

      return res.status(404).json({
        success: false,
        message:
          "Selected semester does not belong to this course."
      });
    }

    if (semester.active === false) {

      return res.status(400).json({
        success: false,
        message: "Selected semester is inactive."
      });
    }

    // ------------------------------------------
    // CREATE / UPDATE STUDENT PROFILE
    // ------------------------------------------

    const profile =
      await StudentProfile.findOneAndUpdate(

        {
          userId: student._id
        },

        {
          userId: student._id,

          enrollment: student.enrollment,

          name: student.name,

          courseId: course._id,

          course: course.courseName,

          courseCode: course.courseCode,

          semesterId: semester._id,

          semester: semester.name,

          semesterNumber:
            semester.semesterNumber,

          active: student.active
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
        "Student course and semester assigned successfully.",

      profile
    });

  } catch (error) {

    console.error(
      "Assign Student Academic Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to assign course and semester."
    });
  }
};