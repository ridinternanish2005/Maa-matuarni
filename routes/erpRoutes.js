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
import { requireERPRole } from "../middleware/erpAuth.js";


const router = express.Router();
router.get(
  "/admin",
  requireERPRole("admin"),
  getAdminDashboard
);

// ==========================================
// ADMIN USER MANAGEMENT
// ==========================================
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


// Authentication
router.get("/", showLogin);
router.post("/login", login);
router.post("/logout", logout);
router.get("/logout", logout); // convenient browser fallback

// Protected role-based dashboards.
// The role is read from the server-side session, never from the URL/user input alone.
router.get("/student", requireERPRole("student"), (req, res) => {
  res.render("ERP/student", { erpUser: req.session.erpUser });
});

router.get("/faculty", requireERPRole("faculty"), (req, res) => {
  res.render("ERP/faculty", { erpUser: req.session.erpUser });
});


router.get("/principal", requireERPRole("principal"), (req, res) => {
  res.render("ERP/principal", { erpUser: req.session.erpUser });
});





export default router;
