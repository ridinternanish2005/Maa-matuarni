import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema(
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

    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      required: true
    },

    subject: {
      type: String,
      required: true,
      trim: true
    },

    faculty: {
      type: String,
      required: true,
      trim: true
    },

    startTime: {
      type: String,
      required: true,
      trim: true
    },

    endTime: {
      type: String,
      required: true,
      trim: true
    },

    roomNumber: {
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

const Timetable =
  mongoose.models.Timetable ||
  mongoose.model("Timetable", timetableSchema);

export default Timetable;