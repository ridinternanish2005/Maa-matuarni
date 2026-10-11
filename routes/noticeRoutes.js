import express from "express";

import {
  getNoticeManagement,
  createNotice,
  deleteNotice,
  getFacultyNotices,
  getStudentNotices,
  toggleNoticeStatus
} from "../controllers/noticeController.js";

import { requireERPRole } from "../middleware/erpAuth.js";

const router = express.Router();

router.get(
  "/notice-management",
  requireERPRole("admin", "principal"),
  getNoticeManagement
);

router.post(
  "/notice-management",
  requireERPRole("admin", "principal"),
  createNotice
);

router.patch(
  "/notice-management/:id/status",
  requireERPRole("admin", "principal"),
  toggleNoticeStatus
);

router.delete(
  "/notice-management/:id",
  requireERPRole("admin", "principal"),
  deleteNotice
);

router.get(
  "/faculty/notices",
  requireERPRole("faculty"),
  getFacultyNotices
);

router.get(
  "/student/notices",
  requireERPRole("student"),
  getStudentNotices
);

export default router;