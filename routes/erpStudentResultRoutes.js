import express from "express";

import {
    getStudentResults,
    getStudentResultsData
} from "../controllers/erpStudentResultController.js";
import {
  requireERPRole
} from "../middleware/erpAuth.js";


const router = express.Router();


// ======================================================
// STUDENT RESULTS
// ======================================================
router.get(
    "/results",
    requireERPRole("student"),
    getStudentResults
);

router.get(
    "/results/data",
    requireERPRole("student"),
    getStudentResultsData
);

export default router;