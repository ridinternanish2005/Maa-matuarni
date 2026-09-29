import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    noticeDate: {
      type: Date,
      required: true,
      default: Date.now
    },

    category: {
      type: String,
      enum: [
        "General",
        "Academic",
        "Exam",
        "Fees",
        "Holiday",
        "Important"
      ],
      default: "General"
    },

    important: {
      type: Boolean,
      default: false
    },

    published: {
      type: Boolean,
      default: true
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

const Notice =
  mongoose.models.Notice ||
  mongoose.model("Notice", noticeSchema);

export default Notice;