import express from "express";

import {
  getTimetableManagement,
  createTimetable,
  getAllTimetable,
  deactivateTimetable
} from "../controllers/erpTimetableController.js";

import { requireERPRole } from "../middleware/erpAuth.js";

const router = express.Router();

router.get(
  "/timetable-management",
  requireERPRole("admin"),
  getTimetableManagement
);

router.post(
  "/timetable",
  requireERPRole("admin"),
  createTimetable
);

router.get(
  "/timetable",
  requireERPRole("admin"),
  getAllTimetable
);

router.patch(
  "/timetable/:id/deactivate",
  requireERPRole("admin"),
  deactivateTimetable
);

export default router;