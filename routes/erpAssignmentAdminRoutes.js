import express from "express";

import {
  getAssignmentManagement,
  createAssignment,
  getAllAssignments,
  deactivateAssignment
} from "../controllers/erpAssignmentController.js";

import { requireERPRole } from "../middleware/erpAuth.js";

const router = express.Router();


router.get(
  "/assignment-management",
  requireERPRole("admin"),
  getAssignmentManagement
);


router.post(
  "/assignments",
  requireERPRole("admin"),
  createAssignment
);


router.get(
  "/assignments",
  requireERPRole("admin"),
  getAllAssignments
);


router.patch(
  "/assignments/:id/deactivate",
  requireERPRole("admin"),
  deactivateAssignment
);


export default router;