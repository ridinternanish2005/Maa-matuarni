import express from "express";

import {
  getStudentAcademicManagement,
  getAcademicCourses,
  assignStudentAcademic
} from "../controllers/studentAcademicController.js";

import { requireERPRole } from "../middleware/erpAuth.js";

const router = express.Router();


// ==========================================
// STUDENT ACADEMIC MANAGEMENT
// ==========================================

router.get(
  "/student-academic-management",
  requireERPRole("admin", "principal"),
  getStudentAcademicManagement
);


// ==========================================
// GET COURSES
// ==========================================

router.get(
  "/academic-courses",
  requireERPRole("admin", "principal"),
  getAcademicCourses
);


// ==========================================
// ASSIGN COURSE + SEMESTER
// ==========================================

router.post(
  "/student-academic-management/assign",
  requireERPRole("admin", "principal"),
  assignStudentAcademic
);


export default router;