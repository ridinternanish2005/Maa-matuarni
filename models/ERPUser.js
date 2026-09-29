import mongoose from "mongoose";

const erpUserSchema = new mongoose.Schema(
  {
    enrollment: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "faculty", "admin", "principal"],
      required: true,
      index: true,
    },
    session: {
      type: String,
      required: true,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.ERPUser || mongoose.model("ERPUser", erpUserSchema);
