import express from "express";

import {
  getStudentTimetable
} from "../controllers/erpTimetableController.js";

import { requireERPRole } from "../middleware/erpAuth.js";

const router = express.Router();


// ======================================================
// STUDENT TIMETABLE
// ======================================================

router.get(
  "/timetable",
  requireERPRole("student"),
  getStudentTimetable
);


export default router;