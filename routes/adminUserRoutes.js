import express from "express";

import {
  getUsers,
  createUser
} from "../controllers/adminController.js";

import {
  requireAdmin
} from "../middleware/adminAuth.js";


const router = express.Router();


// ==========================================
// GET ALL USERS
// ==========================================

router.get(
  "/",
  requireAdmin,
  getUsers
);


// ==========================================
// CREATE USER
// ==========================================

router.post(
  "/",
  requireAdmin,
  createUser
);


export default router;