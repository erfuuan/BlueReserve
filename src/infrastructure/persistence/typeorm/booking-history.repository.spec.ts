import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingHistoryRepository } from './booking-history.repository';
import { BookingHistory } from '@/domain/entities/booking-history.entity';
import { BookingStatus } from '@/domain/enums/booking-status.enum';

describe('BookingHistoryRepository', () => {
    let repository: BookingHistoryRepository;
    let mockRepository: jest.Mocked<Repository<BookingHistory>>;

    const mockBookingHistory = {
        id: 'history-123',
        bookingId: 'booking-456',
        userId: 'user-789',
        resourceId: 'resource-101',
        previousStatus: BookingStatus.PENDING,
        newStatus: BookingStatus.CONFIRMED,
        reason: 'Booking confirmed',
        metadata: { confirmedAt: new Date() },
        createdAt: new Date(),
    } as BookingHistory;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BookingHistoryRepository,
                {
                    provide: getRepositoryToken(BookingHistory),
                    useValue: {
                        save: jest.fn(),
                        find: jest.fn(),
                    },
                },
            ],
        }).compile();

        repository = module.get<BookingHistoryRepository>(BookingHistoryRepository);
        mockRepository = module.get(getRepositoryToken(BookingHistory));
    });

    describe('save', () => {
        it('should save booking history successfully', async () => {
            mockRepository.save.mockResolvedValue(mockBookingHistory);

            const result = await repository.save(mockBookingHistory);

            expect(mockRepository.save).toHaveBeenCalledWith(mockBookingHistory);
            expect(result).toBe(mockBookingHistory);
        });

        it('should handle save errors', async () => {
            mockRepository.save.mockRejectedValue(new Error('Database error'));

            await expect(repository.save(mockBookingHistory)).rejects.toThrow('Database error');
        });

        it('should save different types of history records', async () => {
            // Test different status transitions
            const statusTransitions = [
                { previous: null, new: BookingStatus.PENDING, reason: 'Booking created' },
                { previous: BookingStatus.PENDING, new: BookingStatus.CONFIRMED, reason: 'Booking confirmed' },
                { previous: BookingStatus.PENDING, new: BookingStatus.CANCELLED, reason: 'Booking cancelled' },
                { previous: BookingStatus.CONFIRMED, new: BookingStatus.CANCELLED, reason: 'Booking cancelled' },
            ];

            for (const transition of statusTransitions) {
                const historyRecord = {
                    ...mockBookingHistory,
                    previousStatus: transition.previous as any,
                    newStatus: transition.new,
                    reason: transition.reason,
                };
                mockRepository.save.mockResolvedValue(historyRecord);

                const result = await repository.save(historyRecord);

                expect(result.previousStatus).toBe(transition.previous);
                expect(result.newStatus).toBe(transition.new);
                expect(result.reason).toBe(transition.reason);
            }
        });

        it('should save history with complex metadata', async () => {
            const complexMetadata = {
                source: 'mobile-app',
                version: '1.2.3',
                userAgent: 'Mozilla/5.0...',
                location: { latitude: 40.7128, longitude: -74.0060 },
                tags: ['urgent', 'vip'],
                timestamp: new Date().toISOString(),
            };
            const historyWithComplexMetadata = {
                ...mockBookingHistory,
                metadata: complexMetadata,
            };
            mockRepository.save.mockResolvedValue(historyWithComplexMetadata);

            const result = await repository.save(historyWithComplexMetadata);

            expect(result.metadata).toEqual(complexMetadata);
        });

        it('should save history without metadata', async () => {
            const historyWithoutMetadata = { ...mockBookingHistory, metadata: undefined };
            mockRepository.save.mockResolvedValue(historyWithoutMetadata);

            const result = await repository.save(historyWithoutMetadata);

            expect(result.metadata).toBeUndefined();
        });

        it('should save history with empty reason', async () => {
            const historyWithEmptyReason = { ...mockBookingHistory, reason: '' };
            mockRepository.save.mockResolvedValue(historyWithEmptyReason);

            const result = await repository.save(historyWithEmptyReason);

            expect(result.reason).toBe('');
        });

        it('should save history with long reason', async () => {
            const longReason = 'A'.repeat(1000);
            const historyWithLongReason = { ...mockBookingHistory, reason: longReason };
            mockRepository.save.mockResolvedValue(historyWithLongReason);

            const result = await repository.save(historyWithLongReason);

            expect(result.reason).toBe(longReason);
        });
    });

    describe('findByBookingId', () => {
        it('should find booking history by booking ID successfully', async () => {
            const bookingHistory = [mockBookingHistory];
            mockRepository.find.mockResolvedValue(bookingHistory);

            const result = await repository.findByBookingId('booking-456');

            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { bookingId: 'booking-456' },
                order: { createdAt: 'DESC' },
            });
            expect(result).toBe(bookingHistory);
        });

        it('should return empty array when no history found for booking', async () => {
            mockRepository.find.mockResolvedValue([]);

            const result = await repository.findByBookingId('non-existent-booking');

            expect(result).toEqual([]);
        });

        it('should handle findByBookingId errors', async () => {
            mockRepository.find.mockRejectedValue(new Error('Database error'));

            await expect(repository.findByBookingId('booking-456')).rejects.toThrow('Database error');
        });

        it('should return history ordered by creation date descending', async () => {
            const olderHistory = { ...mockBookingHistory, createdAt: new Date('2024-01-01') };
            const newerHistory = { ...mockBookingHistory, createdAt: new Date('2024-01-02') };
            const historyRecords = [newerHistory, olderHistory];
            mockRepository.find.mockResolvedValue(historyRecords);

            const result = await repository.findByBookingId('booking-456');

            expect(result[0].createdAt).toEqual(new Date('2024-01-02'));
            expect(result[1].createdAt).toEqual(new Date('2024-01-01'));
        });

        it('should handle empty booking ID', async () => {
            mockRepository.find.mockResolvedValue([]);

            const result = await repository.findByBookingId('');

            expect(result).toEqual([]);
        });

        it('should find multiple history records for same booking', async () => {
            const multipleHistory = [
                { ...mockBookingHistory, id: 'history-1', newStatus: BookingStatus.CONFIRMED },
                { ...mockBookingHistory, id: 'history-2', newStatus: BookingStatus.CANCELLED },
            ];
            mockRepository.find.mockResolvedValue(multipleHistory);

            const result = await repository.findByBookingId('booking-456');

            expect(result).toHaveLength(2);
            expect(result[0].newStatus).toBe(BookingStatus.CONFIRMED);
            expect(result[1].newStatus).toBe(BookingStatus.CANCELLED);
        });
    });

    describe('findByUserId', () => {
        it('should find booking history by user ID successfully', async () => {
            const userHistory = [mockBookingHistory];
            mockRepository.find.mockResolvedValue(userHistory);

            const result = await repository.findByUserId('user-789');

            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { userId: 'user-789' },
                order: { createdAt: 'DESC' },
            });
            expect(result).toBe(userHistory);
        });

        it('should return empty array when no history found for user', async () => {
            mockRepository.find.mockResolvedValue([]);

            const result = await repository.findByUserId('non-existent-user');

            expect(result).toEqual([]);
        });

        it('should handle findByUserId errors', async () => {
            mockRepository.find.mockRejectedValue(new Error('Database error'));

            await expect(repository.findByUserId('user-789')).rejects.toThrow('Database error');
        });

        it('should return user history ordered by creation date descending', async () => {
            const olderHistory = { ...mockBookingHistory, createdAt: new Date('2024-01-01') };
            const newerHistory = { ...mockBookingHistory, createdAt: new Date('2024-01-02') };
            const historyRecords = [newerHistory, olderHistory];
            mockRepository.find.mockResolvedValue(historyRecords);

            const result = await repository.findByUserId('user-789');

            expect(result[0].createdAt).toEqual(new Date('2024-01-02'));
            expect(result[1].createdAt).toEqual(new Date('2024-01-01'));
        });

        it('should handle empty user ID', async () => {
            mockRepository.find.mockResolvedValue([]);

            const result = await repository.findByUserId('');

            expect(result).toEqual([]);
        });

        it('should find history for user with multiple bookings', async () => {
            const multipleUserHistory = [
                { ...mockBookingHistory, bookingId: 'booking-1' },
                { ...mockBookingHistory, bookingId: 'booking-2' },
                { ...mockBookingHistory, bookingId: 'booking-3' },
            ];
            mockRepository.find.mockResolvedValue(multipleUserHistory);

            const result = await repository.findByUserId('user-789');

            expect(result).toHaveLength(3);
            expect(result[0].bookingId).toBe('booking-1');
            expect(result[1].bookingId).toBe('booking-2');
            expect(result[2].bookingId).toBe('booking-3');
        });
    });

    describe('findByResourceId', () => {
        it('should find booking history by resource ID successfully', async () => {
            const resourceHistory = [mockBookingHistory];
            mockRepository.find.mockResolvedValue(resourceHistory);

            const result = await repository.findByResourceId('resource-101');

            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { resourceId: 'resource-101' },
                order: { createdAt: 'DESC' },
            });
            expect(result).toBe(resourceHistory);
        });

        it('should return empty array when no history found for resource', async () => {
            mockRepository.find.mockResolvedValue([]);

            const result = await repository.findByResourceId('non-existent-resource');

            expect(result).toEqual([]);
        });

        it('should handle findByResourceId errors', async () => {
            mockRepository.find.mockRejectedValue(new Error('Database error'));

            await expect(repository.findByResourceId('resource-101')).rejects.toThrow('Database error');
        });

        it('should return resource history ordered by creation date descending', async () => {
            const olderHistory = { ...mockBookingHistory, createdAt: new Date('2024-01-01') };
            const newerHistory = { ...mockBookingHistory, createdAt: new Date('2024-01-02') };
            const historyRecords = [newerHistory, olderHistory];
            mockRepository.find.mockResolvedValue(historyRecords);

            const result = await repository.findByResourceId('resource-101');

            expect(result[0].createdAt).toEqual(new Date('2024-01-02'));
            expect(result[1].createdAt).toEqual(new Date('2024-01-01'));
        });

        it('should handle empty resource ID', async () => {
            mockRepository.find.mockResolvedValue([]);

            const result = await repository.findByResourceId('');

            expect(result).toEqual([]);
        });

        it('should find history for resource with multiple bookings', async () => {
            const multipleResourceHistory = [
                { ...mockBookingHistory, bookingId: 'booking-1', userId: 'user-1' },
                { ...mockBookingHistory, bookingId: 'booking-2', userId: 'user-2' },
                { ...mockBookingHistory, bookingId: 'booking-3', userId: 'user-3' },
            ];
            mockRepository.find.mockResolvedValue(multipleResourceHistory);

            const result = await repository.findByResourceId('resource-101');

            expect(result).toHaveLength(3);
            expect(result[0].userId).toBe('user-1');
            expect(result[1].userId).toBe('user-2');
            expect(result[2].userId).toBe('user-3');
        });
    });

    describe('findAll', () => {
        it('should find all booking history successfully', async () => {
            const allHistory = [mockBookingHistory, { ...mockBookingHistory, id: 'history-2' }];
            mockRepository.find.mockResolvedValue(allHistory);

            const result = await repository.findAll();

            expect(mockRepository.find).toHaveBeenCalledWith({
                order: { createdAt: 'DESC' },
            });
            expect(result).toBe(allHistory);
            expect(result).toHaveLength(2);
        });

        it('should return empty array when no history exists', async () => {
            mockRepository.find.mockResolvedValue([]);

            const result = await repository.findAll();

            expect(result).toEqual([]);
        });

        it('should handle findAll errors', async () => {
            mockRepository.find.mockRejectedValue(new Error('Database error'));

            await expect(repository.findAll()).rejects.toThrow('Database error');
        });

        it('should return all history ordered by creation date descending', async () => {
            const olderHistory = { ...mockBookingHistory, createdAt: new Date('2024-01-01') };
            const newerHistory = { ...mockBookingHistory, createdAt: new Date('2024-01-02') };
            const historyRecords = [newerHistory, olderHistory];
            mockRepository.find.mockResolvedValue(historyRecords);

            const result = await repository.findAll();

            expect(result[0].createdAt).toEqual(new Date('2024-01-02'));
            expect(result[1].createdAt).toEqual(new Date('2024-01-01'));
        });

        it('should handle large number of history records', async () => {
            const largeHistoryList = Array.from({ length: 100 }, (_, i) => ({
                ...mockBookingHistory,
                id: `history-${i}`,
                bookingId: `booking-${i}`,
            }));
            mockRepository.find.mockResolvedValue(largeHistoryList);

            const result = await repository.findAll();

            expect(result).toHaveLength(100);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle concurrent operations', async () => {
            mockRepository.save.mockResolvedValue(mockBookingHistory);
            mockRepository.find.mockResolvedValue([mockBookingHistory]);

            const promises = [
                repository.save(mockBookingHistory),
                repository.findByBookingId('booking-456'),
                repository.findByUserId('user-789'),
                repository.findByResourceId('resource-101'),
                repository.findAll(),
            ];

            const results = await Promise.all(promises);

            expect(results).toHaveLength(5);
            expect(results[0]).toBe(mockBookingHistory);
            expect(results[1]).toEqual([mockBookingHistory]);
            expect(results[2]).toEqual([mockBookingHistory]);
            expect(results[3]).toEqual([mockBookingHistory]);
            expect(results[4]).toEqual([mockBookingHistory]);
        });

        it('should handle malformed history data', async () => {
            const malformedHistory = {
                id: '',
                bookingId: '',
                userId: '',
                resourceId: '',
                previousStatus: null as any,
                newStatus: null as any,
                reason: null as any,
                metadata: null as any,
            } as BookingHistory;
            mockRepository.save.mockResolvedValue(malformedHistory);

            const result = await repository.save(malformedHistory);

            expect(result).toBe(malformedHistory);
        });

        it('should handle history with special characters in reason', async () => {
            const specialReason = 'Reason with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
            const historyWithSpecialReason = { ...mockBookingHistory, reason: specialReason };
            mockRepository.save.mockResolvedValue(historyWithSpecialReason);

            const result = await repository.save(historyWithSpecialReason);

            expect(result.reason).toBe(specialReason);
        });

        it('should handle history with unicode characters', async () => {
            const unicodeReason = 'Reason with unicode: 预订取消 🎫';
            const historyWithUnicode = { ...mockBookingHistory, reason: unicodeReason };
            mockRepository.save.mockResolvedValue(historyWithUnicode);

            const result = await repository.save(historyWithUnicode);

            expect(result.reason).toBe(unicodeReason);
        });

        it('should handle history with newlines in reason', async () => {
            const multilineReason = 'Line 1\nLine 2\nLine 3';
            const historyWithMultilineReason = { ...mockBookingHistory, reason: multilineReason };
            mockRepository.save.mockResolvedValue(historyWithMultilineReason);

            const result = await repository.save(historyWithMultilineReason);

            expect(result.reason).toBe(multilineReason);
        });

        it('should handle database connection failures gracefully', async () => {
            mockRepository.save.mockRejectedValue(new Error('Connection timeout'));
            mockRepository.find.mockRejectedValue(new Error('Connection timeout'));

            await expect(repository.save(mockBookingHistory)).rejects.toThrow('Connection timeout');
            await expect(repository.findByBookingId('booking-456')).rejects.toThrow('Connection timeout');
            await expect(repository.findByUserId('user-789')).rejects.toThrow('Connection timeout');
            await expect(repository.findByResourceId('resource-101')).rejects.toThrow('Connection timeout');
            await expect(repository.findAll()).rejects.toThrow('Connection timeout');
        });

        it('should handle very long metadata objects', async () => {
            const veryLongMetadata = {
                data: 'A'.repeat(10000),
                nested: {
                    level1: {
                        level2: {
                            level3: 'deep nested data',
                        },
                    },
                },
            };
            const historyWithLongMetadata = { ...mockBookingHistory, metadata: veryLongMetadata };
            mockRepository.save.mockResolvedValue(historyWithLongMetadata);

            const result = await repository.save(historyWithLongMetadata);

            expect(result.metadata).toEqual(veryLongMetadata);
        });
    });
});
