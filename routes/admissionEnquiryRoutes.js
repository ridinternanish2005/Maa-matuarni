import express from "express";
import {
  createAdmissionEnquiry,
} from "../controllers/admissionEnquiryController.js";

const router = express.Router();

router.post("/", createAdmissionEnquiry);

export default router;