"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTempPassword = generateTempPassword;
const crypto_1 = require("crypto");
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
function generateTempPassword(length = 10) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += CHARSET[(0, crypto_1.randomInt)(CHARSET.length)];
    }
    return result;
}
//# sourceMappingURL=temp-password.js.map