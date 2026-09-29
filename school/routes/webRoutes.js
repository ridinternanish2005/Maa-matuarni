import express from "express";

const router = express.Router();

// Home
router.get("", (req, res) => {
    res.render("index");
});

// Admission1
router.get("/admission1", (req, res) => {
    res.render("admission1");
});

// Contact
router.get("/contact", (req, res) => {
    res.render("contact");
});

// Feedback
router.get("/feedback", (req, res) => {
    res.render("feedback");
});

// Navbar
router.get("/navbar", (req, res) => {
    res.render("partials/navbar.ejs");
});

// Director
router.get("/director", (req, res) => {
    res.render("director.ejs");
});

// Principal
router.get("/principal", (req, res) => {
    res.render("principal.ejs");
});

// Admission
router.get("/admission", (req, res) => {
    res.render("admission.ejs");
});

// Gallery
router.get("/galleary", (req, res) => {
    res.render("galleary.ejs");
});

// Infrastructure
router.get("/infrastructure", (req, res) => {
    res.render("Infrastructure.ejs");
});

// About
router.get("/about", (req, res) => {
    res.render("about");
});
// ....................................
router.get("/", (req, res) => {
  res.render("school/index");
});

router.get("/about", (req, res) => {
  res.render("school/about");
});

router.get("/contact", (req, res) => {
  res.render("school/contact");
});

export default router;