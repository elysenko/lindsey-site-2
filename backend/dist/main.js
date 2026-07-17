"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const sanitize_pipe_1 = require("./common/sanitize.pipe");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });
    app.setGlobalPrefix('api', {
        exclude: [
            { path: 'health', method: common_1.RequestMethod.ALL },
            { path: 'sitemap.xml', method: common_1.RequestMethod.GET },
            { path: 'robots.txt', method: common_1.RequestMethod.GET },
        ],
    });
    app.use((0, cookie_parser_1.default)());
    app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
    }), new sanitize_pipe_1.SanitizePipe());
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:4200';
    app.enableCors({
        origin: frontendUrl,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('LeBarre Group API')
        .setDescription('NestJS REST API for the LeBarre Group marketing site + CRM')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = parseInt(process.env.PORT ?? '3000', 10);
    await app.listen(port);
    logger.log(`Application running on http://localhost:${port}`);
    logger.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map