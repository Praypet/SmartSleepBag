"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.babyDataController = exports.BabyDataController = void 0;
const dataSync_service_1 = require("../services/dataSync.service");
class BabyDataController {
    async getBabyData(req, res) {
        try {
            const { babyId } = req.params;
            const data = await dataSync_service_1.dataSyncService.getBabyInfo();
            res.status(200).json({ status: 'success', data });
        }
        catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
}
exports.BabyDataController = BabyDataController;
exports.babyDataController = new BabyDataController();
//# sourceMappingURL=babyData.controller.js.map