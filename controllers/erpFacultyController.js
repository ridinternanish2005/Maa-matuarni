import mongoose from "mongoose";
import User from "../models/User.js";
import FacultyProfile from "../models/FacultyProfile.js";
import StudentProfile from "../models/StudentProfile.js";
import Timetable from "../models/Timetable.js";
import Notice from "../models/Notice.js";
import Course from "../models/Course.js";

// ======================================================
// ADMIN FACULTY MANAGEMENT PAGE
// ======================================================

export const getFacultyManagement = async (req, res) => {
  try {
    const facultyUsers = await User.find({
      role: "faculty"
    })
      .select("name enrollment session active createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const profiles = await FacultyProfile.find({})
      .lean();

    const facultyList = facultyUsers.map((faculty) => {
      const profile = profiles.find(
        (item) =>
          item.userId &&
          item.userId.toString() === faculty._id.toString()
      );

      return {
        ...faculty,
        profile: profile || null
      };
    });

    return res.render("ERP/faculty-management", {
      erpUser: req.session.erpUser,
      facultyList
    });

  } catch (error) {
    console.error("Faculty Management Error:", error);

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

    const profiles = await FacultyProfile.find({})
      .lean();

    const profileMap = new Map();

    profiles.forEach((profile) => {
      if (profile.userId) {
        profileMap.set(
          profile.userId.toString(),
          profile
        );
      }
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
      message: "Unable to fetch faculty."
    });
  }
};


// ======================================================
// CREATE / UPDATE FACULTY PROFILE
// ======================================================

export const saveFacultyProfile = async (req, res) => {
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
        message: "Faculty enrollment is required."
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
        message: "Faculty account not found."
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

    subjectList = [
      ...new Set(subjectList)
    ];

    const profile =
      await FacultyProfile.findOneAndUpdate(
        {
          userId: user._id
        },
        {
          userId: user._id,
          enrollment: user.enrollment,
          name: user.name,

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

          subjects: subjectList,

          active: user.active
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
// CREATE FACULTY PROFILE
// ======================================================

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
        message:
          "Faculty and department are required."
      });
    }

    const user = await User.findOne({
      _id: userId,
      role: "faculty"
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "Faculty user not found."
      });
    }

    const existing =
      await FacultyProfile.findOne({
        userId: user._id
      });

    if (existing) {
      return res.status(400).json({
        success: false,
        message:
          "Faculty profile already exists."
      });
    }

    let subjectList = [];

    if (Array.isArray(subjects)) {
      subjectList = subjects
        .map((subject) =>
          String(subject).trim()
        )
        .filter(Boolean);

    } else if (subjects) {
      subjectList = String(subjects)
        .split(",")
        .map((subject) =>
          subject.trim()
        )
        .filter(Boolean);
    }

    const profile =
      await FacultyProfile.create({
        userId: user._id,
        enrollment: user.enrollment,
        name: user.name,

        department:
          department.trim(),

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

        subjects: subjectList,

        active: user.active
      });

    return res.json({
      success: true,
      message:
        "Faculty profile created successfully.",
      profile
    });

  } catch (error) {
    console.error(
      "Create Faculty Profile Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create faculty profile."
    });
  }
};


// ======================================================
// UPDATE FACULTY PROFILE
// ======================================================

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

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid faculty profile ID."
      });
    }

    const profile =
      await FacultyProfile.findById(id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message:
          "Faculty profile not found."
      });
    }

    profile.department =
      department?.trim() ||
      profile.department;

    profile.designation =
      designation?.trim() ||
      "Faculty";

    profile.qualification =
      qualification?.trim() ||
      "";

    profile.mobile =
      mobile?.trim() ||
      "";

    profile.email =
      email?.trim() ||
      "";

    let subjectList = [];

    if (Array.isArray(subjects)) {
      subjectList = subjects
        .map((subject) =>
          String(subject).trim()
        )
        .filter(Boolean);

    } else if (subjects) {
      subjectList = String(subjects)
        .split(",")
        .map((subject) =>
          subject.trim()
        )
        .filter(Boolean);
    }

    profile.subjects = [
      ...new Set(subjectList)
    ];

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


// ======================================================
// ASSIGN SUBJECTS TO FACULTY
// ======================================================

export const assignFacultySubjects = async (req, res) => {
  try {
    const { id } = req.params;
    const { subjects, subjectAssignments } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty profile ID."
      });
    }

    const profile = await FacultyProfile.findById(id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Faculty profile not found."
      });
    }

    if (!Array.isArray(subjectAssignments)) {
      return res.status(400).json({
        success: false,
        message: "Please select Course, Semester and Subject."
      });
    }

    const uniqueAssignments = [];
    const seen = new Set();

    for (const item of subjectAssignments) {
      if (
        !item.courseId ||
        !item.semesterId ||
        !item.subjectId ||
        !mongoose.isValidObjectId(item.courseId) ||
        !mongoose.isValidObjectId(item.semesterId) ||
        !mongoose.isValidObjectId(item.subjectId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid Course, Semester or Subject ID."
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

    // Check that every selected ID belongs to the correct active records
    for (const item of uniqueAssignments) {
      const course = await Course.findOne({
        _id: item.courseId,
        active: true
      });

      if (!course) {
        return res.status(400).json({
          success: false,
          message: "Course not found or inactive."
        });
      }

      const semester = course.semesters.id(item.semesterId);

      if (!semester || !semester.active) {
        return res.status(400).json({
          success: false,
          message: "Semester not found or inactive."
        });
      }

      const subject = semester.subjects.id(item.subjectId);

      if (!subject || !subject.active) {
        return res.status(400).json({
          success: false,
          message: "Subject not found or inactive."
        });
      }
    }

    // Save actual IDs
    profile.subjectAssignments = uniqueAssignments;

    // Keep old subject-name field for existing ERP features
    if (Array.isArray(subjects)) {
      profile.subjects = [
        ...new Set(
          subjects.map(s => String(s).trim()).filter(Boolean)
        )
      ];
    }

    await profile.save();

    return res.json({
      success: true,
      message: "Subjects assigned successfully.",
      subjects: profile.subjects,
      subjectAssignments: profile.subjectAssignments
    });

  } catch (error) {
    console.error("Assign Faculty Subjects Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to assign subjects."
    });
  }
};


// ======================================================
// ACTIVATE / DEACTIVATE FACULTY
// ======================================================

export const toggleFacultyStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
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
        active:
          faculty.active
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

export const getFacultyDashboard = async (req, res) => {
  try {
    if (!req.session?.erpUser) {
      return res.redirect("/erp");
    }

    const enrollment = req.session.erpUser.enrollment;

    const user = await User.findOne({
      enrollment,
      role: "faculty",
      active: true
    })
      .select("name enrollment session active")
      .lean();

    if (!user) {
      return res.status(404).send("Faculty account not found.");
    }

    const profile = await FacultyProfile.findOne({
      userId: user._id
    }).lean();

    const students = await User.find({
      role: "student",
      active: true,
      session: user.session
    })
      .select("name enrollment session active")
      .sort({ name: 1 })
      .lean();
const timetable = await Timetable.find({
  facultyId: user._id,
  session: user.session,
  active: true
})
  .sort({ day: 1, startTime: 1 })
  .lean();

    const todayName = new Intl.DateTimeFormat("en-US", {
      weekday: "long"
    }).format(new Date());

    const todaysTimetable = timetable.filter(
      item => item.day === todayName
    );

    const notices = await Notice.find({
      published: true
    })
      .sort({
        important: -1,
        noticeDate: -1,
        createdAt: -1
      })
      .lean();

    // Load actual assigned Course, Semester and Subject details
    const assignments = Array.isArray(profile?.subjectAssignments)
      ? profile.subjectAssignments
      : [];

    const courseIds = [
      ...new Set(
        assignments.map(item => String(item.courseId))
      )
    ];

    const courseDocuments = courseIds.length
      ? await Course.find({
          _id: { $in: courseIds },
          active: true
        }).lean()
      : [];

    const courses = [];

    for (const assignment of assignments) {
      const course = courseDocuments.find(
        item => String(item._id) === String(assignment.courseId)
      );

      if (!course) continue;

      const semester = (course.semesters || []).find(
        item => String(item._id) === String(assignment.semesterId)
      );

      if (!semester || !semester.active) continue;

      const subject = (semester.subjects || []).find(
        item => String(item._id) === String(assignment.subjectId)
      );

      if (!subject || !subject.active) continue;

      courses.push({
        courseId: String(course._id),
        courseName: course.courseName,
        courseCode: course.courseCode,
        semesterId: String(semester._id),
        semesterName: semester.name,
        semesterNumber: semester.semesterNumber,
        subjectId: String(subject._id),
        name: subject.name,
        subjectCode: subject.code || "",
        type: subject.type || "Theory",
        credits: subject.credits ?? 0
      });
    }

    // Show old assignments if this faculty has not yet received
    // any ID-based assignments.
    if (
      assignments.length === 0 &&
      Array.isArray(profile?.subjects)
    ) {
      for (const name of profile.subjects) {
        courses.push({
          name,
          courseName: "Not linked",
          courseCode: "",
          semesterName: "Not linked",
          subjectCode: "",
          type: "",
          credits: ""
        });
      }
    }

    const dashboardStats = {
      totalCourses: new Set(
        courses.map(course => course.courseId || course.name)
      ).size,
      totalStudents: students.length,
      todaysClasses: todaysTimetable.length,
      pendingTasks: 0
    };

    return res.render("ERP/faculty", {
      erpUser: req.session.erpUser,
      user,
      profile: profile || { subjects: [], subjectAssignments: [] },
      students,
      courses,
      timetable,
      todaysTimetable,
      notices,
      dashboardStats
    });

  } catch (error) {
    console.error("Faculty Dashboard Error:", error);

    return res.status(500).send(
      "Unable to load faculty dashboard."
    );
  }
};
