import express from "express";

import {
  getFacultyManagement,
  createFacultyProfile,
  updateFacultyProfile,
  assignFacultySubjects,
  toggleFacultyStatus
} from "../controllers/facultyManagementController.js";

import { requireERPRole } from "../middleware/erpAuth.js";

const router = express.Router();

router.get(
  "/faculty-management",
  requireERPRole("admin", "principal"),
  getFacultyManagement
);

router.post(
  "/faculty-management",
  requireERPRole("admin", "principal"),
  createFacultyProfile
);

router.put(
  "/faculty-management/:id",
  requireERPRole("admin", "principal"),
  updateFacultyProfile
);

router.put(
  "/faculty-management/:id/subjects",
  requireERPRole("admin", "principal"),
  assignFacultySubjects
);

router.patch(
  "/faculty-management/:id/status",
  requireERPRole("admin", "principal"),
  toggleFacultyStatus
);

export default router;