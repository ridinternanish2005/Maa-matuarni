import mongoose from "mongoose";

const admissionSchema = new mongoose.Schema(
  {
    student_name: {
      type: String,
      required: true,
    },
    dob: Date,
    gender: String,
    category: String,
    class_applying: String,
    stream: String,
    previous_school: String,
    percentage: Number,
    board: String,

    father_name: {
      type: String,
      required: true,
    },
    mother_name: {
      type: String,
      required: true,
    },
    parent_mobile: {
      type: String,
      required: true,
    },
    parent_email: {
      type: String,
      required: true,
    },
    occupation: String,
    annual_income: String,

    address: {
      type: String,
      required: true,
    },
    city: String,
    pincode: String,

    birth_certificate: String,
    marksheet: String,
    student_photo: String,
  },
  {
    timestamps: true,
  }
);

const Admission =
  mongoose.models.Admission ||
  mongoose.model("Admission", admissionSchema);

export default Admission;