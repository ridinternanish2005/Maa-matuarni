
import express from "express";

import {
  createFeeOrder,
  verifyFeePayment
} from "../controllers/erpRazorpayController.js";

import { requireERPRole } from "../middleware/erpAuth.js";

const router = express.Router();

router.post(
  "/fees/create-order",
  requireERPRole("student"),
  createFeeOrder
);

router.post(
  "/fees/verify-payment",
  requireERPRole("student"),
  verifyFeePayment
);

export default router;
