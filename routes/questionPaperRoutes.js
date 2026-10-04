import express from "express";
import multer from "multer";

import {
  uploadQuestionPaper,
  getStudentQuestionPapers,
  viewQuestionPaper,
} from "../controllers/questionPaperController.js";

import { requireERPRole } from "../middleware/erpAuth.js";

const router = express.Router();


// Store file temporarily in memory
const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(
        new Error("Only PDF files are allowed.")
      );
    }
  },
});
// ==========================================
// FACULTY QUESTION PAPER PAGE
// ==========================================

router.get(
  "/faculty/question-papers",
  requireERPRole("faculty", "admin", "principal"),
  (req, res) => {
    res.render("ERP/faculty-question-papers", {
      erpUser: req.session.erpUser
    });
  }
);

// ==========================================
// FACULTY / ADMIN UPLOAD
// ==========================================

router.post(
  "/faculty/question-papers/upload",
  requireERPRole(
    "faculty",
    "admin",
    "principal"
  ),
  upload.single("questionPaper"),
  uploadQuestionPaper
);


// ==========================================
// STUDENT QUESTION PAPERS
// ==========================================

router.get(
  "/students/question-papers",
  requireERPRole("student"),
  getStudentQuestionPapers
);


// ==========================================
// VIEW PDF
// ==========================================

router.get(
  "/question-papers/:id/view",
  requireERPRole(
    "student",
    "faculty",
    "admin",
    "principal"
  ),
  viewQuestionPaper
);


export default router;