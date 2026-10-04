import mongoose from "mongoose";
import QuestionPaper from "../models/QuestionPaper.js";


// ==========================================
// UPLOAD QUESTION PAPER
// ==========================================

export const uploadQuestionPaper = async (req, res) => {
  try {
    if (!req.session?.erpUser) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    if (
      !["faculty", "admin", "principal"].includes(
        req.session.erpUser.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a PDF file.",
      });
    }

    const {
      title,
      subject,
      examType,
      session,
    } = req.body;

    if (!title || !subject || !examType || !session) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // MongoDB GridFS
    const bucket = new mongoose.mongo.GridFSBucket(
      mongoose.connection.db,
      {
        bucketName: "questionPapers",
      }
    );

    const uploadStream = bucket.openUploadStream(
      req.file.originalname,
      {
        contentType: req.file.mimetype,
      }
    );

    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", async () => {
      try {
        await QuestionPaper.create({
          title: title.trim(),
          subject: subject.trim(),
          examType,
          session: session.trim(),

          fileName: req.file.originalname,
          fileId: uploadStream.id,

          uploadedBy:
            req.session.erpUser.id,

          uploadedByName:
            req.session.erpUser.name,
        });

        return res.json({
          success: true,
          message:
            "Question paper uploaded successfully.",
        });
      } catch (error) {
        console.error(
          "Question Paper Save Error:",
          error
        );

        return res.status(500).json({
          success: false,
          message:
            "Question paper information could not be saved.",
        });
      }
    });

    uploadStream.on("error", (error) => {
      console.error(
        "GridFS Upload Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Question paper upload failed.",
      });
    });

  } catch (error) {
    console.error(
      "Upload Question Paper Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to upload question paper.",
    });
  }
};


// ==========================================
// STUDENT QUESTION PAPERS
// ==========================================

export const getStudentQuestionPapers = async (
  req,
  res
) => {
  try {
    if (!req.session?.erpUser) {
      return res.redirect("/erp");
    }

    const session =
      req.session.erpUser.session;

    const papers =
      await QuestionPaper.find({
        session,
      })
        .sort({ createdAt: -1 })
        .lean();

    return res.render(
      "ERP/student-question-papers",
      {
        erpUser: req.session.erpUser,
        papers,
      }
    );

  } catch (error) {
    console.error(
      "Student Question Paper Error:",
      error
    );

    return res.status(500).send(
      "Unable to load question papers."
    );
  }
};


// ==========================================
// DOWNLOAD / VIEW QUESTION PAPER
// ==========================================

export const viewQuestionPaper = async (
  req,
  res
) => {
  try {
    if (!req.session?.erpUser) {
      return res.status(401).send(
        "Please login first."
      );
    }

    const paper =
      await QuestionPaper.findById(
        req.params.id
      );

    if (!paper) {
      return res.status(404).send(
        "Question paper not found."
      );
    }

    const bucket =
      new mongoose.mongo.GridFSBucket(
        mongoose.connection.db,
        {
          bucketName: "questionPapers",
        }
      );

    res.set(
      "Content-Type",
      "application/pdf"
    );

    res.set(
      "Content-Disposition",
      `inline; filename="${paper.fileName}"`
    );

    const downloadStream =
      bucket.openDownloadStream(
        paper.fileId
      );

    downloadStream.on(
      "error",
      () => {
        res.status(404).send(
          "Question paper file not found."
        );
      }
    );

    downloadStream.pipe(res);

  } catch (error) {
    console.error(
      "View Question Paper Error:",
      error
    );

    return res.status(500).send(
      "Unable to open question paper."
    );
  }
};