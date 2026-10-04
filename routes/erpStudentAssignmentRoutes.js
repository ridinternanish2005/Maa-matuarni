import express from "express";

import {
  getStudentAssignments
} from "../controllers/erpAssignmentController.js";

import { requireERPRole } from "../middleware/erpAuth.js";

const router = express.Router();


router.get(
  "/assignments",
  requireERPRole("student"),
  getStudentAssignments
);


export default router;