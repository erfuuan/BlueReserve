import { Test, TestingModule } from '@nestjs/testing';
import { BookingCreatedHistoryHandler, BookingConfirmedHistoryHandler, BookingCancelledHistoryHandler } from './booking-history.handler';
import { BookingCreatedEvent } from '@/domain/events/booking-created.event';
import { BookingConfirmedEvent } from '@/domain/events/booking-confirmed.event';
import { BookingCancelledEvent } from '@/domain/events/booking-cancelled.event';
import { BookingHistoryRepository } from '@/infrastructure/persistence/typeorm/booking-history.repository';
import { BookingHistory } from '@/domain/entities/booking-history.entity';
import { BookingStatus } from '@/domain/enums/booking-status.enum';

describe('Booking History Event Handlers', () => {
    let bookingHistoryRepository: jest.Mocked<BookingHistoryRepository>;
    let bookingCreatedHandler: BookingCreatedHistoryHandler;
    let bookingConfirmedHandler: BookingConfirmedHistoryHandler;
    let bookingCancelledHandler: BookingCancelledHistoryHandler;

    const mockBookingHistory = {
        id: 'history-123',
        bookingId: 'booking-456',
        userId: 'user-789',
        resourceId: 'resource-101',
        previousStatus: BookingStatus.PENDING,
        newStatus: BookingStatus.CONFIRMED,
        reason: 'Test reason',
        metadata: { test: 'data' },
        createdAt: new Date(),
    } as BookingHistory;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BookingCreatedHistoryHandler,
                BookingConfirmedHistoryHandler,
                BookingCancelledHistoryHandler,
                {
                    provide: BookingHistoryRepository,
                    useValue: {
                        save: jest.fn(),
                    },
                },
            ],
        }).compile();

        bookingCreatedHandler = module.get<BookingCreatedHistoryHandler>(BookingCreatedHistoryHandler);
        bookingConfirmedHandler = module.get<BookingConfirmedHistoryHandler>(BookingConfirmedHistoryHandler);
        bookingCancelledHandler = module.get<BookingCancelledHistoryHandler>(BookingCancelledHistoryHandler);
        bookingHistoryRepository = module.get(BookingHistoryRepository);
    });

    describe('BookingCreatedHistoryHandler', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        const futureEndDate = new Date(futureDate);
        futureEndDate.setHours(futureEndDate.getHours() + 2);

        const bookingCreatedEvent = new BookingCreatedEvent(
            'booking-456',
            'user-789',
            'resource-101',
            futureDate,
            futureEndDate,
            new Date()
        );

        it('should create history record with correct data', async () => {
            bookingHistoryRepository.save.mockResolvedValue(mockBookingHistory);

            await bookingCreatedHandler.handle(bookingCreatedEvent);

            expect(bookingHistoryRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    bookingId: 'booking-456',
                    userId: 'user-789',
                    resourceId: 'resource-101',
                    previousStatus: null,
                    newStatus: BookingStatus.PENDING,
                    reason: 'Booking created',
                    metadata: expect.objectContaining({
                        startTime: futureDate,
                        endTime: futureEndDate,
                        createdAt: expect.any(Date),
                    }),
                })
            );
        });

        it('should handle metadata serialization correctly', async () => {
            const eventWithSpecificTimes = new BookingCreatedEvent(
                'booking-456',
                'user-789',
                'resource-101',
                new Date('2024-01-15T10:00:00Z'),
                new Date('2024-01-15T12:00:00Z'),
                new Date('2024-01-15T09:00:00Z')
            );
            bookingHistoryRepository.save.mockResolvedValue(mockBookingHistory);

            await bookingCreatedHandler.handle(eventWithSpecificTimes);

            expect(bookingHistoryRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    metadata: {
                        startTime: new Date('2024-01-15T10:00:00Z'),
                        endTime: new Date('2024-01-15T12:00:00Z'),
                        createdAt: new Date('2024-01-15T09:00:00Z'),
                    },
                })
            );
        });

        it('should handle repository errors gracefully', async () => {
            bookingHistoryRepository.save.mockRejectedValue(new Error('Database connection failed'));

            await expect(bookingCreatedHandler.handle(bookingCreatedEvent)).rejects.toThrow('Database connection failed');
        });

        it('should handle null previous status correctly', async () => {
            bookingHistoryRepository.save.mockResolvedValue(mockBookingHistory);

            await bookingCreatedHandler.handle(bookingCreatedEvent);

            expect(bookingHistoryRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    previousStatus: null,
                    newStatus: BookingStatus.PENDING,
                })
            );
        });

        it('should handle different event data formats', async () => {
            const eventWithDifferentData = new BookingCreatedEvent(
                'different-booking-id',
                'different-user-id',
                'different-resource-id',
                new Date('2024-02-01T14:00:00Z'),
                new Date('2024-02-01T16:00:00Z'),
                new Date('2024-02-01T13:00:00Z')
            );
            bookingHistoryRepository.save.mockResolvedValue(mockBookingHistory);

            await bookingCreatedHandler.handle(eventWithDifferentData);

            expect(bookingHistoryRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    bookingId: 'different-booking-id',
                    userId: 'different-user-id',
                    resourceId: 'different-resource-id',
                    metadata: expect.objectContaining({
                        startTime: new Date('2024-02-01T14:00:00Z'),
                        endTime: new Date('2024-02-01T16:00:00Z'),
                        createdAt: new Date('2024-02-01T13:00:00Z'),
                    }),
                })
            );
        });
    });

    describe('BookingConfirmedHistoryHandler', () => {
        const bookingConfirmedEvent = new BookingConfirmedEvent(
            'booking-456',
            'user-789',
            'resource-101',
            new Date()
        );

        it('should track status transition from PENDING to CONFIRMED', async () => {
            bookingHistoryRepository.save.mockResolvedValue(mockBookingHistory);

            await bookingConfirmedHandler.handle(bookingConfirmedEvent);

            expect(bookingHistoryRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    bookingId: 'booking-456',
                    userId: 'user-789',
                    resourceId: 'resource-101',
                    previousStatus: BookingStatus.PENDING,
                    newStatus: BookingStatus.CONFIRMED,
                    reason: 'Booking confirmed',
                    metadata: expect.objectContaining({
                        confirmedAt: expect.any(Date),
                    }),
                })
            );
        });

        it('should include confirmation timestamp in metadata', async () => {
            const specificConfirmationTime = new Date('2024-01-15T15:30:00Z');
            const eventWithSpecificTime = new BookingConfirmedEvent(
                'booking-456',
                'user-789',
                'resource-101',
                specificConfirmationTime
            );
            bookingHistoryRepository.save.mockResolvedValue(mockBookingHistory);

            await bookingConfirmedHandler.handle(eventWithSpecificTime);

            expect(bookingHistoryRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    metadata: {
                        confirmedAt: specificConfirmationTime,
                    },
                })
            );
        });

        it('should handle repository errors', async () => {
            bookingHistoryRepository.save.mockRejectedValue(new Error('Database error'));

            await expect(bookingConfirmedHandler.handle(bookingConfirmedEvent)).rejects.toThrow('Database error');
        });

        it('should handle different confirmation times', async () => {
            const futureConfirmationTime = new Date();
            futureConfirmationTime.setHours(futureConfirmationTime.getHours() + 1);

            const eventWithFutureTime = new BookingConfirmedEvent(
                'booking-456',
                'user-789',
                'resource-101',
                futureConfirmationTime
            );
            bookingHistoryRepository.save.mockResolvedValue(mockBookingHistory);

            await bookingConfirmedHandler.handle(eventWithFutureTime);

            expect(bookingHistoryRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    metadata: {
                        confirmedAt: futureConfirmationTime,
                    },
                })
            );
        });

        it('should maintain correct status transition logic', async () => {
            bookingHistoryRepository.save.mockResolvedValue(mockBookingHistory);

            await bookingConfirmedHandler.handle(bookingConfirmedEvent);

            const savedHistory = bookingHistoryRepository.save.mock.calls[0][0];
            expect(savedHistory.previousStatus).toBe(BookingStatus.PENDING);
            expect(savedHistory.newStatus).toBe(BookingStatus.CONFIRMED);
            expect(savedHistory.reason).toBe('Booking confirmed');
        });
    });

    describe('BookingCancelledHistoryHandler', () => {
        const bookingCancelledEvent = new BookingCancelledEvent(
            'booking-456',
            'user-789',
            'resource-101',
            new Date(),
            'User requested cancellation'
        );

        it('should track cancellation with reason', async () => {
            bookingHistoryRepository.save.mockResolvedValue(mockBookingHistory);

            await bookingCancelledHandler.handle(bookingCancelledEvent);

            expect(bookingHistoryRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    bookingId: 'booking-456',
                    userId: 'user-789',
                    resourceId: 'resource-101',
                    previousStatus: BookingStatus.PENDING,
                    newStatus: BookingStatus.CANCELLED,
                    reason: 'User requested cancellation',
                    metadata: expect.objectContaining({
                        cancelledAt: expect.any(Date),
                    }),
                })
            );
        });

        it('should handle missing reason gracefully', async () => {
            const eventWithoutReason = new BookingCancelledEvent(
                'booking-456',
                'user-789',
                'resource-101',
                new Date(),
                undefined
            );
            bookingHistoryRepository.save.mockResolvedValue(mockBookingHistory);

            await bookingCancelledHandler.handle(eventWithoutReason);

            expect(bookingHistoryRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    reason: 'Booking cancelled',
                })
            );
        });

        it('should handle empty reason', async () => {
            const eventWithEmptyReason = new BookingCancelledEvent(
                'booking-456',
                'user-789',
                'resource-101',
                new Date(),
                ''
            );
            bookingHistoryRepository.save.mockResolvedValue(mockBookingHistory);

            await bookingCancelledHandler.handle(eventWithEmptyReason);

            expect(bookingHistoryRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    reason: 'Booking cancelled', // Empty string falls back to default
                })
            );
        });

        it('should include cancellation timestamp in metadata', async () => {
            const specificCancellationTime = new Date('2024-01-15T16:45:00Z');
            const eventWithSpecificTime = new BookingCancelledEvent(
                'booking-456',
                'user-789',
                'resource-101',
                specificCancellationTime,
                'Emergency cancellation'
            );
            bookingHistoryRepository.save.mockResolvedValue(mockBookingHistory);

            await bookingCancelledHandler.handle(eventWithSpecificTime);

            expect(bookingHistoryRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    metadata: {
                        cancelledAt: specificCancellationTime,
                    },
                })
            );
        });

        it('should handle repository errors', async () => {
            bookingHistoryRepository.save.mockRejectedValue(new Error('Database connection failed'));

            await expect(bookingCancelledHandler.handle(bookingCancelledEvent)).rejects.toThrow('Database connection failed');
        });

        it('should handle long cancellation reasons', async () => {
            const longReason = 'A'.repeat(1000);
            const eventWithLongReason = new BookingCancelledEvent(
                'booking-456',
                'user-789',
                'resource-101',
                new Date(),
                longReason
            );
            bookingHistoryRepository.save.mockResolvedValue(mockBookingHistory);

            await bookingCancelledHandler.handle(eventWithLongReason);

            expect(bookingHistoryRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    reason: longReason,
                })
            );
        });

        it('should handle special characters in reason', async () => {
            const specialReason = 'Cancellation reason with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
            const eventWithSpecialReason = new BookingCancelledEvent(
                'booking-456',
                'user-789',
                'resource-101',
                new Date(),
                specialReason
            );
            bookingHistoryRepository.save.mockResolvedValue(mockBookingHistory);

            await bookingCancelledHandler.handle(eventWithSpecialReason);

            expect(bookingHistoryRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    reason: specialReason,
                })
            );
        });

        it('should maintain correct status transition logic', async () => {
            bookingHistoryRepository.save.mockResolvedValue(mockBookingHistory);

            await bookingCancelledHandler.handle(bookingCancelledEvent);

            const savedHistory = bookingHistoryRepository.save.mock.calls[0][0];
            expect(savedHistory.previousStatus).toBe(BookingStatus.PENDING);
            expect(savedHistory.newStatus).toBe(BookingStatus.CANCELLED);
            expect(savedHistory.reason).toBe('User requested cancellation');
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle concurrent event processing', async () => {
            const event1 = new BookingCreatedEvent('booking-1', 'user-1', 'resource-1', new Date(), new Date(), new Date());
            const event2 = new BookingConfirmedEvent('booking-2', 'user-2', 'resource-2', new Date());
            const event3 = new BookingCancelledEvent('booking-3', 'user-3', 'resource-3', new Date(), 'Reason');

            bookingHistoryRepository.save.mockResolvedValue(mockBookingHistory);

            const promises = [
                bookingCreatedHandler.handle(event1),
                bookingConfirmedHandler.handle(event2),
                bookingCancelledHandler.handle(event3),
            ];

            await Promise.all(promises);

            expect(bookingHistoryRepository.save).toHaveBeenCalledTimes(3);
        });

        it('should handle malformed event data gracefully', async () => {
            const malformedEvent = new BookingCreatedEvent(
                '', // Empty booking ID
                '', // Empty user ID
                '', // Empty resource ID
                new Date(),
                new Date(),
                new Date()
            );
            bookingHistoryRepository.save.mockResolvedValue(mockBookingHistory);

            await bookingCreatedHandler.handle(malformedEvent);

            expect(bookingHistoryRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    bookingId: '',
                    userId: '',
                    resourceId: '',
                })
            );
        });
    });
});
