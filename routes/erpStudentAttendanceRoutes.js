import express from "express";

import {
  getAttendance
} from "../controllers/erpStudentAttendanceController.js";

import { requireERPRole } from "../middleware/erpAuth.js";

const router = express.Router();

// ==========================================
// STUDENT ATTENDANCE
// ==========================================

router.get(
  "/attendance",
  requireERPRole("student"),
  getAttendance
);

export default router;