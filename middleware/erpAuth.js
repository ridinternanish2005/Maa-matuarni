export function requireERPAuth(req, res, next) {
  if (!req.session?.erpUser?.id) {
    return res.redirect("/erp");
  }
  next();
}

export function requireERPRole(...allowedRoles) {
  return (req, res, next) => {
    const user = req.session?.erpUser;

    if (!user?.id) {
      return res.redirect("/erp");
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).render("ERP/access-denied", { user });
    }

    next();
  };
}
