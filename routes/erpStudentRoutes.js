import express from "express";

import {
  getStudentDashboard,
  getStudentProfile,
  saveStudentProfile
} from "../controllers/erpStudentController.js";

import { requireERPRole } from "../middleware/erpAuth.js";

const router = express.Router();

router.get(
  "/dashboard",
  requireERPRole("student"),
  getStudentDashboard
);

router.get(
  "/profile",
  requireERPRole("student"),
  getStudentProfile
);

router.post(
  "/profile",
  requireERPRole("student"),
  saveStudentProfile
);

export default router;