
import mongoose from "mongoose";

const onlinePaymentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    feeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentFee",
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

    session: {
      type: String,
      required: true,
      trim: true
    },

    semester: {
      type: String,
      required: true,
      trim: true
    },

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true
    },

    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true
    },

    amount: {
      type: Number,
      required: true,
      min: 1
    },

    currency: {
      type: String,
      default: "INR",
      required: true
    },

    status: {
      type: String,
      enum: ["CREATED", "PAID", "FAILED"],
      default: "CREATED",
      required: true
    },

    receiptNo: {
      type: String,
      unique: true,
      sparse: true
    },

    verifiedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const ERPOnlinePayment =
  mongoose.models.ERPOnlinePayment ||
  mongoose.model("ERPOnlinePayment", onlinePaymentSchema);

export default ERPOnlinePayment;
