import express from "express";
import dotenv from "dotenv";

import path from "path";
// import admissionRouter from "./routes/admissionRoutermsd.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";


// const app = express();
// const PORT = process.env.PORT || 5000;
const router = express.Router();
// Middleware
// app.use(express.json());

// app.use(express.urlencoded({
//     extended: true
// }));




// // View Engine
// app.set("view engine", "ejs");
// app.set("views", path.join(process.cwd(), "views"));

// // Static Folder
// app.use(express.static(path.join(process.cwd(), "public")));


router.get("/",(req,res)=>{
res.render("school.ejs")

})
router.get("/admission1",(req,res)=>{
  res.render("admission1")
})
router.get("/contact",(req,res)=>{
  res.render("contactschool")

})
router.get("/feedback",(req,res)=>{
  res.render("feedback")
})
router.get("/navbar",(req,res)=>{
  res.render("partials/navbar.ejs")
})
router.get("/director",(req,res)=>{
  res.render("director.ejs")
})
router.get("/principal",(req,res)=>{
  res.render("principal.ejs")
})
router.get("/admission",(req,res)=>{
  res.render("admission.ejs")
})
router.get("/galleary",(req,res)=>{
  res.render("galleary.ejs")
})
router.get("/infrastructure",(req,res)=>{
  res.render("Infrastructure.ejs")
})
router.get("/about",(req,res)=>{
  res.render("about")
})
router.get("/activities",(req,res)=>{
  res.render("activities.ejs")
})
router.get("/activities",(req,res)=>{
  res.render("activities.ejs")
})
// .........................routes..........
// Routes
// router.use("/", routes);

// app.use("/", feedbackRoutes);
// app.use("/", admissionRouter);

export default router;