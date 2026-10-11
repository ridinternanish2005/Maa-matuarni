import express from "express";

import {
  getFacultyLeave,
  applyFacultyLeave,
  getAllFacultyLeaves,
  updateFacultyLeaveStatus,
} from "../controllers/facultyLeaveController.js";

import { requireERPRole } from "../middleware/erpAuth.js";

const router = express.Router();


// Faculty Leave Page
router.get(
  "/faculty/leave",
  requireERPRole("faculty"),
  getFacultyLeave
);


// Faculty Apply Leave
router.post(
  "/faculty/leave",
  requireERPRole("faculty"),
  applyFacultyLeave
);


// Admin / Principal Leave Management
router.get(
  "/faculty-leave-management",
  requireERPRole("admin", "principal"),
  getAllFacultyLeaves
);


// Admin / Principal Approve / Reject
router.patch(
  "/faculty-leave-management/:id/status",
  requireERPRole("admin", "principal"),
  updateFacultyLeaveStatus
);


export default router;