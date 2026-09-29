import Notice from "../models/Notice.js";


// ======================================================
// ADMIN - NOTICE MANAGEMENT PAGE
// ======================================================

export const getNoticeManagement = async (req, res) => {
  try {
    const notices = await Notice.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.render("ERP/notice-management", {
      erpUser: req.session.erpUser,
      notices
    });

  } catch (error) {
    console.error("Notice Management Error:", error);

    return res.status(500).send(
      "Unable to load notice management."
    );
  }
};


// ======================================================
// ADMIN - CREATE NOTICE
// ======================================================

export const createNotice = async (req, res) => {
  try {
    const {
      title,
      description,
      noticeDate,
      category,
      important
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required."
      });
    }

    const notice = await Notice.create({
      title: title.trim(),

      description: description.trim(),

      noticeDate: noticeDate
        ? new Date(noticeDate)
        : new Date(),

      category: category || "General",

      important:
        important === true ||
        important === "true",

      published: true,

      createdBy: req.session.erpUser.id
    });

    return res.status(201).json({
      success: true,
      message: "Notice created successfully.",
      notice
    });

  } catch (error) {
    console.error("Create Notice Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create notice."
    });
  }
};


// ======================================================
// ADMIN - GET ALL NOTICES
// ======================================================

export const getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      notices
    });

  } catch (error) {
    console.error("Get Notices Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch notices."
    });
  }
};


// ======================================================
// ADMIN - TOGGLE NOTICE STATUS
// ======================================================

export const toggleNoticeStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findById(id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found."
      });
    }

    notice.published = !notice.published;

    await notice.save();

    return res.json({
      success: true,

      message: notice.published
        ? "Notice published successfully."
        : "Notice unpublished successfully.",

      published: notice.published
    });

  } catch (error) {
    console.error(
      "Toggle Notice Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to change notice status."
    });
  }
};


// ======================================================
// STUDENT - VIEW NOTICES
// ======================================================

export const getStudentNotices = async (req, res) => {
  try {
    const notices = await Notice.find({
      published: true
    })
      .sort({
        important: -1,
        noticeDate: -1,
        createdAt: -1
      })
      .lean();

    return res.render("ERP/student-notices", {
      erpUser: req.session.erpUser,
      notices
    });

  } catch (error) {
    console.error(
      "Student Notices Error:",
      error
    );

    return res.status(500).send(
      "Unable to load notices."
    );
  }
};