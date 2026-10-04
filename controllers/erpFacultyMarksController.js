import User from "../models/User.js";
import FacultyProfile from "../models/FacultyProfile.js";
import FacultyMark from "../models/FacultyMark.js";

export const getFacultyMarks = async (req, res) => {
  try {
    const enrollment = req.session?.erpUser?.enrollment;

    if (!enrollment) {
      return res.redirect("/erp/login");
    }

    const faculty = await User.findOne({
      enrollment: enrollment.toUpperCase(),
      role: "faculty",
      active: true,
    });

    if (!faculty) {
      return res.status(403).send("Faculty account not found.");
    }

    const profile = await FacultyProfile.findOne({
      userId: faculty._id,
    });

    if (!profile) {
      return res.status(404).send("Faculty profile not found.");
    }

    const students = await User.find({
      role: "student",
      session: faculty.session,
      active: true,
    })
      .select("_id name enrollment session")
      .sort({ enrollment: 1 });

    return res.render("ERP/faculty-marks", {
      erpUser: req.session.erpUser,
      faculty,
      profile,
      students,
      message: null,
      error: null,
    });
  } catch (error) {
    console.error("Faculty Marks Page Error:", error);

    return res.status(500).send("Unable to load marks page.");
  }
};


export const saveFacultyMarks = async (req, res) => {
  try {
    const facultyEnrollment =
      req.session?.erpUser?.enrollment?.toUpperCase();

    if (!facultyEnrollment) {
      return res.redirect("/erp/login");
    }

    const faculty = await User.findOne({
      enrollment: facultyEnrollment,
      role: "faculty",
      active: true,
    });

    if (!faculty) {
      return res.status(403).send("Faculty account not found.");
    }

    const profile = await FacultyProfile.findOne({
      userId: faculty._id,
    });

    if (!profile) {
      return res.status(404).send("Faculty profile not found.");
    }

    const {
      subject,
      examType,
      maxMarks,
      students,
    } = req.body;

    if (!subject || !examType || !maxMarks || !students) {
      return res.status(400).send("Required fields are missing.");
    }

    const max = Number(maxMarks);

    if (!Number.isFinite(max) || max <= 0) {
      return res.status(400).send("Invalid maximum marks.");
    }

    // Check faculty subject
    const allowedSubject = profile.subjects.some(
      (item) =>
        item.trim().toLowerCase() === subject.trim().toLowerCase()
    );

    if (!allowedSubject) {
      return res
        .status(403)
        .send("You are not assigned this subject.");
    }

    let saved = 0;
    let updated = 0;

    for (const item of students) {
      if (!item.enrollment) continue;

      const marks = Number(item.marks);

      if (!Number.isFinite(marks)) continue;

      if (marks < 0 || marks > max) {
        continue;
      }

      const student = await User.findOne({
        enrollment: item.enrollment.toUpperCase(),
        role: "student",
        session: faculty.session,
        active: true,
      });

      if (!student) continue;

      const existing = await FacultyMark.findOne({
        enrollment: student.enrollment,
        subject,
        examType,
        session: faculty.session,
      });

      await FacultyMark.findOneAndUpdate(
        {
          enrollment: student.enrollment,
          subject,
          examType,
          session: faculty.session,
        },
        {
          studentId: student._id,
          enrollment: student.enrollment,
          studentName: student.name,

          facultyId: faculty._id,
          facultyName: faculty.name,

          session: faculty.session,

          subject,
          examType,
          maxMarks: max,
          marks,

          remarks: item.remarks || "",
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      if (existing) {
        updated++;
      } else {
        saved++;
      }
    }

    return res.send(`
      <script>
        alert("Marks saved successfully!\\nNew: ${saved}\\nUpdated: ${updated}");
        window.location.href = "/erp/faculty/marks";
      </script>
    `);

  } catch (error) {
    console.error("Save Faculty Marks Error:", error);

    return res.status(500).send("Unable to save marks.");
  }
};