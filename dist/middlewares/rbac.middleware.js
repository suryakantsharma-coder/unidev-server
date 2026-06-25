"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAgent = exports.requireAdmin = exports.requireSuperAdmin = void 0;
exports.requireRoles = requireRoles;
/**
 * Returns middleware that allows only the specified roles.
 * Must be used after authMiddleware.
 *
 * Usage: router.get('/admin-only', authMiddleware, requireRoles('super_admin', 'admin'), handler)
 */
function requireRoles(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthenticated' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`,
            });
            return;
        }
        next();
    };
}
// Convenience shorthands
exports.requireSuperAdmin = requireRoles('super_admin');
exports.requireAdmin = requireRoles('super_admin', 'admin');
exports.requireAgent = requireRoles('super_admin', 'admin', 'agent');
//# sourceMappingURL=rbac.middleware.js.map