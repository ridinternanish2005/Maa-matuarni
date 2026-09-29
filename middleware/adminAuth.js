import User from "../models/User.js";

export const requireAdmin = async (req, res, next) => {
  try {

    // ==========================================
    // LOGIN CHECK
    // ==========================================

    if (!req.session?.erpUser) {
      return res.redirect("/erp");
    }


    // ==========================================
    // GET LOGGED-IN USER FROM SESSION
    // ==========================================

    const sessionUser = req.session.erpUser;


    if (!sessionUser.enrollment) {
      return res.status(403).send(
        "Invalid ERP session."
      );
    }


    // ==========================================
    // FIND USER FROM DATABASE
    // ==========================================

    const user = await User.findOne({
      enrollment: sessionUser.enrollment
    }).select(
      "name enrollment role session active mustChangePassword"
    );


    // ==========================================
    // USER NOT FOUND
    // ==========================================

    if (!user) {

      req.session.destroy(() => {});

      return res.redirect("/erp");
    }


    // ==========================================
    // ACCOUNT ACTIVE CHECK
    // ==========================================

    if (user.active === false) {

      req.session.destroy(() => {});

      return res.status(403).send(
        "Your account has been deactivated."
      );
    }


    // ==========================================
    // ROLE CHECK
    // ==========================================

    if (user.role !== "admin") {

      return res.status(403).send(
        "Access Denied: Admin access required."
      );
    }


    // ==========================================
    // UPDATE SESSION FROM DATABASE
    // ==========================================

    req.session.erpUser = {
      id: user._id.toString(),
      name: user.name,
      enrollment: user.enrollment,
      role: user.role,
      session: user.session
    };


    // ==========================================
    // ALLOW REQUEST
    // ==========================================

    next();

  } catch (error) {

    console.error(
      "Admin Authorization Error:",
      error
    );

    return res.status(500).send(
      "Authorization error."
    );
  }
};