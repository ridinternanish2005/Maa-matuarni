import express from "express";
import {
  createAdmission,
  getAdmissions,
} from "../controllers/admissionController.js";

const router = express.Router();

router.post("/", createAdmission);
router.get("/", getAdmissions);

export default router;