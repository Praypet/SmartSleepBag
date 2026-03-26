"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({ status: 'error', errors: error.issues });
            }
            else {
                res.status(500).json({ status: 'error', message: error.message });
            }
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=validation.middleware.js.map