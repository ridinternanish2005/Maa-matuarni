import express from "express";

import {
  getStudentResults
} from "../controllers/erpResultController.js";

import {
  requireERPRole
} from "../middleware/erpAuth.js";


const router = express.Router();


// ======================================================
// STUDENT RESULTS
// ======================================================
router.get(
  "/results",
  requireERPRole("student"),
  getStudentResults
);


export default router;