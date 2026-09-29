import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    enrollment: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    course: {
      type: String,
      default: "D.Pharm",
      trim: true
    },

    semester: {
      type: String,
      default: "1st Semester",
      trim: true
    },

    mobile: {
      type: String,
      trim: true,
      default: ""
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ""
    },

    fatherName: {
      type: String,
      trim: true,
      default: ""
    },

    motherName: {
      type: String,
      trim: true,
      default: ""
    },

    address: {
      type: String,
      trim: true,
      default: ""
    },

    admissionDate: {
      type: Date,
      default: null
    },

    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const StudentProfile =
  mongoose.models.StudentProfile ||
  mongoose.model("StudentProfile", studentProfileSchema);

export default StudentProfile;