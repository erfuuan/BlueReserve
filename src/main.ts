import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as morgan from 'morgan';
import * as compression from 'compression';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { CustomLoggerService } from './infrastructure/logging/logger.service';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: new CustomLoggerService(),
    });

    app.use(helmet());
    app.use(morgan('combined'));
    app.use(compression());
    app.use(
        rateLimit({
            windowMs: 60 * 1000,
            max: 10,
            standardHeaders: true,
            legacyHeaders: false,
            message: {
                statusCode: 429,
                message: 'Too many requests, please try again later.',
            },
        }),
    );
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );
    app.enableCors();
    const globalPrefix = 'api/v1';
    const swaggerPrefix = 'api-docs';
    app.setGlobalPrefix(globalPrefix);

    // ------------------ Swagger ------------------
    const config = new DocumentBuilder()
        .setTitle('BlueReserve API')
        .setDescription('A comprehensive NestJS BlueReserve System with CQRS and clean architecture')
        .setVersion('1.0')
        .addTag('reservations', 'Reservation management endpoints')
        .addTag('resources', 'Resource management endpoints')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);

    const logger = app.get(CustomLoggerService);
    const port = process.env.PORT || 3000;
    await app.listen(port);

    logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`, 'Bootstrap');
    logger.log(`📚 Swagger documentation: http://localhost:${port}/${swaggerPrefix}`, 'Bootstrap');
}

bootstrap();

