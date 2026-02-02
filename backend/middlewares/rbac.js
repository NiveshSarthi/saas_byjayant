// RBAC middleware - structure only, full implementation later
const authorize = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // For now, check if user's role name is in requiredRoles
    if (!requiredRoles.includes(req.user.role.name)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = { authorize };