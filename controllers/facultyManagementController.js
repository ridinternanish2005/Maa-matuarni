import mongoose from "mongoose";

import User from "../models/User.js";
import FacultyProfile from "../models/FacultyProfile.js";
import Course from "../models/Course.js";

// ==========================================
// FACULTY MANAGEMENT PAGE
// ==========================================

export const getFacultyManagement = async (req, res) => {
  try {
    const facultyUsers = await User.find({
      role: "faculty"
    }).lean();

    const profiles = await FacultyProfile.find({}).lean();

    const courses = await Course.find({})
      .select("courseCode courseName semesters")
      .lean();

    const facultyList = facultyUsers.map((faculty) => {
      const profile = profiles.find(
        (item) =>
          item.userId &&
          item.userId.toString() === faculty._id.toString()
      );

      if (!profile) {
        return {
          ...faculty,
          profile: null
        };
      }

      const assignments = profile.subjectAssignments?.length
        ? profile.subjectAssignments
        : profile.subjects || [];

      const assignedSubjects = assignments.map((assignment) => {
        const course = courses.find(
          (item) =>
            item._id.toString() ===
            assignment.courseId?.toString()
        );

        const semester = course?.semesters?.find(
          (item) =>
            item._id.toString() ===
            assignment.semesterId?.toString()
        );

        const subject = semester?.subjects?.find(
          (item) =>
            item._id.toString() ===
            assignment.subjectId?.toString()
        );

        return {
          courseId: assignment.courseId?.toString() || "",
          semesterId: assignment.semesterId?.toString() || "",
          subjectId: assignment.subjectId?.toString() || "",
          courseName: course?.courseName || "Unknown Course",
          semesterName: semester?.name || "Unknown Semester",
          name: subject?.name || "Unknown Subject",
          code: subject?.code || ""
        };
      });

      return {
        ...faculty,
        profile: {
          ...profile,
          assignedSubjects
        }
      };
    });

    res.render("ERP/faculty-management", {
      erpUser: req.session.erpUser,
      facultyList
    });
  } catch (error) {
    console.error("Faculty Management Error:", error);
    res.status(500).send("Unable to load faculty management.");
  }
};

// ==========================================
// CREATE FACULTY PROFILE
// ==========================================


export const createFacultyProfile = async (req, res) => {
  try {
    const {
      userId,
      department,
      designation,
      subjects,
      mobile,
      email,
      qualification
    } = req.body;

    if (!userId || !department) {
      return res.status(400).json({
        success: false,
        message: "Faculty and department are required."
      });
    }

    const user = await User.findOne({
      _id: userId,
      role: "faculty"
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Faculty user not found."
      });
    }

    const existing = await FacultyProfile.findOne({
      userId: user._id
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Faculty profile already exists."
      });
    }

    // Existing comma-separated subject names are not valid ID assignments.
    // Keep the new profile's assignments empty until IDs are selected
    // through Course -> Semester -> Subject.
    const profile = await FacultyProfile.create({
      userId: user._id,
      enrollment: user.enrollment,
      name: user.name,
      department,
      designation: designation || "Faculty",
      qualification: qualification || "",
      mobile: mobile || "",
      email: email || "",
      subjects: [],
      subjectAssignments: [],
      active: user.active
    });

    return res.json({
      success: true,
      message: "Faculty profile created successfully. Assign subjects using the Subjects button.",
      profile
    });
  } catch (error) {
    console.error("Create Faculty Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create faculty profile.",
      error: error.message
    });
  }
};



// ==========================================
// UPDATE FACULTY PROFILE
// ==========================================

export const updateFacultyProfile = async (req, res) => {
  try {

    const { id } = req.params;


    const {
      department,
      designation,
      subjects,
      mobile,
      email,
      qualification
    } = req.body;


    const profile =
      await FacultyProfile.findById(id);


    if (!profile) {

      return res.status(404).json({
        success: false,
        message: "Faculty profile not found."
      });

    }


    profile.department =
      department || profile.department;


    profile.designation =
      designation || "Faculty";


    profile.qualification =
      qualification || "";


    profile.mobile =
      mobile || "";


    profile.email =
      email || "";


    // Convert subjects into array
    let subjectList = [];

    if (Array.isArray(subjects)) {

      subjectList = subjects
        .map((subject) => String(subject).trim())
        .filter(Boolean);

    } else if (subjects) {

      subjectList = String(subjects)
        .split(",")
        .map((subject) => subject.trim())
        .filter(Boolean);

    }


    profile.subjects = subjectList;


    await profile.save();


    return res.json({

      success: true,

      message:
        "Faculty profile updated successfully.",

      profile

    });


  } catch (error) {

    console.error(
      "Update Faculty Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to update faculty profile."

    });

  }
};





export const assignFacultySubjects = async (req, res) => {
  try {
    const { id } = req.params;
    const { subjectAssignments } = req.body;

    const profile = await FacultyProfile.findById(id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Faculty profile not found."
      });
    }

    if (
      !Array.isArray(subjectAssignments) ||
      subjectAssignments.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select subjects using Course, Semester and Subject dropdowns."
      });
    }

    const uniqueAssignments = [];
    const seen = new Set();

    for (const item of subjectAssignments) {
      if (
        !item ||
        !mongoose.isValidObjectId(item.courseId) ||
        !mongoose.isValidObjectId(item.semesterId) ||
        !mongoose.isValidObjectId(item.subjectId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid subject IDs. Please select the subjects again."
        });
      }

      const key =
        `${item.courseId}-${item.semesterId}-${item.subjectId}`;

      if (!seen.has(key)) {
        seen.add(key);

        uniqueAssignments.push({
          courseId: item.courseId,
          semesterId: item.semesterId,
          subjectId: item.subjectId
        });
      }
    }

    // IDs ko dono assignment fields mein save karein
    profile.subjects = uniqueAssignments;
    profile.subjectAssignments = uniqueAssignments;

    await profile.save();

    return res.json({
      success: true,
      message: "Subjects assigned successfully."
    });

  } catch (error) {
    console.error("Assign Faculty Subjects Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to assign subjects.",
      error: error.message
    });
  }
};


/////////////////////////////
// ==========================================
// ACTIVATE / DEACTIVATE FACULTY
// ==========================================

export const toggleFacultyStatus = async (req, res) => {
  try {

    const { id } = req.params;


    const user =
      await User.findOne({
        _id: id,
        role: "faculty"
      });


    if (!user) {

      return res.status(404).json({
        success: false,
        message: "Faculty not found."
      });

    }


    user.active =
      !user.active;


    await user.save();


    await FacultyProfile.findOneAndUpdate(
      {
        userId: user._id
      },
      {
        active: user.active
      }
    );


    return res.json({

      success: true,

      message: user.active
        ? "Faculty activated successfully."
        : "Faculty deactivated successfully.",

      active: user.active

    });


  } catch (error) {

    console.error(
      "Toggle Faculty Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to update faculty status."

    });

  }
};

// ==========================================
// GET COURSES FOR FACULTY SUBJECT ASSIGNMENT
// ==========================================

export const getFacultyAssignmentCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      active: true
    })
      .select("courseCode courseName semesters")
      .lean();

    return res.json({
      success: true,
      courses
    });

  } catch (error) {

    console.error(
      "Faculty Assignment Courses Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load courses."
    });
  }
};

// ======================================================
// GET COURSES FOR FACULTY SUBJECT ASSIGNMENT
// ======================================================

