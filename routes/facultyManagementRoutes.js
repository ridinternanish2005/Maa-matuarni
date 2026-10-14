import express from "express";

import {
  getFacultyManagement,
  createFacultyProfile,
  updateFacultyProfile,
  assignFacultySubjects,
  toggleFacultyStatus,
  getFacultyAssignmentCourses
} from "../controllers/facultyManagementController.js";

import { requireERPRole } from "../middleware/erpAuth.js";

const router = express.Router();

router.get(
  "/faculty-management",
  requireERPRole("admin", "principal"),
  getFacultyManagement
);
router.get(
  "/faculty-management/assignment-courses",
  requireERPRole("admin", "principal"),
  getFacultyAssignmentCourses
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