import TeacherApplication from "../models/TeacherApplicationModel.js";

export const createTeacherApplication = async (
  req,
  res
) => {
  try {
    const data = {
      ...req.body,
      resume: req.file
        ? req.file.filename
        : "",
    };

    const application =
      await TeacherApplication.create(data);

    res.status(201).json({
      success: true,
      message:
        "Teacher application submitted successfully.",
      data: application,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTeacherApplications =
  async (req, res) => {
    try {
      const applications =
        await TeacherApplication.find().sort({
          createdAt: -1,
        });

      res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };