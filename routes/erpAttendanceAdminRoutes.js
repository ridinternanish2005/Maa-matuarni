import express from "express";

import {
  showMarkAttendance,
  saveAttendance
} from "../controllers/erpAttendanceAdminController.js";

import { requireERPRole } from "../middleware/erpAuth.js";

const router = express.Router();


// ==========================================
// ADMIN / FACULTY - MARK ATTENDANCE
// ==========================================

router.get(
  "/mark-attendance",
  requireERPRole("admin", "faculty"),
  showMarkAttendance
);


router.post(
  "/mark-attendance",
  requireERPRole("admin", "faculty"),
  saveAttendance
);


export default router;