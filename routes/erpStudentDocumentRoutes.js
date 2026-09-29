import express from "express";

import {
  getStudentDocuments
} from "../controllers/erpDocumentController.js";

import { requireERPRole } from "../middleware/erpAuth.js";

const router = express.Router();


// ======================================================
// STUDENT DOCUMENTS
// ======================================================

router.get(
  "/documents",
  requireERPRole("student"),
  getStudentDocuments
);


export default router;