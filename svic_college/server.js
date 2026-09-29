// server.js

import express from "express";
import dotenv from "dotenv";

import path from "path";

import admissionRoutes from "./routes/admissionRoutes.js";


const router = express.Router();

router.get("/",(req,res)=>{
    res.render("svic.ejs")
});
router.get("/navbar", (req, res) => {
    res.render("partials/header.ejs");
});
router.get("/admission", (req, res) => {
    res.render("admissionfrom.ejs");
});
router.get("/apply", (req, res) => {
    res.render("apply.ejs");
});
router.get("/contact", (req, res) => {
    res.render("class10th.ejs");
});
router.get("/class12th",(req,res)=>{
    res.render("class12th.ejs")
})
router.get("/fee",(req,res)=>{
    res.render("fees.ejs")
})

router.get("/login", (req, res) => {
    res.render("login.ejs");
});
router.get("/notice", (req, res) => {
    res.render("notice.ejs");
});

router.get("/procedure", (req, res) => {
    res.render("Procedure.ejs");
});
router.get("/register", (req, res) => {
    res.render("register.ejs");
});

router.get("/why", (req, res) => {
    res.render("why.ejs");
});

router.get("/teacher", (req, res) => {
    res.render("teacher.ejs");
});

router.use("/", admissionRoutes);


export default router;