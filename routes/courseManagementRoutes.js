import express from "express";

import {
  getCourseManagement,
  getAllCourses,
  createCourse,
  updateCourse,
  toggleCourseStatus,
  addSemester,
  addSubject,
  toggleSemesterStatus,
  toggleSubjectStatus
} from "../controllers/courseManagementController.js";

import { requireERPRole } from "../middleware/erpAuth.js";

const router = express.Router();

// Course Management Page
router.get(
  "/course-management",
  requireERPRole("admin", "principal"),
  getCourseManagement
);

// Get all courses
router.get(
  "/courses",
  requireERPRole("admin", "principal"),
  getAllCourses
);

// Create Course
router.post(
  "/courses",
  requireERPRole("admin", "principal"),
  createCourse
);

// Update Course
router.put(
  "/courses/:id",
  requireERPRole("admin", "principal"),
  updateCourse
);

// Activate / Deactivate Course
router.patch(
  "/courses/:id/status",
  requireERPRole("admin", "principal"),
  toggleCourseStatus
);

// Add Semester
router.post(
  "/courses/:id/semesters",
  requireERPRole("admin", "principal"),
  addSemester
);

// Activate / Deactivate Semester
router.patch(
  "/courses/:id/semesters/:semesterId/status",
  requireERPRole("admin", "principal"),
  toggleSemesterStatus
);

// Add Subject
router.post(
  "/courses/:id/semesters/:semesterId/subjects",
  requireERPRole("admin", "principal"),
  addSubject
);

// Activate / Deactivate Subject
router.patch(
  "/courses/:id/semesters/:semesterId/subjects/:subjectId/status",
  requireERPRole("admin", "principal"),
  toggleSubjectStatus
);

export default router;