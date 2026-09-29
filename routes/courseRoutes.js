import express from "express";
import { getAllCourses } from "../controllers/courseController.js";

const router = express.Router();

router.get("/allcourses", getAllCourses);

export default router;