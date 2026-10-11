
import Course from "../models/Course.js";

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .sort({ courseName: 1 })
      .lean();

    return res.render("allcourses", {
      courses: courses
    });
  } catch (error) {
    console.error("Get All Courses Error:", error);

    return res.status(500).send(
      "Unable to load courses."
    );
  }
};
