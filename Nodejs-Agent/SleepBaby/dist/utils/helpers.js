"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSleepDuration = exports.formatDate = void 0;
const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};
exports.formatDate = formatDate;
const calculateSleepDuration = (start, end) => {
    return (end.getTime() - start.getTime()) / (1000 * 60); // in minutes
};
exports.calculateSleepDuration = calculateSleepDuration;
//# sourceMappingURL=helpers.js.map