import Timetable from "../models/Timetable.js";
import User from "../models/User.js";


// ======================================================
// ADMIN - TIMETABLE MANAGEMENT PAGE
// ======================================================

export const getTimetableManagement = async (req, res) => {
  try {
    const timetable = await Timetable.find({
      active: true
    })
      .sort({
        semester: 1,
        day: 1,
        startTime: 1
      })
      .lean();

    return res.render("ERP/timetable-management", {
      erpUser: req.session.erpUser,
      timetable
    });

  } catch (error) {
    console.error(
      "Timetable Management Error:",
      error
    );

    return res.status(500).send(
      "Unable to load timetable management."
    );
  }
};


// ======================================================
// ADMIN - CREATE TIMETABLE
// ======================================================

export const createTimetable = async (req, res) => {
  try {
    const {
      course,
      semester,
      day,
      subject,
      faculty,
      startTime,
      endTime,
      roomNumber,
      session
    } = req.body;

    if (
      !course ||
      !semester ||
      !day ||
      !subject ||
      !faculty ||
      !startTime ||
      !endTime ||
      !session
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are required."
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be greater than start time."
      });
    }

    const timetable = await Timetable.create({
      course: course.trim(),
      semester: semester.trim(),
      day,
      subject: subject.trim(),
      faculty: faculty.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      roomNumber: roomNumber?.trim() || "",
      session: session.trim(),
      active: true,
      createdBy: req.session.erpUser.id
    });

    return res.status(201).json({
      success: true,
      message: "Timetable created successfully.",
      timetable
    });

  } catch (error) {
    console.error(
      "Create Timetable Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create timetable."
    });
  }
};


// ======================================================
// ADMIN - GET ALL TIMETABLE
// ======================================================

export const getAllTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.find({
      active: true
    })
      .sort({
        semester: 1,
        day: 1,
        startTime: 1
      })
      .lean();

    return res.json({
      success: true,
      timetable
    });

  } catch (error) {
    console.error(
      "Get Timetable Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch timetable."
    });
  }
};


// ======================================================
// ADMIN - DELETE / DEACTIVATE TIMETABLE
// ======================================================

export const deactivateTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    const timetable =
      await Timetable.findById(id);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found."
      });
    }

    timetable.active = false;

    await timetable.save();

    return res.json({
      success: true,
      message: "Timetable removed successfully."
    });

  } catch (error) {
    console.error(
      "Deactivate Timetable Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to remove timetable."
    });
  }
};


// ======================================================
// STUDENT - VIEW TIMETABLE
// ======================================================

export const getStudentTimetable = async (req, res) => {
  try {
    if (!req.session?.erpUser) {
      return res.redirect("/erp");
    }

    const enrollment =
      req.session.erpUser.enrollment;

    const user = await User.findOne({
      enrollment: enrollment,
      role: "student",
      active: true
    }).select(
      "name enrollment course semester session active"
    );

    if (!user) {
      return res.status(404).send(
        "Student account not found."
      );
    }

    const profileSemester =
      user.semester || "1st Semester";

    const timetable =
      await Timetable.find({
        semester: profileSemester,
        session: user.session,
        active: true
      })
        .sort({
          day: 1,
          startTime: 1
        })
        .lean();

    return res.render(
      "ERP/student-timetable",
      {
        erpUser: req.session.erpUser,
        user,
        timetable,
        semester: profileSemester
      }
    );

  } catch (error) {
    console.error(
      "Student Timetable Error:",
      error
    );

    return res.status(500).send(
      "Unable to load student timetable."
    );
  }
};