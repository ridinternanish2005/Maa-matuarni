import express from "express";
import {
  createAdmission
} from "../controllers/admissionController.js";

const router = express.Router();

router.post("/", createAdmission);

export default router;