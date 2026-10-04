import mongoose from "mongoose";

const questionPaperSchema = new mongoose.Schema(
  {
    title: {
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

    session: {
      type: String,
      required: true,
      trim: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    uploadedByName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const QuestionPaper =
  mongoose.models.QuestionPaper ||
  mongoose.model(
    "QuestionPaper",
    questionPaperSchema
  );

export default QuestionPaper;