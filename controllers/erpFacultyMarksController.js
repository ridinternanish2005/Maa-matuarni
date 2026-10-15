import mongoose from "mongoose";

import User from "../models/User.js";
import FacultyProfile from "../models/FacultyProfile.js";
import FacultyMark from "../models/FacultyMark.js";
import Course from "../models/Course.js";

// Get one assigned subject by its ID
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

// Get all active subjects assigned to this faculty
async function getAssignedSubjectOptions(profile) {
  const assignments = profile?.subjectAssignments?.length
    ? profile.subjectAssignments
    : (profile?.subjects || []);

  const options = [];
  const seenIds = new Set();

  for (const assignment of assignments) {
    if (!assignment?.subjectId) continue;

    const subjectId = String(assignment.subjectId);

    if (seenIds.has(subjectId)) continue;

    const subject = await getAssignedSubjectDetails(
      profile,
      subjectId
    );

    if (subject) {
      options.push(subject);
      seenIds.add(subjectId);
    }
  }

  return options;
}

// GET: Marks page
export const getFacultyMarks = async (req, res) => {
  try {
    const enrollment = req.session?.erpUser?.enrollment;

    if (!enrollment) {
      return res.redirect("/erp/login");
    }

    const faculty = await User.findOne({
      enrollment: enrollment.toUpperCase(),
      role: "faculty",
      active: true
    });

    if (!faculty) {
      return res.status(403).send("Faculty account not found.");
    }

    const profile = await FacultyProfile.findOne({
      userId: faculty._id,
      active: true
    });

    if (!profile) {
      return res.status(404).send("Faculty profile not found.");
    }

    const [students, subjectOptions] = await Promise.all([
      User.find({
        role: "student",
        session: faculty.session,
        active: true
      })
        .select("_id name enrollment session")
        .sort({ enrollment: 1 })
        .lean(),

      getAssignedSubjectOptions(profile)
    ]);

    return res.render("ERP/faculty-marks", {
      erpUser: req.session.erpUser,
      faculty,
      profile,
      students,
      subjectOptions,
      message: null,
      error: null
    });
  } catch (error) {
    console.error("Get Faculty Marks Error:", error);
    return res.status(500).send("Unable to load marks page.");
  }
};

// POST: Save marks
export const saveFacultyMarks = async (req, res) => {
  try {
    const enrollment =
      req.session?.erpUser?.enrollment?.toUpperCase();

    if (!enrollment) {
      return res.redirect("/erp/login");
    }

    const faculty = await User.findOne({
      enrollment,
      role: "faculty",
      active: true
    });

    if (!faculty) {
      return res.status(403).send("Faculty account not found.");
    }

    const profile = await FacultyProfile.findOne({
      userId: faculty._id,
      active: true
    });

    if (!profile) {
      return res.status(404).send("Faculty profile not found.");
    }

    // The form sends the selected subject ID
    const { subject, examType, maxMarks, students } = req.body;

    if (!subject || !examType || !maxMarks) {
      return res.status(400).send(
        "Please select a subject, assessment and maximum marks."
      );
    }

    const max = Number(maxMarks);

    if (!Number.isFinite(max) || max <= 0) {
      return res.status(400).send("Invalid maximum marks.");
    }

    // Verify the selected ID belongs to this faculty
    const assignedSubject = await getAssignedSubjectDetails(
      profile,
      subject
    );

    if (!assignedSubject) {
      return res.status(403).send(
        "Selected subject is not assigned to this faculty, or it is inactive."
      );
    }

    if (!Array.isArray(students)) {
      return res.status(400).send("Student marks data is missing.");
    }

    let saved = 0;
    let updated = 0;

    for (const item of students) {
      if (!item?.enrollment) continue;

      // Do not treat a blank field as zero marks
      if (
        item.marks === undefined ||
        item.marks === null ||
        String(item.marks).trim() === ""
      ) {
        continue;
      }

      const marks = Number(item.marks);

      if (
        !Number.isFinite(marks) ||
        marks < 0 ||
        marks > max
      ) {
        continue;
      }

      const studentEnrollment = String(item.enrollment)
        .trim()
        .toUpperCase();

      const student = await User.findOne({
        enrollment: studentEnrollment,
        role: "student",
        session: faculty.session,
        active: true
      });

      if (!student) continue;

      // Store the actual subject name from the database
      const subjectName = assignedSubject.name;

      const existing = await FacultyMark.findOne({
        enrollment: student.enrollment,
        subject: subjectName,
        examType,
        session: faculty.session
      });

      await FacultyMark.findOneAndUpdate(
        {
          enrollment: student.enrollment,
          subject: subjectName,
          examType,
          session: faculty.session
        },
        {
          studentId: student._id,
          enrollment: student.enrollment,
          studentName: student.name,
          facultyId: faculty._id,
          facultyName: faculty.name,
          session: faculty.session,
          subject: subjectName,
          examType,
          maxMarks: max,
          marks,
          remarks: item.remarks || ""
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
          runValidators: true
        }
      );

      if (existing) {
        updated++;
      } else {
        saved++;
      }
    }

    return res.send(`
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><title>Marks Saved</title></head>
      <body>
        <script>
          alert("Marks saved successfully!\\nNew: ${saved}\\nUpdated: ${updated}");
          window.location.href = "/erp/faculty/marks";
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Save Faculty Marks Error:", error);
    return res.status(500).send("Unable to save marks.");
  }
};