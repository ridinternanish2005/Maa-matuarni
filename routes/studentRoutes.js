import express from "express";
import { createStudent, getStudents } from "../controllers/studentController.js";

const router = express.Router();

router.post("/students", createStudent);
router.get("/students", getStudents);
router.get("/students/:id", getStudentById);
router.put("/students/:id", updateStudent);
router.delete("/students/:id", deleteStudent);

export default router;