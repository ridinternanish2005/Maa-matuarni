import express from "express";

import {
  getStudentFees,
  getFeeReceipt
} from "../controllers/erpStudentFeeController.js";

import { requireERPRole } from "../middleware/erpAuth.js";

const router = express.Router();


// ======================================================
// STUDENT FEES PAGE
// ======================================================
router.get(
  "/fees",
  requireERPRole("student"),
  getStudentFees
);


// ======================================================
// STUDENT FEE RECEIPT
// ======================================================
router.get(
  "/fees/receipt/:receiptNo",
  requireERPRole("student"),
  getFeeReceipt
);


// ======================================================
// EXPORT ROUTER
// ======================================================
export default router;