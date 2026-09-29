import express from "express";

import {
  getDocumentManagement,
  createStudentDocument,
  getAllStudentDocuments,
  deactivateStudentDocument
} from "../controllers/erpDocumentController.js";

import {
  requireERPRole
} from "../middleware/erpAuth.js";


const router = express.Router();


// ======================================================
// DOCUMENT MANAGEMENT PAGE
// ======================================================
router.get(
  "/document-management",
  requireERPRole("admin"),
  getDocumentManagement
);


// ======================================================
// CREATE DOCUMENT
// ======================================================
router.post(
  "/documents",
  requireERPRole("admin"),
  createStudentDocument
);


// ======================================================
// GET ALL DOCUMENTS
// ======================================================
router.get(
  "/documents",
  requireERPRole("admin"),
  getAllStudentDocuments
);


// ======================================================
// DEACTIVATE DOCUMENT
// ======================================================
router.patch(
  "/documents/:id/deactivate",
  requireERPRole("admin"),
  deactivateStudentDocument
);


export default router;