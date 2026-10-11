import Notice from "../models/Notice.js";
import User from "../models/User.js";

// ==========================================
// ADMIN - NOTICE MANAGEMENT
// ==========================================

export const getNoticeManagement = async (req, res) => {
  try {
    const notices = await Notice.find({
      active: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.render("ERP/notice-management", {
      erpUser: req.session.erpUser,
      notices,
    });
  } catch (error) {
    console.error("Notice Management Error:", error);

    return res.status(500).send(
      "Unable to load notice management."
    );
  }
};


// ==========================================
// ADMIN - CREATE NOTICE
// ==========================================

export const createNotice = async (req, res) => {
  try {
    if (!req.session?.erpUser) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const {
      title,
      message,
      noticeType,
      targetRole,
      session,
    } = req.body;

    if (
      !title ||
      !message ||
      !noticeType ||
      !targetRole ||
      !session
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const user = await User.findById(
      req.session.erpUser.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const notice = await Notice.create({
      title,
      message,
      noticeType,
      targetRole,
      session,
      createdBy: user._id,
      createdByName: user.name,
      active: true,
    });

    return res.status(201).json({
      success: true,
      message: "Notice created successfully.",
      notice,
    });
  } catch (error) {
    console.error("Create Notice Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create notice.",
    });
  }
};


// ==========================================
// ADMIN - DELETE NOTICE
// ==========================================

export const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findById(id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found.",
      });
    }

    notice.active = false;

    await notice.save();

    return res.json({
      success: true,
      message: "Notice deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Notice Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete notice.",
    });
  }
};


// ==========================================
// FACULTY - VIEW NOTICES
// ==========================================

export const getFacultyNotices = async (req, res) => {
  try {
    if (!req.session?.erpUser) {
      return res.redirect("/erp");
    }

    const enrollment =
      req.session.erpUser.enrollment;

    const user = await User.findOne({
      enrollment,
      role: "faculty",
      active: true,
    }).lean();

    if (!user) {
      return res.status(404).send(
        "Faculty account not found."
      );
    }

    const notices = await Notice.find({
      active: true,
      session: user.session,
      $or: [
        { targetRole: "All" },
        { targetRole: "Faculty" },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.render("ERP/faculty-notices", {
      erpUser: req.session.erpUser,
      user,
      notices,
    });
  } catch (error) {
    console.error("Faculty Notices Error:", error);

    return res.status(500).send(
      "Unable to load faculty notices."
    );
  }
};


// ==========================================
// STUDENT - VIEW NOTICES
// ==========================================

export const getStudentNotices = async (req, res) => {
  try {
    if (!req.session?.erpUser) {
      return res.redirect("/erp");
    }

    const enrollment =
      req.session.erpUser.enrollment;

    const user = await User.findOne({
      enrollment,
      role: "student",
      active: true,
    }).lean();

    if (!user) {
      return res.status(404).send(
        "Student account not found."
      );
    }

    const notices = await Notice.find({
      active: true,
      session: user.session,
      $or: [
        { targetRole: "All" },
        { targetRole: "Student" },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.render("ERP/student-notices", {
      erpUser: req.session.erpUser,
      user,
      notices,
    });
  } catch (error) {
    console.error("Student Notices Error:", error);

    return res.status(500).send(
      "Unable to load student notices."
    );
  }
};

export const toggleNoticeStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findById(id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found"
      });
    }

    notice.active = !notice.active;

    await notice.save();

    return res.json({
      success: true,
      message: notice.active
        ? "Notice published successfully"
        : "Notice unpublished successfully",
      active: notice.active
    });

  } catch (error) {
    console.error("Toggle Notice Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};