import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { DataSource } from 'typeorm';

describe('HealthController', () => {
    let controller: HealthController;
    let dataSource: jest.Mocked<DataSource>;

    beforeEach(async () => {
        const mockDataSource = {
            query: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [HealthController],
            providers: [
                {
                    provide: DataSource,
                    useValue: mockDataSource,
                },
            ],
        }).compile();

        controller = module.get<HealthController>(HealthController);
        dataSource = module.get(DataSource);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('check', () => {
        it('should return healthy status when database is connected', async () => {
            dataSource.query.mockResolvedValue([{ '?column?': 1 }]);

            const result = await controller.check();

            expect(result).toEqual({
                status: 'ok',
                timestamp: expect.any(String),
                uptime: expect.any(Number),
                database: 'connected',
                version: '1.0.0'
            });
            expect(dataSource.query).toHaveBeenCalledWith('SELECT 1');
        });

        it('should throw error when database connection fails', async () => {
            const dbError = new Error('Connection failed');
            dataSource.query.mockRejectedValue(dbError);

            await expect(controller.check()).rejects.toThrow('Health check failed: Connection failed');
            expect(dataSource.query).toHaveBeenCalledWith('SELECT 1');
        });

        it('should return valid timestamp format', async () => {
            dataSource.query.mockResolvedValue([{ '?column?': 1 }]);

            const result = await controller.check();

            expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        });

        it('should return positive uptime', async () => {
            dataSource.query.mockResolvedValue([{ '?column?': 1 }]);

            const result = await controller.check();

            expect(result.uptime).toBeGreaterThanOrEqual(0);
        });
    });
});
