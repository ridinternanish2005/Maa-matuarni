import express from "express";

import {
  requireAdmin
} from "../middleware/adminAuth.js";

const router = express.Router();


// ======================================
// ADMIN DASHBOARD
// ======================================

router.get(
  "/dashboard",
  requireAdmin,
  (req, res) => {

    res.render("ERP/admin", {
      user: {
        name: req.session.name,
        enrollment: req.session.enrollment,
        role: req.session.role,
        session: req.session.session
      }
    });

  }
);


export default router;