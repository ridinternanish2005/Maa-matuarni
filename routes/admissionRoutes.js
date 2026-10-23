
import express from "express";

import {
  createAdmission,
  showAdmissionForm
} from "../controllers/admissionController.js";

const router = express.Router();

router.get("/", showAdmissionForm);
router.post("/", createAdmission);

export default router;
