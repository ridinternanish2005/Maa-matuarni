import express from "express";

import {
  getResultManagement,
  saveStudentResult,
  getAllResults
} from "../controllers/erpResultController.js";

import {
  requireERPRole
} from "../middleware/erpAuth.js";


const router = express.Router();


// ======================================================
// RESULT MANAGEMENT PAGE
// ======================================================
router.get(
  "/result-management",
  requireERPRole("admin"),
  getResultManagement
);


// ======================================================
// SAVE RESULT
// ======================================================
router.post(
  "/results",
  requireERPRole("admin"),
  saveStudentResult
);


// ======================================================
// GET ALL RESULTS
// ======================================================
router.get(
  "/results",
  requireERPRole("admin"),
  getAllResults
);


export default router;