import User from "../models/User.js";
import StudentFee from "../models/StudentFee.js";


// ======================================================
// STUDENT FEES PAGE
// ======================================================
export const getStudentFees = async (req, res) => {
  try {

    // ------------------------------------------
    // Check student login
    // ------------------------------------------
    if (!req.session?.erpUser) {
      return res.redirect("/erp");
    }


    // ------------------------------------------
    // Get logged-in student's enrollment
    // ------------------------------------------
    const enrollment =
      req.session.erpUser.enrollment;


    // ------------------------------------------
    // Find student from MongoDB
    // ------------------------------------------
    const user = await User.findOne({
      enrollment: enrollment,
      role: "student"
    }).select(
      "name enrollment role session active"
    );


    // ------------------------------------------
    // Student not found
    // ------------------------------------------
    if (!user) {
      return res.status(404).send(
        "Student account not found."
      );
    }


    // ------------------------------------------
    // Check account status
    // ------------------------------------------
    if (user.active === false) {

      req.session.destroy(() => {});

      return res.status(403).send(
        "Your account has been deactivated."
      );
    }


    // ------------------------------------------
    // Get ONLY logged-in student's fees
    // ------------------------------------------
    const fees = await StudentFee.find({
      enrollment: user.enrollment,
      session: user.session,
      active: true
    })
      .sort({ semester: 1 })
      .lean();


    // ------------------------------------------
    // Calculate total fees
    // ------------------------------------------
    let totalFees = 0;
    let paidFees = 0;
    let pendingFees = 0;


    fees.forEach((fee) => {

      totalFees += Number(
        fee.totalFees || 0
      );

      paidFees += Number(
        fee.paidFees || 0
      );

      pendingFees += Number(
        fee.pendingFees || 0
      );

    });


    // ------------------------------------------
    // Render Student Fees page
    // ------------------------------------------
    return res.render(
      "ERP/student-fees",
      {
        erpUser: req.session.erpUser,

        user: user,

        fees: fees,

        summary: {
          totalFees: totalFees,
          paidFees: paidFees,
          pendingFees: pendingFees
        }
      }
    );


  } catch (error) {

    console.error(
      "Student Fees Error:",
      error
    );

    return res.status(500).send(
      "Unable to load student fees."
    );
  }
};



// ======================================================
// STUDENT FEE RECEIPT
// ======================================================
export const getFeeReceipt = async (req, res) => {
  try {

    // ------------------------------------------
    // Check login
    // ------------------------------------------
    if (!req.session?.erpUser) {
      return res.redirect("/erp");
    }


    // ------------------------------------------
    // Get logged-in student's enrollment
    // ------------------------------------------
    const enrollment =
      req.session.erpUser.enrollment;


    // ------------------------------------------
    // Get receipt number from URL
    // ------------------------------------------
    const receiptNo =
      req.params.receiptNo;


    // ------------------------------------------
    // Find receipt
    //
    // IMPORTANT:
    // Receipt must belong to logged-in student
    // ------------------------------------------
    const fee = await StudentFee.findOne({
      enrollment: enrollment,
      "payments.receiptNo": receiptNo
    }).lean();


    // ------------------------------------------
    // Receipt not found
    // ------------------------------------------
    if (!fee) {
      return res.status(404).send(
        "Fee receipt not found."
      );
    }


    // ------------------------------------------
    // Find exact payment/receipt
    // ------------------------------------------
    const payment = fee.payments.find(
      (item) => item.receiptNo === receiptNo
    );


    // ------------------------------------------
    // Payment not found
    // ------------------------------------------
    if (!payment) {
      return res.status(404).send(
        "Payment receipt not found."
      );
    }


    // ------------------------------------------
    // Render Fee Receipt
    // ------------------------------------------
    return res.render(
      "ERP/fee-receipt",
      {
        erpUser: req.session.erpUser,

        fee: fee,

        payment: payment
      }
    );


  } catch (error) {

    console.error(
      "Fee Receipt Error:",
      error
    );

    return res.status(500).send(
      "Unable to load fee receipt."
    );
  }
};