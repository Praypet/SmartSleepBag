"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agent_controller_1 = require("../controllers/agent.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/process', auth_middleware_1.authMiddleware, agent_controller_1.agentController.processRequest);
exports.default = router;
//# sourceMappingURL=agent.routes.js.map