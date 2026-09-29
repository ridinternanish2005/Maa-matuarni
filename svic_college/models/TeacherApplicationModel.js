import mongoose from "mongoose";

const teacherApplicationSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    qualification: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    preferred_class: String,
    last_organization: String,
    address: String,

    // Resume file path
    resume: String,
  },
  {
    timestamps: true,
  }
);

const TeacherApplication =
  mongoose.models.TeacherApplication ||
  mongoose.model(
    "TeacherApplication",
    teacherApplicationSchema
  );

export default TeacherApplication;