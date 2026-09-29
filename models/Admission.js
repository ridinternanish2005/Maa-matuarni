import mongoose from "mongoose";

const admissionSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },

    fatherName: {
      type: String,
      required: true,
      trim: true
    },

    mobile: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },

    dob: {
      type: Date,
      required: true
    },

    gender: {
      type: String,
      required: true
    },

    address: {
      type: String,
      required: true,
      trim: true
    },

    course: {
      type: String,
      required: true,
      trim: true
    },

    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    }
  },
  {
    timestamps: true,
    collection: "admissions"
  }
);

// IMPORTANT: New model name
const AdmissionApplication =
  mongoose.models.AdmissionApplication ||
  mongoose.model("AdmissionApplication", admissionSchema);

export default AdmissionApplication;