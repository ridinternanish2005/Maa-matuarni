import express from "express";

import {
  getStudentNotices
} from "../controllers/erpNoticeController.js";

import { requireERPRole } from "../middleware/erpAuth.js";

const router = express.Router();


// ======================================================
// STUDENT NOTICES
// ======================================================

router.get(
  "/notices",
  requireERPRole("student"),
  getStudentNotices
);


// ======================================================
// DEFAULT EXPORT
// ======================================================

export default router;