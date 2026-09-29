import mongoose from "mongoose";

const adminUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
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
      trim: true
    },

    active: {
      type: Boolean,
      default: true,
      index: true
    },

    mustChangePassword: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const AdminUser =
  mongoose.models.AdminUser ||
  mongoose.model("AdminUser", adminUserSchema);

export default AdminUser;