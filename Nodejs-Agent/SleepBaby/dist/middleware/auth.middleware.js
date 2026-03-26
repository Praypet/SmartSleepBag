"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    // Token verification logic here
    next();
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map