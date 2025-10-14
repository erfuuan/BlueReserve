import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('health')
@Controller('health')
export class HealthController {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Health check endpoint' })
    @ApiResponse({
        status: 200,
        description: 'Service is healthy',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'ok' },
                timestamp: { type: 'string', example: '2024-01-15T10:00:00.000Z' },
                uptime: { type: 'number', example: 3600 },
                database: { type: 'string', example: 'connected' },
                version: { type: 'string', example: '1.0.0' }
            }
        }
    })
    @ApiResponse({
        status: 503,
        description: 'Service is unhealthy',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'error' },
                timestamp: { type: 'string', example: '2024-01-15T10:00:00.000Z' },
                error: { type: 'string', example: 'Database connection failed' }
            }
        }
    })
    async check() {
        try {
            // Check database connection
            await this.dataSource.query('SELECT 1');

            return {
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                database: 'connected',
                version: '1.0.0'
            };
        } catch (error) {
            throw new Error(`Health check failed: ${error.message}`);
        }
    }
}