
export default function principalOnly(req, res, next) {
  if (!req.session?.erpUser) {
    return res.status(401).json({
      success: false,
      message: "Please login first."
    });
  }

  if (
    String(req.session.erpUser.role || "").toLowerCase() !== "principal"
  ) {
    return res.status(403).json({
      success: false,
      message: "Principal access only."
    });
  }

  next();
}
