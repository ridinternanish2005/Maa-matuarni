import express from "express";

import {
  getFacultyDashboard
} from "../controllers/erpFacultyController.js";

import {
  getFacultyTimetable
} from "../controllers/erpTimetableController.js";

import {
  getFacultyNotices
} from "../controllers/erpNoticeController.js";

import {
  requireERPRole
} from "../middleware/erpAuth.js";

const router = express.Router();


// Faculty Dashboard
router.get(
  "/",
  requireERPRole("faculty"),
  getFacultyDashboard
);


// Faculty Timetable
router.get(
  "/timetable",
  requireERPRole("faculty"),
  getFacultyTimetable
);


// Faculty Notices
router.get(
  "/notices",
  requireERPRole("faculty"),
  getFacultyNotices
);


export default router;