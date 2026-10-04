import express from "express";

import {
  getAdminDashboard,
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus
} from "../controllers/adminController.js";

import {
  requireAdmin
} from "../middleware/adminAuth.js";

import {
  showLogin,
  login,
  logout
} from "../controllers/erpAuthController.js";

import {
  requireERPRole
} from "../middleware/erpAuth.js";

import {
  getStudentDashboard
} from "../controllers/erpStudentController.js";


const router = express.Router();


// ==========================================
// ADMIN DASHBOARD
// ==========================================

router.get(
  "/admin",
  requireERPRole("admin"),
  getAdminDashboard
);


// ==========================================
// ADMIN USER MANAGEMENT PAGE
// ==========================================

router.get(
  "/admin/user-management",
  requireERPRole("admin"),
  (req, res) => {
    res.render("ERP/user-management", {
      erpUser: req.session.erpUser
    });
  }
);


// ==========================================
// ADMIN USER MANAGEMENT API
// ==========================================

router.get(
  "/admin/users",
  requireAdmin,
  getUsers
);

router.post(
  "/admin/users",
  requireAdmin,
  createUser
);

router.put(
  "/admin/users/:id",
  requireAdmin,
  updateUser
);

router.patch(
  "/admin/users/:id/status",
  requireAdmin,
  toggleUserStatus
);


// ==========================================
// AUTHENTICATION
// ==========================================

router.get(
  "/",
  showLogin
);

router.post(
  "/login",
  login
);

router.post(
  "/logout",
  logout
);

router.get(
  "/logout",
  logout
);


// ==========================================
// STUDENT DASHBOARD
// ==========================================

router.get(
  "/student",
  requireERPRole("student"),
  getStudentDashboard
);


// ==========================================
// FACULTY DASHBOARD
// ==========================================

router.get(
  "/faculty",
  requireERPRole("faculty"),
  (req, res) => {
    res.render("ERP/faculty", {
      erpUser: req.session.erpUser
    });
  }
);


// ==========================================
// PRINCIPAL DASHBOARD
// ==========================================

router.get(
  "/principal",
  requireERPRole("principal"),
  (req, res) => {
    res.render("ERP/principal", {
      erpUser: req.session.erpUser
    });
  }
);


export default router;