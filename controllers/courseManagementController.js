import mongoose from "mongoose";
import Course from "../models/Course.js";

// ==========================================
// COURSE MANAGEMENT PAGE
// ==========================================

export const getCourseManagement = async (req, res) => {
  try {
    const courses = await Course.find()
      .sort({ courseName: 1 })
      .lean();

    res.render("ERP/course-management", {
      erpUser: req.session.erpUser,
      courses
    });
  } catch (error) {
    console.error("Course Management Error:", error);

    res.status(500).send(
      "Unable to load course management."
    );
  }
};

// ==========================================
// GET ALL COURSES
// ==========================================

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .sort({ courseName: 1 })
      .lean();

    res.json({
      success: true,
      courses
    });
  } catch (error) {
    console.error("Get Courses Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch courses."
    });
  }
};

// ==========================================
// CREATE COURSE
// ==========================================

export const createCourse = async (req, res) => {
  try {
    const {
      courseCode,
      courseName,
      duration,
      durationUnit,
      department,
      description
    } = req.body;

    if (
      !courseCode ||
      !courseName ||
      !duration
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Course code, course name and duration are required."
      });
    }

    const normalizedCode =
      courseCode.trim().toUpperCase();

    const existingCourse = await Course.findOne({
      courseCode: normalizedCode
    });

    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: "Course code already exists."
      });
    }

    const course = await Course.create({
      courseCode: normalizedCode,
      courseName: courseName.trim(),
      duration: Number(duration),
      durationUnit: durationUnit || "Years",
      department: department?.trim() || "Pharmacy",
      description: description?.trim() || "",
      semesters: [],
      active: true
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully.",
      course
    });
  } catch (error) {
    console.error("Create Course Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create course."
    });
  }
};

// ==========================================
// UPDATE COURSE
// ==========================================

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID."
      });
    }

    const {
      courseCode,
      courseName,
      duration,
      durationUnit,
      department,
      description
    } = req.body;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found."
      });
    }

    const normalizedCode =
      courseCode.trim().toUpperCase();

    const duplicate = await Course.findOne({
      courseCode: normalizedCode,
      _id: { $ne: id }
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Another course already uses this code."
      });
    }

    course.courseCode = normalizedCode;
    course.courseName = courseName.trim();
    course.duration = Number(duration);
    course.durationUnit =
      durationUnit || "Years";
    course.department =
      department?.trim() || "Pharmacy";
    course.description =
      description?.trim() || "";

    await course.save();

    res.json({
      success: true,
      message: "Course updated successfully.",
      course
    });
  } catch (error) {
    console.error("Update Course Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update course."
    });
  }
};

// ==========================================
// TOGGLE COURSE STATUS
// ==========================================

export const toggleCourseStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID."
      });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found."
      });
    }

    course.active = !course.active;

    await course.save();

    res.json({
      success: true,
      message: course.active
        ? "Course activated."
        : "Course deactivated.",
      active: course.active
    });
  } catch (error) {
    console.error(
      "Toggle Course Status Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to change course status."
    });
  }
};

// ==========================================
// ADD SEMESTER
// ==========================================

export const addSemester = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      semesterNumber,
      name
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID."
      });
    }

    if (!semesterNumber || !name) {
      return res.status(400).json({
        success: false,
        message:
          "Semester number and name are required."
      });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found."
      });
    }

    const semesterExists =
      course.semesters.some(
        (semester) =>
          semester.semesterNumber ===
          Number(semesterNumber)
      );

    if (semesterExists) {
      return res.status(409).json({
        success: false,
        message: "Semester already exists."
      });
    }

    course.semesters.push({
      semesterNumber: Number(semesterNumber),
      name: name.trim(),
      subjects: [],
      active: true
    });

    course.semesters.sort(
      (a, b) =>
        a.semesterNumber -
        b.semesterNumber
    );

    await course.save();

    res.status(201).json({
      success: true,
      message: "Semester added successfully.",
      course
    });
  } catch (error) {
    console.error("Add Semester Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to add semester."
    });
  }
};

// ==========================================
// ADD SUBJECT
// ==========================================

export const addSubject = async (req, res) => {
  try {
    const {
      id,
      semesterId
    } = req.params;

    const {
      name,
      code,
      type,
      credits
    } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(
        semesterId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid course or semester ID."
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Subject name is required."
      });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found."
      });
    }

    const semester =
      course.semesters.id(semesterId);

    if (!semester) {
      return res.status(404).json({
        success: false,
        message: "Semester not found."
      });
    }

    const subjectName =
      name.trim();

    const subjectExists =
      semester.subjects.some(
        (subject) =>
          subject.name.toLowerCase() ===
          subjectName.toLowerCase()
      );

    if (subjectExists) {
      return res.status(409).json({
        success: false,
        message:
          "Subject already exists in this semester."
      });
    }

    semester.subjects.push({
      name: subjectName,
      code: code
        ? code.trim().toUpperCase()
        : "",
      type: type || "Theory",
      credits: Number(credits) || 0,
      active: true
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: "Subject added successfully.",
      course
    });
  } catch (error) {
    console.error("Add Subject Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to add subject."
    });
  }
};

// ==========================================
// TOGGLE SEMESTER
// ==========================================

export const toggleSemesterStatus =
  async (req, res) => {
    try {
      const {
        id,
        semesterId
      } = req.params;

      const course =
        await Course.findById(id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found."
        });
      }

      const semester =
        course.semesters.id(semesterId);

      if (!semester) {
        return res.status(404).json({
          success: false,
          message: "Semester not found."
        });
      }

      semester.active =
        !semester.active;

      await course.save();

      res.json({
        success: true,
        message: semester.active
          ? "Semester activated."
          : "Semester deactivated.",
        active: semester.active
      });
    } catch (error) {
      console.error(
        "Toggle Semester Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to change semester status."
      });
    }
  };

// ==========================================
// TOGGLE SUBJECT
// ==========================================

export const toggleSubjectStatus =
  async (req, res) => {
    try {
      const {
        id,
        semesterId,
        subjectId
      } = req.params;

      const course =
        await Course.findById(id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found."
        });
      }

      const semester =
        course.semesters.id(semesterId);

      if (!semester) {
        return res.status(404).json({
          success: false,
          message: "Semester not found."
        });
      }

      const subject =
        semester.subjects.id(subjectId);

      if (!subject) {
        return res.status(404).json({
          success: false,
          message: "Subject not found."
        });
      }

      subject.active =
        !subject.active;

      await course.save();

      res.json({
        success: true,
        message: subject.active
          ? "Subject activated."
          : "Subject deactivated.",
        active: subject.active
      });
    } catch (error) {
      console.error(        "Toggle Subject Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to change subject status."
      });
    }
  };