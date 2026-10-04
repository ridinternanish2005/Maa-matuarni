import express from "express";

import {
  getFacultyManagement,
  getAllFaculty,
  saveFacultyProfile,
  toggleFacultyStatus
} from "../controllers/erpFacultyController.js";

import { requireERPRole } from "../middleware/erpAuth.js";

const router = express.Router();


// Faculty Management Page

router.get(
  "/faculty-management",
  requireERPRole("admin"),
  getFacultyManagement
);


// Get all faculty

router.get(
  "/faculty",
  requireERPRole("admin"),
  getAllFaculty
);


// Save faculty profile

router.post(
  "/faculty/profile",
  requireERPRole("admin"),
  saveFacultyProfile
);


// Activate / Deactivate faculty

router.patch(
  "/faculty/:id/status",
  requireERPRole("admin"),
  toggleFacultyStatus
);


export default router;