import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index.ejs");
});

router.get("/about",(req,res)=>{
  res.render("about/about.ejs")
})

router.get("/contact", (req, res) => {
  res.render("Contact");
});
///////////////////////////////////////////////////////admission//////
router.get("/admission", (req, res) => {
  res.render("Admission/admission.ejs");
});
//////////////////////////////////////////////////
// router.get("/allcourecs", (req, res) => {
//   res.render("Admission/allcourecs.ejs");
// });
router.get("/rep",(req,res)=>{
  res.render("ERP/login.ejs")
})
router.get("/enquary",(req,res)=>{
  res.render("Admission/enquiry.ejs")
})
router.get("/code",(req,res)=>{
  res.render("Admission/code.ejs")
})
router.get("/procedure",(req,res)=>{
  res.render("Admission/procedure.ejs")
})
//////////////////////////////////////////////////
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
    router.get("/why",(req,res)=>{
      res.render("Admission/why")
    })
    // .......................  course routes...............................

router.get("/anm",(req,res)=>{
  res.render("course/ANM.ejs")
})
router.get("/B.Ed",(req,res)=>{
  res.render("course/B.Ed.ejs")
})
router.get("/B.El.Ed",(req,res)=>{
  res.render("course/B.El.Ed.ejs")
})
router.get("/bpharma",(req,res)=>{
  res.render("course/B.pharma.ejs")
})
router.get("/BA",(req,res)=>{
  res.render("course/BA.ejs")
})
router.get("/d.el.ed",(req,res)=>{
  res.render("course/D.El.Ed.ejs")
})
router.get("/d.pharma",(req,res)=>{
  res.render("course/D.pharma.ejs")
})
router.get("/jnam",(req,res)=>{
  res.render("course/JNAM.ejs")
})

export default router;