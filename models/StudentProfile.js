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

    // ==========================================
    // ACADEMIC INFORMATION
    // ==========================================

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
      index: true
    },

    course: {
      type: String,
      default: "",
      trim: true
    },

    courseCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true
    },

    semesterId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true
    },

    semester: {
      type: String,
      default: "",
      trim: true
    },

    semesterNumber: {
      type: Number,
      default: null
    },

    // ==========================================
    // PERSONAL INFORMATION
    // ==========================================

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