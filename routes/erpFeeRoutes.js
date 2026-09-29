import express from "express";

import {
  saveStudentFee
} from "../controllers/erpFeeController.js";

import { requireERPRole } from "../middleware/erpAuth.js";

const router = express.Router();


// ==========================================
// ADMIN - SAVE / UPDATE STUDENT FEES
// ==========================================
// Fee Management Page
router.get(
  "/fee-management",
  requireERPRole("admin"),
  (req, res) => {
    res.render("ERP/fee-management", {
      erpUser: req.session.erpUser
    });
  }
);
// Save / Update Fees
router.post(
  "/fees",
  requireERPRole("admin"),
  saveStudentFee
);


export default router;