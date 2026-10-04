import mongoose from "mongoose";

import User from "../models/User.js";
import FacultyProfile from "../models/FacultyProfile.js";
import StudentProfile from "../models/StudentProfile.js";


// ======================================================
// ADMIN FACULTY MANAGEMENT PAGE
// ======================================================

export const getFacultyManagement = async (req, res) => {
  try {
    return res.render("ERP/faculty-management", {
      erpUser: req.session.erpUser
    });

  } catch (error) {
    console.error(
      "Faculty Management Error:",
      error
    );

    return res.status(500).send(
      "Unable to load faculty management."
    );
  }
};


// ======================================================
// GET ALL FACULTY
// ======================================================

export const getAllFaculty = async (req, res) => {
  try {

    const facultyUsers = await User.find({
      role: "faculty"
    })
      .select(
        "name enrollment session active createdAt"
      )
      .sort({
        createdAt: -1
      })
      .lean();


    const profiles =
      await FacultyProfile.find()
        .lean();


    const profileMap = new Map();

    profiles.forEach((profile) => {
      profileMap.set(
        profile.userId.toString(),
        profile
      );
    });


    const faculty = facultyUsers.map((user) => {

      const profile =
        profileMap.get(
          user._id.toString()
        ) || {};

      return {
        id: user._id,
        name: user.name,
        enrollment: user.enrollment,
        session: user.session,
        active: user.active,
        createdAt: user.createdAt,

        department:
          profile.department || "Pharmacy",

        designation:
          profile.designation || "Faculty",

        qualification:
          profile.qualification || "",

        mobile:
          profile.mobile || "",

        email:
          profile.email || "",

        subjects:
          profile.subjects || []
      };
    });


    return res.json({
      success: true,
      faculty
    });

  } catch (error) {

    console.error(
      "Get Faculty Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch faculty."
    });
  }
};


// ======================================================
// CREATE / UPDATE FACULTY PROFILE
// ======================================================

export const saveFacultyProfile = async (
  req,
  res
) => {

  try {

    const {
      enrollment,
      department,
      designation,
      qualification,
      mobile,
      email,
      subjects
    } = req.body;


    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message:
          "Faculty enrollment is required."
      });
    }


    const normalizedEnrollment =
      enrollment.trim().toUpperCase();


    const user = await User.findOne({
      enrollment: normalizedEnrollment,
      role: "faculty"
    });


    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "Faculty account not found."
      });
    }


    let subjectList = [];

    if (Array.isArray(subjects)) {

      subjectList = subjects
        .map((subject) =>
          String(subject).trim()
        )
        .filter(Boolean);

    } else if (typeof subjects === "string") {

      subjectList = subjects
        .split(",")
        .map((subject) =>
          subject.trim()
        )
        .filter(Boolean);

    }


    const profile =
      await FacultyProfile.findOneAndUpdate(
        {
          userId: user._id
        },

        {
          userId: user._id,

          enrollment:
            user.enrollment,

          name:
            user.name,

          department:
            department?.trim() ||
            "Pharmacy",

          designation:
            designation?.trim() ||
            "Faculty",

          qualification:
            qualification?.trim() ||
            "",

          mobile:
            mobile?.trim() ||
            "",

          email:
            email?.trim() ||
            "",

          subjects:
            subjectList,

          active:
            user.active
        },

        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      );


    return res.json({
      success: true,

      message:
        "Faculty profile saved successfully.",

      profile
    });

  } catch (error) {

    console.error(
      "Save Faculty Profile Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to save faculty profile."
    });
  }
};


// ======================================================
// TOGGLE FACULTY STATUS
// ======================================================

export const toggleFacultyStatus = async (
  req,
  res
) => {

  try {

    const { id } = req.params;


    if (
      !mongoose.isValidObjectId(id)
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid faculty ID."
      });

    }


    const faculty =
      await User.findOne({
        _id: id,
        role: "faculty"
      });


    if (!faculty) {

      return res.status(404).json({
        success: false,
        message:
          "Faculty not found."
      });

    }


    if (
      req.session?.erpUser?.id ===
      faculty._id.toString()
    ) {

      return res.status(400).json({
        success: false,
        message:
          "You cannot deactivate your own account."
      });

    }


    faculty.active =
      !faculty.active;

    await faculty.save();


    await FacultyProfile.findOneAndUpdate(
      {
        userId: faculty._id
      },
      {
        active: faculty.active
      }
    );


    return res.json({
      success: true,

      message:
        faculty.active
          ? "Faculty activated successfully."
          : "Faculty deactivated successfully.",

      active:
        faculty.active
    });

  } catch (error) {

    console.error(
      "Toggle Faculty Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to change faculty status."
    });
  }
};


// ======================================================
// FACULTY DASHBOARD
// ======================================================

export const getFacultyDashboard = async (
  req,
  res
) => {

  try {

    if (!req.session?.erpUser) {
      return res.redirect("/erp");
    }


    const enrollment =
      req.session.erpUser.enrollment;


    const user =
      await User.findOne({
        enrollment: enrollment,
        role: "faculty",
        active: true
      })
        .select(
          "name enrollment session active"
        )
        .lean();


    if (!user) {
      return res.status(404).send(
        "Faculty account not found."
      );
    }


    const profile =
      await FacultyProfile.findOne({
        userId: user._id
      })
        .lean();


    const students =
      await User.find({
        role: "student",
        active: true,
        session: user.session
      })
        .select(
          "name enrollment session active"
        )
        .sort({
          name: 1
        })
        .lean();


    return res.render(
      "ERP/faculty",
      {
        erpUser:
          req.session.erpUser,

        user:
          user,

        profile:
          profile || {
            subjects: []
          },

        students:
          students
      }
    );

  } catch (error) {

    console.error(
      "Faculty Dashboard Error:",
      error
    );

    return res.status(500).send(
      "Unable to load faculty dashboard."
    );
  }
};