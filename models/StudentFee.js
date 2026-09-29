import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    receiptNo: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    amount: {
      type: Number,
      required: true,
      min: 1
    },

    paymentMode: {
      type: String,
      enum: [
        "Cash",
        "UPI",
        "Bank Transfer",
        "Cheque",
        "Online",
        "Other"
      ],
      required: true
    },

    transactionId: {
      type: String,
      trim: true,
      default: ""
    },

    paymentDate: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["SUCCESS", "PENDING", "FAILED"],
      default: "SUCCESS"
    },

    remarks: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);


const studentFeeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

    studentName: {
      type: String,
      required: true,
      trim: true
    },

    course: {
      type: String,
      required: true,
      default: "D.Pharm",
      trim: true
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

    totalFees: {
      type: Number,
      required: true,
      min: 0
    },

    paidFees: {
      type: Number,
      default: 0,
      min: 0
    },

    pendingFees: {
      type: Number,
      default: 0,
      min: 0
    },

    status: {
      type: String,
      enum: ["Paid", "Partial", "Pending"],
      default: "Pending"
    },

    payments: {
      type: [paymentSchema],
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


// Automatically calculate pending amount and status
studentFeeSchema.pre("validate", function (next) {

  this.pendingFees = Math.max(
    this.totalFees - this.paidFees,
    0
  );

  if (this.paidFees <= 0) {
    this.status = "Pending";
  } else if (this.paidFees >= this.totalFees) {
    this.status = "Paid";
  } else {
    this.status = "Partial";
  }

  next();
});


const StudentFee =
  mongoose.models.StudentFee ||
  mongoose.model("StudentFee", studentFeeSchema);

export default StudentFee;