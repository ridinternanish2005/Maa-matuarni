import mongoose from "mongoose";

const studentDocumentSchema = new mongoose.Schema(
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
      default: "D.Pharm",
      trim: true
    },

    session: {
      type: String,
      required: true,
      trim: true
    },

    documentType: {
      type: String,
      enum: [
        "Admission Letter",
        "Bonafide Certificate",
        "Character Certificate",
        "Transfer Certificate",
        "Migration Certificate",
        "Marksheet",
        "ID Card",
        "Other"
      ],
      required: true
    },

    documentNumber: {
      type: String,
      trim: true,
      default: ""
    },

    issueDate: {
      type: Date,
      default: null
    },

    status: {
      type: String,
      enum: ["Available", "Pending", "Rejected"],
      default: "Available"
    },

    remarks: {
      type: String,
      trim: true,
      default: ""
    },

    fileName: {
      type: String,
      trim: true,
      default: ""
    },

    filePath: {
      type: String,
      trim: true,
      default: ""
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

const StudentDocument =
  mongoose.models.StudentDocument ||
  mongoose.model("StudentDocument", studentDocumentSchema);

export default StudentDocument;