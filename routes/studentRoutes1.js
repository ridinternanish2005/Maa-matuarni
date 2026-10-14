
import express from "express";

import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} from "../controllers/studentController1.js";

import principalOnly from "../middleware/principalOnly.js";

const router = express.Router();

// All student CRUD routes require principal login
router.use(principalOnly);

router.post("/", createStudent);
router.get("/", getStudents);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

export default router;
