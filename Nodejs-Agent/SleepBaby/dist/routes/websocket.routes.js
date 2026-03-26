"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const websocket_controller_1 = require("../controllers/websocket.controller");
const router = (0, express_1.Router)();
router.post('/broadcast', (req, res) => {
    const { status } = req.body;
    websocket_controller_1.webSocketController.broadcastStatusUpdate(status);
    res.status(200).json({ status: 'success' });
});
exports.default = router;
//# sourceMappingURL=websocket.routes.js.map