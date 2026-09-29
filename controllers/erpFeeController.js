import User from "../models/User.js";
import StudentFee from "../models/StudentFee.js";

// ==========================================
// SAVE / UPDATE STUDENT FEE
// ==========================================
export const saveStudentFee = async (req, res) => {
  try {
    const {
      enrollment,
      semester,
      totalFees,
      paidFees,
      paymentDate,
      paymentMode,
      transactionId,
      remarks
    } = req.body;

    // Required fields
    if (
      !enrollment ||
      !semester ||
      totalFees === undefined ||
      paidFees === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Enrollment, semester, total fees and paid fees are required."
      });
    }

    // Find student
    const student = await User.findOne({
      enrollment: enrollment.trim().toUpperCase(),
      role: "student",
      active: true
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found."
      });
    }

    const total = Number(totalFees);
    const currentPayment = Number(paidFees);

    // Validate amount
    if (
      Number.isNaN(total) ||
      Number.isNaN(currentPayment)
    ) {
      return res.status(400).json({
        success: false,
        message: "Fees must be valid numbers."
      });
    }

    if (total < 0 || currentPayment < 0) {
      return res.status(400).json({
        success: false,
        message: "Fees cannot be negative."
      });
    }

    if (currentPayment > total) {
      return res.status(400).json({
        success: false,
        message:
          "Current payment cannot be greater than total fees."
      });
    }

    const selectedSemester = semester.trim();

    // Find existing fee record
    let fee = await StudentFee.findOne({
      enrollment: student.enrollment,
      session: student.session,
      semester: selectedSemester
    });

    // ==========================================
    // EXISTING FEE RECORD
    // ==========================================
    if (fee) {
      const previousPaid = fee.paidFees || 0;

      const newPaidAmount =
        previousPaid + currentPayment;

      if (newPaidAmount > total) {
        return res.status(400).json({
          success: false,
          message:
            "Total paid amount cannot be greater than total fees."
        });
      }

      fee.totalFees = total;
      fee.paidFees = newPaidAmount;

      const receiptNo =
        `FEE-${new Date().getFullYear()}-${Date.now()}`;

      fee.payments.push({
        receiptNo: receiptNo,
        amount: currentPayment,
        paymentMode: paymentMode || "Cash",
        transactionId: transactionId?.trim() || "",
        paymentDate: paymentDate
          ? new Date(paymentDate)
          : new Date(),
        status: "SUCCESS",
        remarks: remarks?.trim() || ""
      });

      await fee.save();

      return res.json({
        success: true,
        message: "Student fees updated successfully.",
        receiptNo: receiptNo,
        fee: fee
      });
    }

    // ==========================================
    // NEW FEE RECORD
    // ==========================================

    const receiptNo =
      `FEE-${new Date().getFullYear()}-${Date.now()}`;

    fee = await StudentFee.create({
      studentId: student._id,

      enrollment: student.enrollment,

      studentName: student.name,

      course: "D.Pharm",

      session: student.session,

      semester: selectedSemester,

      totalFees: total,

      paidFees: currentPayment,

      payments: [
        {
          receiptNo: receiptNo,
          amount: currentPayment,
          paymentMode: paymentMode || "Cash",
          transactionId: transactionId?.trim() || "",
          paymentDate: paymentDate
            ? new Date(paymentDate)
            : new Date(),
          status: "SUCCESS",
          remarks: remarks?.trim() || ""
        }
      ],

      active: true
    });

    return res.status(201).json({
      success: true,
      message: "Student fees saved successfully.",
      receiptNo: receiptNo,
      fee: fee
    });

  } catch (error) {

    console.error("=================================");
    console.error("SAVE STUDENT FEE ERROR");
    console.error("Message:", error.message);
    console.error("Name:", error.name);
    console.error("=================================");

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};