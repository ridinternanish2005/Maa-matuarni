import User from "../models/User.js";
import FacultyProfile from "../models/FacultyProfile.js";
import StudentAttendance from "../models/StudentAttendance.js";


// ======================================================
// FACULTY ATTENDANCE PAGE
// ======================================================

export const getFacultyAttendance = async (req, res) => {
  try {
    if (!req.session?.erpUser) {
      return res.redirect("/erp");
    }

    const enrollment =
      req.session.erpUser.enrollment;

    // Faculty check
    const faculty = await User.findOne({
      enrollment: enrollment,
      role: "faculty",
      active: true
    })
      .select("name enrollment session active")
      .lean();

    if (!faculty) {
      return res.status(404).send(
        "Faculty account not found."
      );
    }

    // Faculty profile
    const profile = await FacultyProfile.findOne({
      userId: faculty._id
    }).lean();

    const subjects = profile?.subjects || [];

    // Current session ke active students
    const students = await User.find({
      role: "student",
      session: faculty.session,
      active: true
    })
      .select("name enrollment session")
      .sort({ name: 1 })
      .lean();

    return res.render(
      "ERP/faculty-attendance",
      {
        erpUser: req.session.erpUser,
        faculty,
        profile: profile || { subjects: [] },
        subjects,
        students
      }
    );

  } catch (error) {

    console.error(
      "Faculty Attendance Page Error:",
      error
    );

    return res.status(500).send(
      "Unable to load faculty attendance."
    );
  }
};


// ======================================================
// SAVE FACULTY ATTENDANCE
// ======================================================

export const saveFacultyAttendance = async (req, res) => {
  try {

    if (!req.session?.erpUser) {
      return res.status(401).json({
        success: false,
        message: "Please login first."
      });
    }

    const facultyEnrollment =
      req.session.erpUser.enrollment;

    const {
      date,
      subject,
      attendance
    } = req.body;


    // ------------------------------------------
    // BASIC VALIDATION
    // ------------------------------------------

    if (!date || !subject || !attendance) {
      return res.status(400).json({
        success: false,
        message:
          "Date, subject and attendance are required."
      });
    }


    // ------------------------------------------
    // FACULTY CHECK
    // ------------------------------------------

    const faculty = await User.findOne({
      enrollment: facultyEnrollment,
      role: "faculty",
      active: true
    })
      .select(
        "name enrollment session active"
      );


    if (!faculty) {
      return res.status(403).json({
        success: false,
        message:
          "Faculty account not found or inactive."
      });
    }


    // ------------------------------------------
    // CHECK ASSIGNED SUBJECT
    // ------------------------------------------

    const facultyProfile =
      await FacultyProfile.findOne({
        userId: faculty._id
      }).lean();


    const assignedSubjects =
      facultyProfile?.subjects || [];


    const selectedSubject =
      String(subject).trim();


    const hasSubject =
      assignedSubjects.some(
        (item) =>
          String(item).trim().toLowerCase() ===
          selectedSubject.toLowerCase()
      );


    if (!hasSubject) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to this subject."
      });
    }


    // ------------------------------------------
    // DATE VALIDATION
    // ------------------------------------------

    const attendanceDate =
      new Date(date);


    if (Number.isNaN(attendanceDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance date."
      });
    }


    // Date ko start of day par rakho
    attendanceDate.setHours(
      0,
      0,
      0,
      0
    );


    // ------------------------------------------
    // ATTENDANCE SAVE
    // ------------------------------------------

    let savedCount = 0;
    let updatedCount = 0;


    for (const item of attendance) {

      const studentEnrollment =
        String(
          item.enrollment || ""
        )
          .trim()
          .toUpperCase();


      const status =
        String(
          item.status || ""
        ).trim();


      if (!studentEnrollment) {
        continue;
      }


      // Status validation

      if (
        !["Present", "Absent", "Leave"]
          .includes(status)
      ) {
        continue;
      }


      // Student verify

      const student =
        await User.findOne({
          enrollment: studentEnrollment,
          role: "student",
          session: faculty.session,
          active: true
        }).select(
          "_id enrollment name session"
        );


      if (!student) {
        continue;
      }


      // Existing attendance check

      const existing =
        await StudentAttendance.findOne({
          enrollment:
            student.enrollment,

          date:
            attendanceDate,

          subject:
            selectedSubject
        });


      if (existing) {

        existing.studentId =
          student._id;

        existing.session =
          faculty.session;

        existing.status =
          status;

        await existing.save();

        updatedCount++;

      } else {

        await StudentAttendance.create({
          studentId:
            student._id,

          enrollment:
            student.enrollment,

          session:
            faculty.session,

          date:
            attendanceDate,

          status:
            status,

          subject:
            selectedSubject,

          remarks:
            `Marked by faculty ${faculty.name}`
        });

        savedCount++;
      }
    }


    return res.json({
      success: true,

      message:
        "Attendance saved successfully.",

      savedCount,
      updatedCount
    });


  } catch (error) {

    console.error(
      "Faculty Attendance Save Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to save attendance."
    });
  }
};