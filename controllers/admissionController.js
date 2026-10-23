
import AdmissionApplication from "../models/Admission.js";

// Show Admission Form
export const showAdmissionForm = (req, res) => {
  return res.render("Admission/admission");
};

// Submit Admission Form
export const createAdmission = async (req, res) => {
  try {
    // console.log("ADMISSION REQUEST:", req.body);

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

    // Validate required fields
    if (
      !fullName?.trim() ||
      !fatherName?.trim() ||
      !mobile?.trim() ||
      !email?.trim() ||
      !dob ||
      !gender ||
      !address?.trim() ||
      !course ||
      percentage === undefined ||
      percentage === ""
    ) {
      return res.status(400).send(`
        <script>
          alert("Please fill all required fields.");
          window.history.back();
        </script>
      `);
    }

    // Validate percentage
    const percentageValue = Number(percentage);

    if (
      !Number.isFinite(percentageValue) ||
      percentageValue < 0 ||
      percentageValue > 100
    ) {
      return res.status(400).send(`
        <script>
          alert("Percentage must be between 0 and 100.");
          window.history.back();
        </script>
      `);
    }

    // Save admission to MongoDB
    const admission = await AdmissionApplication.create({
      fullName: fullName.trim(),
      fatherName: fatherName.trim(),
      mobile: mobile.trim(),
      email: email.trim().toLowerCase(),
      dob,
      gender,
      address: address.trim(),
      course,
      percentage: percentageValue,
      status: "Pending"
    });

    console.log(
      "ADMISSION SAVED SUCCESSFULLY:",
      admission._id
    );

    // Show success popup
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Admission Successful</title>
      </head>
      <body>
        <script>
          alert("Admission Form Submitted Successfully!");
          window.location.href = "/admission";
        </script>
      </body>
      </html>
    `);

  } catch (error) {
    console.error("ADMISSION ERROR:", error);

    return res.status(500).send(`
      <script>
        alert("Failed to submit admission. Please try again.");
        window.history.back();
      </script>
    `);
  }
};
