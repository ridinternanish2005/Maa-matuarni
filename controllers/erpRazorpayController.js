
import crypto from "crypto";
import Razorpay from "razorpay";
import User from "../models/User.js";
import StudentFee from "../models/StudentFee.js";
import ERPOnlinePayment from "../models/ERPOnlinePayment.js";

const getRazorpay = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return null;
  }

  return {
    client: new Razorpay({ key_id, key_secret }),
    key_id,
    key_secret
  };
};

// Create an order for the logged-in student's pending semester fee
export const createFeeOrder = async (req, res) => {
  try {
    const sessionUser = req.session?.erpUser;

    if (!sessionUser?.enrollment) {
      return res.status(401).json({
        success: false,
        message: "Please log in again."
      });
    }

    const razorpay = getRazorpay();

    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: "Online payment is not configured yet."
      });
    }

    const user = await User.findOne({
      enrollment: sessionUser.enrollment,
      role: "student",
      active: { $ne: false }
    }).select("name enrollment role session active");

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Active student account not found."
      });
    }

    const { feeId } = req.body;

    if (!feeId || !/^[a-f\d]{24}$/i.test(feeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid fee record."
      });
    }

    const fee = await StudentFee.findOne({
      _id: feeId,
      enrollment: user.enrollment,
      session: user.session,
      active: true
    });

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found."
      });
    }

    const pending = Number(fee.pendingFees);

    if (!Number.isFinite(pending) || pending <= 0) {
      return res.status(400).json({
        success: false,
        message: "No pending fee is available for payment."
      });
    }

    const amountPaise = Math.round(pending * 100);

    if (amountPaise < 100) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be at least ₹1."
      });
    }

const order = await razorpay.client.orders.create({
  amount: amountPaise,
  currency: "INR",
  receipt: `fee_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
  notes: {
    enrollment: user.enrollment,
    feeId: fee._id.toString(),
    session: fee.session,
    semester: fee.semester
  }
});

await ERPOnlinePayment.create({
  studentId: user._id,
  feeId: fee._id,
  enrollment: user.enrollment,
  session: fee.session,
  semester: fee.semester,
  razorpayOrderId: order.id,
  amount: amountPaise,
  currency: "INR",
  status: "CREATED"
});
  
    return res.json({
      success: true,
      keyId: razorpay.key_id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      studentName: user.name,
      enrollment: user.enrollment,
      semester: fee.semester
    });
  } catch (error) {
    console.error("Create Razorpay Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to start online payment."
    });
  }
};

// Verify the Razorpay checkout signature.
// Fee history is updated only after server-side payment verification is added.

export const verifyFeePayment = async (req, res) => {
  let dbSession;

  try {
    const sessionUser = req.session?.erpUser;

    if (!sessionUser?.enrollment) {
      return res.status(401).json({
        success: false,
        message: "Please log in again."
      });
    }

    const razorpay = getRazorpay();

    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: "Online payment is not configured yet."
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      feeId
    } = req.body;

    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string" ||
      typeof feeId !== "string" ||
      !/^[a-f\d]{24}$/i.test(feeId) ||
      !/^[a-f\d]{64}$/i.test(razorpay_signature)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment verification details."
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", razorpay.key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expected = Buffer.from(expectedSignature, "hex");
    const received = Buffer.from(razorpay_signature, "hex");

    if (
      expected.length !== received.length ||
      !crypto.timingSafeEqual(expected, received)
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed."
      });
    }

    const user = await User.findOne({
      enrollment: sessionUser.enrollment,
      role: "student",
      active: { $ne: false }
    }).select("name enrollment session active");

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Active student account not found."
      });
    }

    const fee = await StudentFee.findOne({
      _id: feeId,
      enrollment: user.enrollment,
      session: user.session,
      active: true
    });

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found."
      });
    }

    // Verify payment directly with Razorpay.
    const order = await razorpay.client.orders.fetch(
      razorpay_order_id
    );

    const payment = await razorpay.client.payments.fetch(
      razorpay_payment_id
    );

    if (
      order.notes?.feeId !== fee._id.toString() ||
      order.notes?.enrollment !== user.enrollment ||
      order.notes?.session !== fee.session ||
      order.notes?.semester !== fee.semester ||
      order.currency !== "INR" ||
      payment.order_id !== order.id ||
      payment.currency !== "INR" ||
      payment.amount !== order.amount ||
      payment.status !== "captured"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment does not match this fee record or is not captured."
      });
    }

    const amountRupees = payment.amount / 100;

    if (!Number.isFinite(amountRupees) || amountRupees <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount."
      });
    }

    // Both database changes must succeed together.
    dbSession = await StudentFee.startSession();

    let result;

    await dbSession.withTransaction(async () => {
      const onlinePayment = await ERPOnlinePayment.findOne({
        razorpayOrderId: order.id,
        studentId: user._id,
        feeId: fee._id,
        enrollment: user.enrollment,
        amount: order.amount
      }).session(dbSession);

      // Safe response for a repeated verification request.
      if (
        onlinePayment?.status === "PAID" &&
        onlinePayment.razorpayPaymentId === payment.id
      ) {
        result = {
          success: true,
          receiptNo: onlinePayment.receiptNo,
          alreadyProcessed: true
        };
        return;
      }

      if (
        !onlinePayment ||
        onlinePayment.status !== "CREATED" ||
        onlinePayment.razorpayPaymentId
      ) {
        const error = new Error(
          "Payment already processed or order not found."
        );
        error.statusCode = 409;
        throw error;
      }

      // Read the latest fee inside the transaction.
      const currentFee = await StudentFee.findOne({
        _id: fee._id,
        enrollment: user.enrollment,
        session: user.session,
        active: true
      }).session(dbSession);

      if (!currentFee) {
        const error = new Error("Fee record not found.");
        error.statusCode = 404;
        throw error;
      }

      const pending = Math.max(
        Number(currentFee.totalFees || 0) -
          Number(currentFee.paidFees || 0),
        0
      );

      // Prevent two different orders from crediting more than the fee.
      if (amountRupees > pending) {
        const error = new Error(
          "This payment exceeds the current pending fee. Please contact the college office."
        );
        error.statusCode = 409;
        throw error;
      }

      const receiptNo =
        `RZP-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

      currentFee.paidFees =
        Number(currentFee.paidFees || 0) + amountRupees;

      currentFee.payments.push({
        receiptNo,
        amount: amountRupees,
        paymentMode: "Online",
        transactionId: payment.id,
        paymentDate: new Date(),
        status: "SUCCESS",
        remarks: `Razorpay payment; order ${order.id}`
      });

      onlinePayment.status = "PAID";
      onlinePayment.razorpayPaymentId = payment.id;
      onlinePayment.receiptNo = receiptNo;
      onlinePayment.verifiedAt = new Date();

      // If either save fails, the transaction rolls back both changes.
      await currentFee.save({ session: dbSession });
      await onlinePayment.save({ session: dbSession });

      result = {
        success: true,
        receiptNo,
        alreadyProcessed: false
      };
    });

    if (!result?.success) {
      return res.status(500).json({
        success: false,
        message: "Unable to confirm payment. Please check with the college office."
      });
    }

    return res.json({
      success: true,
      message: result.alreadyProcessed
        ? "Payment was already verified."
        : "Payment verified and fee updated successfully.",
      receiptNo: result.receiptNo
    });
  } catch (error) {
    console.error("Verify Razorpay Payment Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Unable to verify payment right now. Please check the payment status before trying again."
    });
  } finally {
    if (dbSession) {
      await dbSession.endSession();
    }
  }
};
