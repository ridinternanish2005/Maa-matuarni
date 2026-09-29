import express from "express";

import {
  getNoticeManagement,
  createNotice,
  getAllNotices,
  toggleNoticeStatus
} from "../controllers/erpNoticeController.js";

import { requireERPRole } from "../middleware/erpAuth.js";

const router = express.Router();


// ======================================================
// NOTICE MANAGEMENT PAGE
// ======================================================

router.get(
  "/notice-management",
  requireERPRole("admin"),
  getNoticeManagement
);


// ======================================================
// CREATE NOTICE
// ======================================================

router.post(
  "/notices",
  requireERPRole("admin"),
  createNotice
);


// ======================================================
// GET ALL NOTICES
// ======================================================

router.get(
  "/notices",
  requireERPRole("admin"),
  getAllNotices
);


// ======================================================
// PUBLISH / UNPUBLISH
// ======================================================

router.patch(
  "/notices/:id/status",
  requireERPRole("admin"),
  toggleNoticeStatus
);


export default router;