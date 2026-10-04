import dotenv from "dotenv";
dotenv.config();

import dns from "node:dns";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import path from "path";

import connectDB from "./config/db.js";

import mainRoutes from "./routes/mainRoutes.js";
import schoolWebRoutes from "./school/server.js";
import svicRoutes from "./svic_college/server.js";
import erpRoutes from "./routes/erpRoutes.js";
import admissionRoutes from "./routes/admissionRoutes.js";
import webRoutes from "./routes/webRoutes.js";
import admissionEnquiryRoutes from "./routes/admissionEnquiryRoutes.js";
import studentRoutes1 from "./routes/studentRoutes1.js";      ///all role ka database me data add karne ke leye use keya gaya hai
import adminRoutes from "./routes/adminRoutes.js";   ///admin pnal
import adminUserRoutes from "./routes/adminUserRoutes.js";

import erpStudentRoutes from "./routes/erpStudentRoutes.js";
import erpStudentAttendanceRoutes from "./routes/erpStudentAttendanceRoutes.js";
import erpAttendanceAdminRoutes
  from "./routes/erpAttendanceAdminRoutes.js";
  import erpFeeRoutes from "./routes/erpFeeRoutes.js";
  import erpStudentFeeRoutes from "./routes/erpStudentFeeRoutes.js";

import erpResultAdminRoutes
  from "./routes/erpResultAdminRoutes.js";

import erpStudentResultRoutes
  from "./routes/erpStudentResultRoutes.js";
  import erpDocumentAdminRoutes from "./routes/erpDocumentAdminRoutes.js";
import erpStudentDocumentRoutes from "./routes/erpStudentDocumentRoutes.js";



import erpNoticeAdminRoutes from "./routes/erpNoticeAdminRoutes.js";
import erpStudentNoticeRoutes from "./routes/erpStudentNoticeRoutes.js";

import erpTimetableAdminRoutes from "./routes/erpTimetableAdminRoutes.js";
import erpStudentTimetableRoutes from "./routes/erpStudentTimetableRoutes.js";

import erpAssignmentAdminRoutes from "./routes/erpAssignmentAdminRoutes.js";
import erpStudentAssignmentRoutes from "./routes/erpStudentAssignmentRoutes.js";



import erpFacultyAttendanceRoutes
  from "./routes/erpFacultyAttendanceRoutes.js";
import erpFacultyAdminRoutes
  from "./routes/erpFacultyAdminRoutes.js";

import erpFacultyRoutes
  from "./routes/erpFacultyRoutes.js";

import erpFacultyMarksRoutes
  from "./routes/erpFacultyMarksRoutes.js";

import questionPaperRoutes
  from "./routes/questionPaperRoutes.js";

  import libraryRoutes
  from "./routes/libraryRoutes.js";
  ///////////////////////////////////////////////////////////
// DNS
dns.setServers([
  "8.8.8.8",
  "1.1.1.1"
]);


// App
const app = express();

const PORT = process.env.PORT || 5000;


// Settings
app.set("trust proxy", 1);


// Body Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// View Engine
app.set("view engine", "ejs");

app.set("views", [
  path.join(process.cwd(), "views"),
  path.join(process.cwd(), "school/views"),
  path.join(process.cwd(), "svic_college/views")
]);


// Static Files
app.use(
  express.static(
    path.join(process.cwd(), "public")
  )
);

app.use(
  "/school",
  express.static(
    path.join(process.cwd(), "school/public")
  )
);

app.use(
  "/svic_college",
  express.static(
    path.join(process.cwd(), "svic_college/public")
  )
);


// Session Store
// Session Store
if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is missing");
}

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is missing");
}

const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  collectionName: "erp_sessions",
  ttl: 60 * 60 * 8,
  autoRemove: "native"
});

// Session
app.use(
  session({
    name: "erp.sid",

    secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    store: sessionStore,

    cookie: {
      httpOnly: true,
      sameSite: "lax",

      secure:
        process.env.NODE_ENV === "production",

      maxAge: 1000 * 60 * 60 * 8
    }
  })
);


// Routes

app.use("/", mainRoutes);

app.use("/admission", admissionRoutes);



app.use("/school", schoolWebRoutes);

app.use("/svic_college", svicRoutes);

app.use("/msd-school", webRoutes);


app.use("/api/admission-enquiry", admissionEnquiryRoutes);
app.use("/api/students", studentRoutes1);

app.use("/api/admissions", admissionRoutes);

app.use("/admin", adminRoutes);  //admin routes
app.use("/admin/users", adminUserRoutes);
app.use("/erp", erpRoutes);


app.use("/erp/students", erpStudentRoutes);
app.use("/erp/students", erpStudentAttendanceRoutes);
app.use("/erp", erpAttendanceAdminRoutes);
app.use("/erp", erpFeeRoutes);
app.use("/erp/students", erpStudentFeeRoutes);
app.use("/erp", erpDocumentAdminRoutes);
app.use("/erp/students", erpStudentDocumentRoutes);


app.use("/erp", erpNoticeAdminRoutes);
app.use("/erp/students", erpStudentNoticeRoutes);

app.use("/erp", erpTimetableAdminRoutes);
app.use("/erp/students", erpStudentTimetableRoutes);

app.use("/erp", erpAssignmentAdminRoutes);

app.use("/erp/students", erpStudentAssignmentRoutes);

app.use(
  "/erp",
  erpResultAdminRoutes
);

app.use(
  "/erp/students",
  erpStudentResultRoutes
);



app.use(
  "/erp",
  erpFacultyAdminRoutes
);

app.use(
  "/erp/faculty",
  erpFacultyRoutes
);


app.use(
  "/erp/faculty",
  erpFacultyAttendanceRoutes
);


app.use(
  "/erp/faculty",
  erpFacultyMarksRoutes
);

app.use(
  "/erp",
  questionPaperRoutes
);


app.use(
  "/erp",
  questionPaperRoutes
);

app.use(
  "/erp",
  libraryRoutes
);
///////////////////////////////////////////////////////////////////
// Health Check
app.get("/health", (req, res) => {
  res.json({
    server: "running",
    mongodb:
      mongoose.connection.readyState === 1
        ? "connected"
        : "not connected",
    database:
      mongoose.connection.name || null
  });
});


// 404
app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});


// Error Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});


// Start Server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    process.exit(1);
  }
};

startServer();