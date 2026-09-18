"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const cors_1 = require("./common/utils/cors");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
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
    if (!process.env.VERCEL) {
        app.useStaticAssets((0, path_1.join)(process.cwd(), process.env.UPLOADS_DIR ?? 'uploads'), {
            prefix: '/uploads/',
        });
    }
    app.setGlobalPrefix('api');
    await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
//# sourceMappingURL=main.js.map