import express from "express";

import {
  getFacultyDashboard
} from "../controllers/erpFacultyController.js";

import {
  requireERPRole
} from "../middleware/erpAuth.js";

const router = express.Router();


router.get(
  "/",
  requireERPRole("faculty"),
  getFacultyDashboard
);


export default router;