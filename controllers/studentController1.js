
import Student from "../models/Student1.js";

// Add Student
export const createStudent = async (req, res) => {
  try {
    const { enrollment, name, mobile, course, session, email } = req.body;

    if (!enrollment || !name || !mobile || !course || !session) {
      return res.status(400).json({
        success: false,
        message: "Enrollment, name, mobile, course and session are required"
      });
    }

    const student = await Student.create({
      enrollment,
      name,
      mobile,
      course,
      session,
      email
    });

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      student
    });
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 500).json({
      success: false,
      message:
        error.code === 11000
          ? "Enrollment already exists"
          : error.message
    });
  }
};

// Get All Students
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get One Student
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.json({ success: true, student });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid student ID"
    });
  }
};

// Update Student
export const updateStudent = async (req, res) => {
  try {
    const allowedFields = [
      "enrollment",
      "name",
      "mobile",
      "course",
      "session",
      "email",
      "active"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.json({
      success: true,
      message: "Student updated successfully",
      student
    });
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({
      success: false,
      message:
        error.code === 11000
          ? "Enrollment already exists"
          : error.message
    });
  }
};

// Delete Student
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.json({
      success: true,
      message: "Student deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid student ID"
    });
  }
};
