import express from "express";

import {
  getFacultyMarks,
  saveFacultyMarks,
} from "../controllers/erpFacultyMarksController.js";

import { requireERPRole } from "../middleware/erpAuth.js";

const router = express.Router();

router.get(
  "/marks",
  requireERPRole("faculty"),
  getFacultyMarks
);

router.post(
  "/marks",
  requireERPRole("faculty"),
  saveFacultyMarks
);

export default router;