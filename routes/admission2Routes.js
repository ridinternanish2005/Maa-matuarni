import express from "express"; 
const router = express.Router()

 router.get("/c",(req,res)=>{
    res.render("Admission/allcourecs")
 })

 router.get("/enqueary",(req,res)=>{
    res.render("Admission/enquiry")
 })

  router.get("/code",(req,res)=>{
        res.render("Admission/code")
    })
    router.get("/slide",(req,res)=>{
        res.render("Admission/slide")
    })
    export default router;