import User from "../models/User.js";
import StudentDocument from "../models/StudentDocument.js";


// ======================================================
// ADMIN DOCUMENT MANAGEMENT PAGE
// ======================================================
export const getDocumentManagement = async (req, res) => {
  try {
    return res.render("ERP/document-management", {
      erpUser: req.session.erpUser
    });
  } catch (error) {
    console.error("Document Management Error:", error);

    return res.status(500).send(
      "Unable to load document management page."
    );
  }
};


// ======================================================
// CREATE DOCUMENT
// ======================================================
export const createStudentDocument = async (req, res) => {
  try {
    const {
      enrollment,
      documentType,
      documentNumber,
      issueDate,
      status,
      remarks
    } = req.body;


    // ---------------------------------------------
    // VALIDATION
    // ---------------------------------------------
    if (!enrollment || !documentType) {
      return res.status(400).json({
        success: false,
        message: "Enrollment and document type are required."
      });
    }


    // ---------------------------------------------
    // FIND STUDENT
    // ---------------------------------------------
    const student = await User.findOne({
      enrollment: enrollment.trim().toUpperCase(),
      role: "student",
      active: true
    });


    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found."
      });
    }


    // ---------------------------------------------
    // CREATE DOCUMENT
    // ---------------------------------------------
    const document = await StudentDocument.create({
      studentId: student._id,
      enrollment: student.enrollment,
      studentName: student.name,
      course: "D.Pharm",
      session: student.session,

      documentType: documentType.trim(),

      documentNumber:
        documentNumber?.trim() || "",

      issueDate:
        issueDate ? new Date(issueDate) : null,

      status:
        status || "Available",

      remarks:
        remarks?.trim() || "",

      active: true
    });


    return res.status(201).json({
      success: true,
      message: "Document created successfully.",
      document: document
    });


  } catch (error) {

    console.error(
      "Create Student Document Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create document."
    });
  }
};


// ======================================================
// GET ALL DOCUMENTS
// ======================================================
export const getAllStudentDocuments = async (req, res) => {
  try {

    const documents =
      await StudentDocument.find({
        active: true
      })
        .sort({
          createdAt: -1
        })
        .lean();


    return res.json({
      success: true,
      documents: documents
    });


  } catch (error) {

    console.error(
      "Get Documents Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch documents."
    });
  }
};


// ======================================================
// STUDENT DOCUMENT PAGE
// ======================================================
export const getStudentDocuments = async (req, res) => {
  try {

    if (!req.session?.erpUser) {
      return res.redirect("/erp");
    }


    const enrollment =
      req.session.erpUser.enrollment;


    const user =
      await User.findOne({
        enrollment: enrollment,
        role: "student"
      }).lean();


    if (!user) {
      return res.status(404).send(
        "Student account not found."
      );
    }


    if (user.active === false) {

      req.session.destroy(() => {});

      return res.status(403).send(
        "Your account has been deactivated."
      );
    }


    const documents =
      await StudentDocument.find({
        enrollment: user.enrollment,
        session: user.session,
        active: true
      })
        .sort({
          createdAt: -1
        })
        .lean();


    return res.render(
      "ERP/student-documents",
      {
        erpUser: req.session.erpUser,
        user: user,
        documents: documents
      }
    );


  } catch (error) {

    console.error(
      "Student Documents Error:",
      error
    );

    return res.status(500).send(
      "Unable to load student documents."
    );
  }
};


// ======================================================
// DELETE / DEACTIVATE DOCUMENT
// ======================================================
export const deactivateStudentDocument = async (
  req,
  res
) => {
  try {

    const { id } = req.params;


    const document =
      await StudentDocument.findById(id);


    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found."
      });
    }


    document.active = false;

    await document.save();


    return res.json({
      success: true,
      message: "Document removed successfully."
    });


  } catch (error) {

    console.error(
      "Deactivate Document Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to remove document."
    });
  }
};