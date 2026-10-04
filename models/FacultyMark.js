import mongoose from "mongoose";

const facultyMarkSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    enrollment: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    facultyName: {
      type: String,
      required: true,
      trim: true,
    },

    session: {
      type: String,
      required: true,
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    examType: {
      type: String,
      enum: [
        "Internal I",
        "Internal II",
        "Assignment",
        "Practical",
        "Final Exam",
      ],
      required: true,
    },

    maxMarks: {
      type: Number,
      required: true,
      min: 1,
    },

    marks: {
      type: Number,
      required: true,
      min: 0,
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

facultyMarkSchema.index(
  {
    enrollment: 1,
    subject: 1,
    examType: 1,
    session: 1,
  },
  { unique: true }
);

const FacultyMark =
  mongoose.models.FacultyMark ||
  mongoose.model("FacultyMark", facultyMarkSchema);

export default FacultyMark;