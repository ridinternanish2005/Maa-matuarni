
import mongoose from "mongoose";
import Timetable from "../models/Timetable.js";
import User from "../models/User.js";

// ======================================================
// ADMIN - TIMETABLE MANAGEMENT PAGE
// ======================================================

export const getTimetableManagement = async (req, res) => {
  try {
    const timetable = await Timetable.find({ active: true })
      .sort({ semester: 1, day: 1, startTime: 1 })
      .lean();

    return res.render("ERP/timetable-management", {
      erpUser: req.session.erpUser,
      timetable
    });
  } catch (error) {
    console.error("Timetable Management Error:", error);
    return res.status(500).send("Unable to load timetable management.");
  }
};


export const getFacultyListForTimetable = async (req, res) => {
  try {
    const faculty = await User.find({
      role: "faculty",
      active: true
    })
      .select("_id name enrollment")
      .sort({ name: 1 })
      .lean();

    return res.json({
      success: true,
      faculty: faculty.map((item) => ({
        id: item._id.toString(),
        name: item.name,
        enrollment: item.enrollment
      }))
    });
  } catch (error) {
    console.error("Faculty List Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load faculty list."
    });
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
      facultyId,
      faculty,
      startTime,
      endTime,
      roomNumber,
      session
    } = req.body;

    if (
      !course?.trim() ||
      !semester?.trim() ||
      !day ||
      !subject?.trim() ||
      !startTime?.trim() ||
      !endTime?.trim() ||
      !session?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are required."
      });
    }

    if (startTime.trim() >= endTime.trim()) {
      return res.status(400).json({
        success: false,
        message: "End time must be greater than start time."
      });
    }

    let facultyUser = null;

    // Preferred: use the unique Faculty User ID from the Admin form.
    if (facultyId) {
      if (!mongoose.isValidObjectId(facultyId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid faculty ID."
        });
      }

      facultyUser = await User.findOne({
        _id: facultyId,
        role: "faculty",
        active: true
      }).select("_id name");
    } else if (faculty?.trim()) {
      // Legacy fallback for existing forms that submit only a name.
      // Duplicate names should be resolved by updating the Admin form.
      const matchingFaculty = await User.find({
        name: faculty.trim(),
        role: "faculty",
        active: true
      }).select("_id name");

      if (matchingFaculty.length === 1) {
        facultyUser = matchingFaculty[0];
      } else if (matchingFaculty.length > 1) {
        return res.status(400).json({
          success: false,
          message: "Multiple faculty members have this name. Please select faculty by ID."
        });
      }
    }

    if (!facultyUser) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid active faculty account."
      });
    }

    const timetable = await Timetable.create({
      course: course.trim(),
      semester: semester.trim(),
      day,
      subject: subject.trim(),
      faculty: facultyUser.name,
      facultyId: facultyUser._id,
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      roomNumber: roomNumber?.trim() || "",
      session: session.trim(),
      active: true,
      createdBy: req.session?.erpUser?.id
    });

    return res.status(201).json({
      success: true,
      message: "Timetable created successfully.",
      timetable
    });
  } catch (error) {
    console.error("Create Timetable Error:", error);
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
    const timetable = await Timetable.find({ active: true })
      .sort({ semester: 1, day: 1, startTime: 1 })
      .lean();

    return res.json({
      success: true,
      timetable
    });
  } catch (error) {
    console.error("Get Timetable Error:", error);
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

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid timetable ID."
      });
    }

    const timetable = await Timetable.findById(id);

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
    console.error("Deactivate Timetable Error:", error);
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
    const enrollment = req.session?.erpUser?.enrollment
      ?.trim()
      .toUpperCase();

    if (!enrollment) {
      return res.redirect("/erp");
    }

    const user = await User.findOne({
      enrollment,
      role: "student",
      active: true
    }).select("name enrollment course semester session");

    if (!user) {
      return res.status(403).send(
        "Student account not found or inactive."
      );
    }

    const profileSemester = user.semester || "1st Semester";

    const timetable = await Timetable.find({
      semester: profileSemester,
      session: user.session,
      active: true
    })
      .sort({ day: 1, startTime: 1 })
      .lean();

    return res.render("ERP/student-timetable", {
      erpUser: req.session.erpUser,
      user,
      timetable,
      semester: profileSemester
    });
  } catch (error) {
    console.error("Student Timetable Error:", error);
    return res.status(500).send("Unable to load timetable.");
  }
};

// ======================================================
// FACULTY - VIEW OWN TIMETABLE
// ======================================================

export const getFacultyTimetable = async (req, res) => {
  try {
    const enrollment = req.session?.erpUser?.enrollment
      ?.trim()
      .toUpperCase();

    if (!enrollment) {
      return res.redirect("/erp");
    }

    const faculty = await User.findOne({
      enrollment,
      role: "faculty",
      active: true
    }).select("_id name enrollment session");

    if (!faculty) {
      return res.status(403).json({
        success: false,
        message: "Faculty account not found or inactive."
      });
    }

    // New records use facultyId.
    // Legacy records without facultyId use the name fallback.
    const timetable = await Timetable.find({
      session: faculty.session,
      active: true,
      $or: [
        { facultyId: faculty._id },
        {
          facultyId: { $exists: false },
          faculty: faculty.name
        },
        {
          facultyId: null,
          faculty: faculty.name
        }
      ]
    })
      .sort({ day: 1, startTime: 1 })
      .lean();

    return res.json({
      success: true,
      timetable
    });
  } catch (error) {
    console.error("Faculty Timetable Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load faculty timetable."
    });
  }
};
