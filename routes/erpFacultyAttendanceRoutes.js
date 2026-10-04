import express from "express";

import {
  getFacultyAttendance,
  saveFacultyAttendance
} from "../controllers/erpFacultyAttendanceController.js";

import {
  requireERPRole
} from "../middleware/erpAuth.js";

const router = express.Router();


// Faculty Attendance Page

router.get(
  "/attendance",
  requireERPRole("faculty"),
  getFacultyAttendance
);


// Save Attendance

router.post(
  "/attendance",
  requireERPRole("faculty"),
  saveFacultyAttendance
);


export default router;