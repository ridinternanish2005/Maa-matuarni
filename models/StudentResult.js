import mongoose from "mongoose";

const studentResultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    enrollment: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true
    },

    studentName: {
      type: String,
      required: true,
      trim: true
    },

    course: {
      type: String,
      required: true,
      default: "D.Pharm",
      trim: true
    },

    session: {
      type: String,
      required: true,
      trim: true
    },

    semester: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    examName: {
      type: String,
      required: true,
      trim: true
    },

    subject: {
      type: String,
      required: true,
      trim: true
    },

    maxMarks: {
      type: Number,
      required: true,
      min: 1
    },

    obtainedMarks: {
      type: Number,
      required: true,
      min: 0
    },

    grade: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["Pass", "Fail"],
      required: true
    },

    remarks: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);


// Prevent duplicate subject result
studentResultSchema.index(
  {
    enrollment: 1,
    semester: 1,
    examName: 1,
    subject: 1
  },
  {
    unique: true
  }
);


const StudentResult =
  mongoose.models.StudentResult ||
  mongoose.model("StudentResult", studentResultSchema);

export default StudentResult;