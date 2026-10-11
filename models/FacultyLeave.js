import mongoose from "mongoose";

const facultyLeaveSchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    facultyEnrollment: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
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

    leaveType: {
      type: String,
      enum: ["Casual", "Medical", "Other"],
      required: true,
    },

    fromDate: {
      type: Date,
      required: true,
    },

    toDate: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    adminRemark: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const FacultyLeave =
  mongoose.models.FacultyLeave ||
  mongoose.model("FacultyLeave", facultyLeaveSchema);

export default FacultyLeave;