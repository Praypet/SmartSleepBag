"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const babyData_controller_1 = require("../controllers/babyData.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/:babyId', auth_middleware_1.authMiddleware, babyData_controller_1.babyDataController.getBabyData);
router.post('/:babyId', auth_middleware_1.authMiddleware, babyData_controller_1.babyDataController.updateBabyData);
exports.default = router;
//# sourceMappingURL=babyData.routes.js.map