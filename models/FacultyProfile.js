import mongoose from "mongoose";

const facultyProfileSchema = new mongoose.Schema(
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

    department: {
      type: String,
      default: "Pharmacy",
      trim: true
    },

    designation: {
      type: String,
      default: "Faculty",
      trim: true
    },

    qualification: {
      type: String,
      default: "",
      trim: true
    },

    mobile: {
      type: String,
      default: "",
      trim: true
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true
    },

    subjects: {
      type: [String],
      default: []
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

const FacultyProfile =
  mongoose.models.FacultyProfile ||
  mongoose.model("FacultyProfile", facultyProfileSchema);

export default FacultyProfile;