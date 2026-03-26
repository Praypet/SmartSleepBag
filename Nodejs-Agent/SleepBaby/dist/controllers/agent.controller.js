"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentController = exports.AgentController = void 0;
const agentExecutor_1 = require("../agents/agentExecutor");
class AgentController {
    async processRequest(req, res) {
        try {
            const { input, babyId, userId } = req.body;
            const response = await (0, agentExecutor_1.runAgent)(input, babyId, userId);
            res.status(200).json({ status: 'success', data: response });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
}
exports.AgentController = AgentController;
exports.agentController = new AgentController();
//# sourceMappingURL=agent.controller.js.map