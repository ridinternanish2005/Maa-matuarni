import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    code: {
      type: String,
      default: "",
      trim: true,
      uppercase: true
    },

    type: {
      type: String,
      enum: ["Theory", "Practical"],
      default: "Theory"
    },

    credits: {
      type: Number,
      default: 0,
      min: 0
    },

    active: {
      type: Boolean,
      default: true
    }
  },
  { _id: true }
);

const semesterSchema = new mongoose.Schema(
  {
    semesterNumber: {
      type: Number,
      required: true,
      min: 1
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    subjects: {
      type: [subjectSchema],
      default: []
    },

    active: {
      type: Boolean,
      default: true
    }
  },
  { _id: true }
);

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },

    courseName: {
      type: String,
      required: true,
      trim: true
    },

    duration: {
      type: Number,
      required: true,
      min: 1
    },

    durationUnit: {
      type: String,
      enum: ["Years", "Months"],
      default: "Years"
    },

    department: {
      type: String,
      default: "Pharmacy",
      trim: true
    },

    description: {
      type: String,
      default: "",
      trim: true
    },

    semesters: {
      type: [semesterSchema],
      default: []
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

const Course =
  mongoose.models.Course ||
  mongoose.model("Course", courseSchema);

export default Course;