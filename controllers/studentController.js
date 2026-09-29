import Student from "../models/Student1.js";

export const createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};