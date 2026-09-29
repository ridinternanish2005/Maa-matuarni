import Student from "../models/Student1.js";

export const createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      student
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};