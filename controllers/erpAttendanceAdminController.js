import User from "../models/User.js";
import StudentAttendance from "../models/StudentAttendance.js";

// ==========================================
// MARK ATTENDANCE PAGE
// ==========================================

export const showMarkAttendance = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      active: true
    })
      .select("name enrollment session")
      .sort({ name: 1 })
      .lean();

    return res.render("ERP/mark-attendance", {
      erpUser: req.session.erpUser,
      students
    });

  } catch (error) {
    console.error("Mark Attendance Page Error:", error);
    return res.status(500).send("Unable to load attendance page.");
  }
};


// ==========================================
// SAVE ATTENDANCE
// ==========================================

export const saveAttendance = async (req, res) => {
  try {
    const {
      enrollment,
      date,
      status,
      subject,
      remarks
    } = req.body;

    if (!enrollment || !date || !status || !subject) {
      return res.status(400).json({
        success: false,
        message: "Student, date, status and subject are required."
      });
    }

    if (!["Present", "Absent", "Leave"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance status."
      });
    }

    // Student check
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

    // Date ko safely create karo
    const attendanceDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(attendanceDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date."
      });
    }

    // Same student + date + subject already exists?
    const existingAttendance = await StudentAttendance.findOne({
      enrollment: student.enrollment,
      date: attendanceDate,
      subject: subject.trim()
    });

    if (existingAttendance) {
      // Existing record update
      existingAttendance.status = status;
      existingAttendance.remarks = remarks?.trim() || "";

      await existingAttendance.save();

      return res.json({
        success: true,
        message: "Attendance updated successfully."
      });
    }

    // New attendance
    await StudentAttendance.create({
      studentId: student._id,
      enrollment: student.enrollment,
      session: student.session,
      date: attendanceDate,
      status,
      subject: subject.trim(),
      remarks: remarks?.trim() || ""
    });

    return res.status(201).json({
      success: true,
      message: "Attendance saved successfully."
    });

  } catch (error) {
    console.error("Save Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save attendance."
    });
  }
};