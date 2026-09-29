import Admission from "../models/AdmissionModel1.js";

export const createAdmission = async (req, res) => {
  try {
    const admission = new Admission(req.body);

    await admission.save();

    res.status(201).json({
      success: true,
      message: "Admission Form Submitted Successfully",
      data: admission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: admissions.length,
      data: admissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};