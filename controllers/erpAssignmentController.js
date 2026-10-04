import mongoose from "mongoose";

import Assignment from "../models/Assignment.js";
import User from "../models/User.js";
import StudentProfile from "../models/StudentProfile.js";


// ======================================================
// ADMIN ASSIGNMENT MANAGEMENT PAGE
// ======================================================

export const getAssignmentManagement = async (req, res) => {
  try {
    return res.render("ERP/assignment-management", {
      erpUser: req.session.erpUser
    });

  } catch (error) {
    console.error(
      "Assignment Management Error:",
      error
    );

    return res.status(500).send(
      "Unable to load assignment management."
    );
  }
};


// ======================================================
// CREATE ASSIGNMENT / STUDY MATERIAL
// ======================================================

export const createAssignment = async (req, res) => {
  try {

    const {
      course,
      semester,
      subject,
      title,
      description,
      materialType,
      dueDate,
      session
    } = req.body;


    if (
      !course ||
      !semester ||
      !subject ||
      !title ||
      !session
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Course, semester, subject, title and session are required."
      });
    }


    const assignment =
      await Assignment.create({

        course: course.trim(),

        semester: semester.trim(),

        subject: subject.trim(),

        title: title.trim(),

        description:
          description?.trim() || "",

        materialType:
          materialType || "Assignment",

        dueDate:
          dueDate
            ? new Date(dueDate)
            : null,

        session:
          session.trim(),

        active: true,

        createdBy:
          req.session.erpUser.id
      });


    return res.status(201).json({

      success: true,

      message:
        "Assignment / study material created successfully.",

      assignment

    });

  } catch (error) {

    console.error(
      "Create Assignment Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to create assignment."

    });

  }
};


// ======================================================
// GET ALL ASSIGNMENTS
// ======================================================

export const getAllAssignments = async (
  req,
  res
) => {

  try {

    const assignments =
      await Assignment.find({
        active: true
      })
        .sort({
          createdAt: -1
        })
        .lean();


    return res.json({

      success: true,

      assignments

    });

  } catch (error) {

    console.error(
      "Get Assignments Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to fetch assignments."

    });

  }
};


// ======================================================
// DEACTIVATE ASSIGNMENT
// ======================================================

export const deactivateAssignment = async (
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
          "Invalid assignment ID."

      });

    }


    const assignment =
      await Assignment.findById(id);


    if (!assignment) {

      return res.status(404).json({

        success: false,

        message:
          "Assignment not found."

      });

    }


    assignment.active = false;

    await assignment.save();


    return res.json({

      success: true,

      message:
        "Assignment removed successfully."

    });

  } catch (error) {

    console.error(
      "Deactivate Assignment Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to remove assignment."

    });

  }

};


// ======================================================
// STUDENT ASSIGNMENTS
// ======================================================

export const getStudentAssignments = async (
  req,
  res
) => {

  try {

    if (!req.session?.erpUser) {

      return res.redirect("/erp");

    }


    const enrollment =
      req.session.erpUser.enrollment;


    // Find student
    const user =
      await User.findOne({

        enrollment: enrollment,

        role: "student",

        active: true

      }).select(
        "name enrollment session"
      );


    if (!user) {

      return res.status(404).send(
        "Student account not found."
      );

    }


    // Find student profile
    const profile =
      await StudentProfile.findOne({

        userId: user._id

      }).lean();


    if (!profile) {

      return res.status(404).send(
        "Student profile not found."
      );

    }


    const semester =
      profile.semester ||
      "1st Semester";


    const course =
      profile.course ||
      "D.Pharm";


    const session =
      user.session ||
      "2025-26";


    console.log(
      "================================"
    );

    console.log(
      "STUDENT ASSIGNMENT DEBUG"
    );

    console.log(
      "Enrollment:",
      user.enrollment
    );

    console.log(
      "Course:",
      course
    );

    console.log(
      "Semester:",
      semester
    );

    console.log(
      "Session:",
      session
    );

    console.log(
      "================================"
    );


    // Find assignments
    const assignments =
      await Assignment.find({

        semester: semester,

        active: true

      })
        .sort({

          dueDate: 1,

          createdAt: -1

        })
        .lean();


    console.log(
      "Assignments Found:",
      assignments.length
    );


    return res.render(
      "ERP/student-assignments",
      {

        erpUser:
          req.session.erpUser,

        user:
          user,

        profile:
          profile,

        course:
          course,

        semester:
          semester,

        session:
          session,

        assignments:
          assignments

      }
    );


  } catch (error) {

    console.error(
      "Student Assignments Error:",
      error
    );

    return res.status(500).send(
      "Unable to load assignments."
    );

  }

};