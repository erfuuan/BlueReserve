import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as path from 'path';

@Injectable()
export class CustomLoggerService implements LoggerService {
    private readonly logger: winston.Logger;

    constructor() {
        const logsDir = path.join(process.cwd(), 'logs');
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            defaultMeta: { service: 'blu-reserve' },
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple(),
                        winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
                            const contextStr = context ? `[${context}]` : '';
                            const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
                            return `${timestamp} ${level} ${contextStr} ${message}${metaStr}`;
                        })
                    )
                }),

                new winston.transports.File({
                    filename: path.join(logsDir, 'application.log'),
                    maxsize: 5242880,
                    maxFiles: 5,
                }),

                new winston.transports.File({
                    filename: path.join(logsDir, 'errors.log'),
                    level: 'warn',
                    maxsize: 5242880,
                    maxFiles: 5,
                }),

                new winston.transports.File({
                    filename: path.join(logsDir, 'error.log'),
                    level: 'error',
                    maxsize: 5242880,
                    maxFiles: 5,
                })
            ],
        });
    }

    log(message: any, context?: string) {
        this.logger.info(message, { context });
    }

    error(message: any, trace?: string, context?: string) {
        this.logger.error(message, { trace, context });
    }

    warn(message: any, context?: string) {
        this.logger.warn(message, { context });
    }

    debug(message: any, context?: string) {
        this.logger.debug(message, { context });
    }

    verbose(message: any, context?: string) {
        this.logger.verbose(message, { context });
    }
}
