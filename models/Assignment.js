import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    course: {
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

    subject: {
      type: String,
      required: true,
      trim: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true,
      default: ""
    },

    materialType: {
      type: String,
      enum: ["Assignment", "Study Material", "Notes", "Question Paper"],
      default: "Assignment"
    },

    dueDate: {
      type: Date,
      default: null
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

    session: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    active: {
      type: Boolean,
      default: true,
      index: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Assignment =
  mongoose.models.Assignment ||
  mongoose.model("Assignment", assignmentSchema);

export default Assignment;