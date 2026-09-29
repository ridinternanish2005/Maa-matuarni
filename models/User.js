import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    enrollment: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    role: {
      type: String,
      enum: [
        "student",
        "faculty",
        "admin",
        "principal"
      ],
      required: true,
      index: true
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
  },
  {
    timestamps: true
  }
);

const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

export default User;