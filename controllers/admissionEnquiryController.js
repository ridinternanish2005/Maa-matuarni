import AdmissionEnquiry from "../models/AdmissionEnquiry.js";

export const createAdmissionEnquiry = async (req, res) => {
  try {
    const { fullName, email, phone, course, message } = req.body;

    if (!fullName || !email || !phone || !course || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const enquiry = await AdmissionEnquiry.create({
      fullName,
      email,
      phone,
      course,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Admission enquiry submitted successfully",
      data: enquiry,
    });
  } catch (error) {
    console.error("Admission Enquiry Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};