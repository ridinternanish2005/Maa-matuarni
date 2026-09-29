import mongoose from "mongoose";

const studentAttendanceSchema = new mongoose.Schema(
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

    session: {
      type: String,
      required: true,
      trim: true
    },

    date: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["Present", "Absent", "Leave"],
      required: true
    },

    subject: {
      type: String,
      trim: true,
      default: ""
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

// Same student + same date + same subject ki duplicate attendance prevent karega
studentAttendanceSchema.index(
  {
    enrollment: 1,
    date: 1,
    subject: 1
  },
  {
    unique: true
  }
);

const StudentAttendance =
  mongoose.models.StudentAttendance ||
  mongoose.model("StudentAttendance", studentAttendanceSchema);

export default StudentAttendance;