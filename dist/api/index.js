"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const express_1 = __importDefault(require("express"));
const app_module_1 = require("../src/app.module");
const cors_1 = require("../src/common/utils/cors");
const expressServer = (0, express_1.default)();
let app;
let isReady = false;
async function bootstrap() {
    if (isReady)
        return;
    app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressServer), { logger: ['error', 'warn'] });
    app.useBodyParser('json', { limit: '10mb' });
    app.useBodyParser('urlencoded', { limit: '10mb', extended: true });
    app.enableCors({
        origin: (0, cors_1.getAllowedOrigins)(),
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.setGlobalPrefix('api');
    await app.init();
    isReady = true;
}
async function handler(req, res) {
    await bootstrap();
    expressServer(req, res);
}
//# sourceMappingURL=index.js.map