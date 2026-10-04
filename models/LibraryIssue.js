import mongoose from "mongoose";

const libraryIssueSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
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

    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LibraryBook",
      required: true
    },

    bookName: {
      type: String,
      required: true,
      trim: true
    },

    issueDate: {
      type: Date,
      default: Date.now
    },

    dueDate: {
      type: Date,
      required: true
    },

    returnDate: {
      type: Date,
      default: null
    },

    status: {
      type: String,
      enum: [
        "Issued",
        "Returned",
        "Overdue"
      ],
      default: "Issued",
      index: true
    },

    // ==============================
    // FINE DETAILS
    // ==============================

    finePerDay: {
      type: Number,
      default: 10
    },

    lateDays: {
      type: Number,
      default: 0
    },

    fineAmount: {
      type: Number,
      default: 0
    },

    finePaid: {
      type: Boolean,
      default: false
    },
finePaidDate: {
  type: Date,
  default: null
},
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    issuedByName: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const LibraryIssue =
  mongoose.models.LibraryIssue ||
  mongoose.model(
    "LibraryIssue",
    libraryIssueSchema
  );

export default LibraryIssue;