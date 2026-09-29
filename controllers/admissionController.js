import AdmissionApplication from "../models/Admission.js";

export const createAdmission = async (req, res) => {
  try {
    console.log("================================");
    console.log("ADMISSION REQUEST");
    console.log(req.body);
    console.log("================================");

    const {
      fullName,
      fatherName,
      mobile,
      email,
      dob,
      gender,
      address,
      course,
      percentage
    } = req.body;

    // Validation
    if (
      !fullName ||
      !fatherName ||
      !mobile ||
      !email ||
      !dob ||
      !gender ||
      !address ||
      !course ||
      percentage === undefined ||
      percentage === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields"
      });
    }

    const admission = await AdmissionApplication.create({
      fullName: fullName.trim(),
      fatherName: fatherName.trim(),
      mobile: mobile.trim(),
      email: email.trim().toLowerCase(),
      dob,
      gender,
      address: address.trim(),
      course,
      percentage: Number(percentage),
      status: "Pending"
    });

    console.log("ADMISSION SAVED SUCCESSFULLY");
    // console.log(admission);

    return res.status(201).json({
      success: true,
      message: "Admission submitted successfully",
      data: admission
    });

  } catch (error) {

    console.error("================================");
    console.error("ADMISSION ERROR");
    console.error(error);
    console.error("================================");

    return res.status(500).json({
      success: false,
      message: "Failed to submit admission",
      error: error.message
    });
  }
};