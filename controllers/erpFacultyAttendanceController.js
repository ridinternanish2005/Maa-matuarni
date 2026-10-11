
import mongoose from "mongoose";
import User from "../models/User.js";
import FacultyProfile from "../models/FacultyProfile.js";
import StudentAttendance from "../models/StudentAttendance.js";
import Course from "../models/Course.js";

// Find a subject that is actually assigned to this faculty.
async function getAssignedSubjectDetails(profile, selectedSubjectId) {
  const assignments = profile?.subjectAssignments?.length
    ? profile.subjectAssignments
    : (profile?.subjects || []);

  for (const assignment of assignments) {
    const courseId = assignment.courseId;
    const semesterId = assignment.semesterId;
    const subjectId = assignment.subjectId;

    if (!courseId || !semesterId || !subjectId) continue;

    if (
      !mongoose.isValidObjectId(courseId) ||
      !mongoose.isValidObjectId(semesterId) ||
      !mongoose.isValidObjectId(subjectId)
    ) {
      continue;
    }

    if (String(subjectId) !== String(selectedSubjectId)) {
      continue;
    }

    const course = await Course.findById(courseId).lean();

    if (!course || !course.active) continue;

    const semester = (course.semesters || []).find(
      (item) =>
        String(item._id) === String(semesterId) &&
        item.active
    );

    if (!semester) continue;

    const subject = (semester.subjects || []).find(
      (item) =>
        String(item._id) === String(subjectId) &&
        item.active
    );

    if (!subject) continue;

    return {
      subjectId: String(subject._id),
      name: subject.name,
      code: subject.code || "",
      label: `${subject.name}${subject.code ? ` (${subject.code})` : ""}`
    };
  }

  return null;
}

// ========================================
// FACULTY ATTENDANCE PAGE
// ========================================

export const getFacultyAttendance = async (req, res) => {
  try {
    if (!req.session?.erpUser) {
      return res.redirect("/erp");
    }

    const enrollment = req.session.erpUser.enrollment;

    const faculty = await User.findOne({
      enrollment,
      role: "faculty",
      active: true
    })
      .select("name enrollment session active")
      .lean();

    if (!faculty) {
      return res.status(404).send("Faculty account not found.");
    }

    const profile = await FacultyProfile.findOne({
      userId: faculty._id
    }).lean();

    const assignments = profile?.subjectAssignments?.length
      ? profile.subjectAssignments
      : (profile?.subjects || []);

    const subjects = [];

    for (const assignment of assignments) {
      const details = await getAssignedSubjectDetails(
        { subjectAssignments: [assignment] },
        assignment.subjectId
      );

      if (
        details &&
        !subjects.some((item) => item.subjectId === details.subjectId)
      ) {
        subjects.push(details);
      }
    }

    const students = await User.find({
      role: "student",
      session: faculty.session,
      active: true
    })
      .select("name enrollment session")
      .sort({ name: 1 })
      .lean();

    return res.render("ERP/faculty-attendance", {
      erpUser: req.session.erpUser,
      faculty,
      profile: profile || { subjects: [] },
      subjects,
      students
    });
  } catch (error) {
    console.error("Faculty Attendance Page Error:", error);
    return res.status(500).send(
      "Unable to load faculty attendance."
    );
  }
};

// ========================================
// SAVE FACULTY ATTENDANCE
// ========================================

export const saveFacultyAttendance = async (req, res) => {
  try {
    if (!req.session?.erpUser) {
      return res.status(401).json({
        success: false,
        message: "Please login first."
      });
    }

    const facultyEnrollment = req.session.erpUser.enrollment;
    const { date, subject, attendance } = req.body;

    if (
      !date ||
      !subject ||
      !Array.isArray(attendance) ||
      attendance.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Date, subject and attendance are required."
      });
    }

    const faculty = await User.findOne({
      enrollment: facultyEnrollment,
      role: "faculty",
      active: true
    }).select("name enrollment session active");

    if (!faculty) {
      return res.status(403).json({
        success: false,
        message: "Faculty account not found or inactive."
      });
    }

    if (!mongoose.isValidObjectId(subject)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject selected. Please select again."
      });
    }

    const facultyProfile = await FacultyProfile.findOne({
      userId: faculty._id
    }).lean();

    const selectedSubject = await getAssignedSubjectDetails(
      facultyProfile,
      subject
    );

    if (!selectedSubject) {
      return res.status(403).json({
        success: false,
        message: "This subject is not assigned to you or is inactive."
      });
    }

    const attendanceDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(attendanceDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance date."
      });
    }

    let savedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const item of attendance) {
      const studentEnrollment = String(item.enrollment || "")
        .trim()
        .toUpperCase();

      const status = String(item.status || "").trim();

      if (
        !studentEnrollment ||
        !["Present", "Absent", "Leave"].includes(status)
      ) {
        skippedCount++;
        continue;
      }

      const student = await User.findOne({
        enrollment: studentEnrollment,
        role: "student",
        session: faculty.session,
        active: true
      }).select("_id enrollment name session");

      if (!student) {
        skippedCount++;
        continue;
      }

      const existing = await StudentAttendance.findOne({
        enrollment: student.enrollment,
        date: attendanceDate,
        subject: selectedSubject.label
      });

      if (existing) {
        existing.studentId = student._id;
        existing.session = faculty.session;
        existing.status = status;
        existing.remarks = `Marked by faculty ${faculty.name}`;

        await existing.save();
        updatedCount++;
      } else {
        await StudentAttendance.create({
          studentId: student._id,
          enrollment: student.enrollment,
          session: faculty.session,
          date: attendanceDate,
          status,
          subject: selectedSubject.label,
          remarks: `Marked by faculty ${faculty.name}`
        });

        savedCount++;
      }
    }

    return res.json({
      success: true,
      message: "Attendance saved successfully.",
      savedCount,
      updatedCount,
      skippedCount
    });
  } catch (error) {
    console.error("Faculty Attendance Save Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save attendance. Check the server terminal."
    });
  }
};
