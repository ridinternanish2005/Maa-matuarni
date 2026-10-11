import mongoose from "mongoose";
import FacultyLeave from "../models/FacultyLeave.js";
import User from "../models/User.js";


// ==========================================
// FACULTY - LEAVE PAGE
// ==========================================

export const getFacultyLeave = async (req, res) => {
  try {
    if (!req.session?.erpUser) {
      return res.redirect("/erp");
    }

    const enrollment = req.session.erpUser.enrollment;

    const user = await User.findOne({
      enrollment,
      role: "faculty",
      active: true,
    }).lean();

    if (!user) {
      return res.status(404).send("Faculty account not found.");
    }

    const leaves = await FacultyLeave.find({
      facultyId: user._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.render("ERP/faculty-leave", {
      erpUser: req.session.erpUser,
      user,
      leaves,
    });
  } catch (error) {
    console.error("Faculty Leave Page Error:", error);

    return res
      .status(500)
      .send("Unable to load faculty leave page.");
  }
};


// ==========================================
// FACULTY - APPLY LEAVE
// ==========================================

export const applyFacultyLeave = async (req, res) => {
  try {
    if (!req.session?.erpUser) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const {
      leaveType,
      fromDate,
      toDate,
      reason,
    } = req.body;

    if (!leaveType || !fromDate || !toDate || !reason) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date.",
      });
    }

    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "From Date cannot be greater than To Date.",
      });
    }

    const enrollment = req.session.erpUser.enrollment;

    const user = await User.findOne({
      enrollment,
      role: "faculty",
      active: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Faculty account not found.",
      });
    }

    const leave = await FacultyLeave.create({
      facultyId: user._id,
      facultyEnrollment: user.enrollment,
      facultyName: user.name,
      session: user.session,

      leaveType,
      fromDate: startDate,
      toDate: endDate,
      reason,

      status: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Leave application submitted successfully.",
      leave,
    });
  } catch (error) {
    console.error("Apply Faculty Leave Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit leave application.",
    });
  }
};


// ==========================================
// ADMIN / PRINCIPAL - ALL LEAVES
// ==========================================

export const getAllFacultyLeaves = async (req, res) => {
  try {
    const leaves = await FacultyLeave.find()
      .sort({ createdAt: -1 })
      .lean();

    res.render("ERP/faculty-leave-management", {
      erpUser: req.session.erpUser,
      leaves,
    });
  } catch (error) {
    console.error("All Faculty Leaves Error:", error);

    return res
      .status(500)
      .send("Unable to load leave management.");
  }
};


// ==========================================
// ADMIN / PRINCIPAL - APPROVE / REJECT
// ==========================================

export const updateFacultyLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      status,
      adminRemark = "",
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave ID.",
      });
    }

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave status.",
      });
    }

    const leave = await FacultyLeave.findById(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave application not found.",
      });
    }

    leave.status = status;
    leave.adminRemark = adminRemark;

    await leave.save();

    return res.json({
      success: true,
      message: `Leave ${status.toLowerCase()} successfully.`,
      leave,
    });
  } catch (error) {
    console.error("Update Faculty Leave Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update leave status.",
    });
  }
};