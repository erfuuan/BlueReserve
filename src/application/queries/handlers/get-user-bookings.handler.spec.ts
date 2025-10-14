import { Test, TestingModule } from '@nestjs/testing';
import { GetUserBookingsHandler } from './get-user-bookings.handler';
import { GetUserBookingsQuery } from '../get-user-bookings.query';
import { BookingRepository } from '@/infrastructure/persistence/typeorm/booking.repository';
import { Booking } from '@/domain/entities/booking.entity';
import { BookingId } from '@/domain/value-objects/booking-id.value-object';
import { TimeSlot } from '@/domain/value-objects/time-slot.value-object';
import { BookingStatus } from '@/domain/enums/booking-status.enum';

describe('GetUserBookingsHandler', () => {
    let handler: GetUserBookingsHandler;
    let bookingRepository: jest.Mocked<BookingRepository>;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureEndDate = new Date(futureDate);
    futureEndDate.setHours(futureEndDate.getHours() + 2);

    const validTimeSlot = new TimeSlot(futureDate, futureEndDate);
    const userId = 'user-123';
    const resourceId = 'resource-456';

    const mockBookings = [
        new Booking(new BookingId(), userId, resourceId, validTimeSlot, 'Booking 1'),
        new Booking(new BookingId(), userId, resourceId, validTimeSlot, 'Booking 2'),
        new Booking(new BookingId(), userId, resourceId, validTimeSlot, 'Booking 3'),
    ];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetUserBookingsHandler,
                {
                    provide: BookingRepository,
                    useValue: {
                        findByUserId: jest.fn(),
                        findBookingsByStatus: jest.fn(),
                    },
                },
            ],
        }).compile();

        handler = module.get<GetUserBookingsHandler>(GetUserBookingsHandler);
        bookingRepository = module.get(BookingRepository);
    });

    describe('execute', () => {
        it('should return all user bookings when no status filter', async () => {
            const query = new GetUserBookingsQuery(userId);
            bookingRepository.findByUserId.mockResolvedValue(mockBookings);

            const result = await handler.execute(query);

            expect(bookingRepository.findByUserId).toHaveBeenCalledWith(userId);
            expect(bookingRepository.findBookingsByStatus).not.toHaveBeenCalled();
            expect(result).toBe(mockBookings);
            expect(result).toHaveLength(3);
        });

        it('should return filtered bookings when status is provided', async () => {
            const query = new GetUserBookingsQuery(userId, BookingStatus.PENDING);
            const pendingBookings = mockBookings.slice(0, 2);
            bookingRepository.findBookingsByStatus.mockResolvedValue(pendingBookings);

            const result = await handler.execute(query);

            expect(bookingRepository.findBookingsByStatus).toHaveBeenCalledWith(BookingStatus.PENDING);
            expect(bookingRepository.findByUserId).not.toHaveBeenCalled();
            expect(result).toBe(pendingBookings);
            expect(result).toHaveLength(2);
        });

        it('should return empty array when user has no bookings', async () => {
            const query = new GetUserBookingsQuery(userId);
            bookingRepository.findByUserId.mockResolvedValue([]);

            const result = await handler.execute(query);

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('should return empty array when no bookings match status filter', async () => {
            const query = new GetUserBookingsQuery(userId, BookingStatus.CONFIRMED);
            bookingRepository.findBookingsByStatus.mockResolvedValue([]);

            const result = await handler.execute(query);

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('should handle repository errors for findByUserId', async () => {
            const query = new GetUserBookingsQuery(userId);
            bookingRepository.findByUserId.mockRejectedValue(new Error('Database error'));

            await expect(handler.execute(query)).rejects.toThrow('Database error');
        });

        it('should handle repository errors for findBookingsByStatus', async () => {
            const query = new GetUserBookingsQuery(userId, BookingStatus.PENDING);
            bookingRepository.findBookingsByStatus.mockRejectedValue(new Error('Database error'));

            await expect(handler.execute(query)).rejects.toThrow('Database error');
        });

        it('should work with different user IDs', async () => {
            const differentUserId = 'user-456';
            const query = new GetUserBookingsQuery(differentUserId);
            const userBookings = [mockBookings[0]];
            bookingRepository.findByUserId.mockResolvedValue(userBookings);

            const result = await handler.execute(query);

            expect(bookingRepository.findByUserId).toHaveBeenCalledWith(differentUserId);
            expect(result).toBe(userBookings);
        });

        it('should work with all booking statuses', async () => {
            const statuses = [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CANCELLED];

            for (const status of statuses) {
                const query = new GetUserBookingsQuery(userId, status);
                const statusBookings = [mockBookings[0]];
                bookingRepository.findBookingsByStatus.mockResolvedValue(statusBookings);

                const result = await handler.execute(query);

                expect(bookingRepository.findBookingsByStatus).toHaveBeenCalledWith(status);
                expect(result).toBe(statusBookings);
            }
        });

        it('should handle mixed booking statuses in results', async () => {
            const mixedBookings = [
                new Booking(new BookingId(), userId, resourceId, validTimeSlot),
                new Booking(new BookingId(), userId, resourceId, validTimeSlot),
            ];
            mixedBookings[0].confirm();
            mixedBookings[1].cancel();

            const query = new GetUserBookingsQuery(userId);
            bookingRepository.findByUserId.mockResolvedValue(mixedBookings);

            const result = await handler.execute(query);

            expect(result).toBe(mixedBookings);
            expect(result[0].status).toBe(BookingStatus.CONFIRMED);
            expect(result[1].status).toBe(BookingStatus.CANCELLED);
        });

        it('should handle large number of bookings', async () => {
            const largeBookingList = Array.from({ length: 100 }, (_, i) =>
                new Booking(new BookingId(), userId, resourceId, validTimeSlot, `Booking ${i}`)
            );
            const query = new GetUserBookingsQuery(userId);
            bookingRepository.findByUserId.mockResolvedValue(largeBookingList);

            const result = await handler.execute(query);

            expect(result).toBe(largeBookingList);
            expect(result).toHaveLength(100);
        });
    });
});