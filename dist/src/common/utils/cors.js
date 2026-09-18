"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllowedOrigins = getAllowedOrigins;
function getAllowedOrigins() {
    return [
        ...new Set([
            process.env.WEB_APP_URL,
            'https://iit.belayetsust.com',
            'http://localhost:3000',
            'http://192.168.0.150:3000',
        ].filter((origin) => Boolean(origin))),
    ];
}
//# sourceMappingURL=cors.js.map