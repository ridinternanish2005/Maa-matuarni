import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    enrollment: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    mobile: {
      type: String,
      required: true,
      trim: true
    },

    course: {
      type: String,
      required: true,
      trim: true
    },

    session: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      trim: true,
      lowercase: true
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

export default mongoose.models.Student ||
  mongoose.model("Student", studentSchema);