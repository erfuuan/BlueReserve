import { Test, TestingModule } from '@nestjs/testing';
import { GetBookingHandler } from './get-booking.handler';
import { GetBookingQuery } from '../get-booking.query';
import { BookingRepository } from '@/infrastructure/persistence/typeorm/booking.repository';
import { Booking } from '@/domain/entities/booking.entity';
import { BookingId } from '@/domain/value-objects/booking-id.value-object';
import { TimeSlot } from '@/domain/value-objects/time-slot.value-object';
import { BookingStatus } from '@/domain/enums/booking-status.enum';
import { NotFoundException } from '@nestjs/common';

describe('GetBookingHandler', () => {
    let handler: GetBookingHandler;
    let bookingRepository: jest.Mocked<BookingRepository>;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureEndDate = new Date(futureDate);
    futureEndDate.setHours(futureEndDate.getHours() + 2);

    const validTimeSlot = new TimeSlot(futureDate, futureEndDate);
    const bookingId = new BookingId();
    const userId = 'user-123';
    const resourceId = 'resource-456';

    const mockBooking = new Booking(bookingId, userId, resourceId, validTimeSlot, 'Test booking');

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetBookingHandler,
                {
                    provide: BookingRepository,
                    useValue: {
                        findById: jest.fn(),
                    },
                },
            ],
        }).compile();

        handler = module.get<GetBookingHandler>(GetBookingHandler);
        bookingRepository = module.get(BookingRepository);
    });

    describe('execute', () => {
        const query = new GetBookingQuery(bookingId.toString());

        it('should return booking when found', async () => {
            bookingRepository.findById.mockResolvedValue(mockBooking);

            const result = await handler.execute(query);

            expect(bookingRepository.findById).toHaveBeenCalledWith(bookingId);
            expect(result).toBe(mockBooking);
            expect(result.id).toBe(bookingId.toString());
            expect(result.userId).toBe(userId);
            expect(result.resourceId).toBe(resourceId);
        });

        it('should throw NotFoundException when booking not found', async () => {
            bookingRepository.findById.mockResolvedValue(null);

            await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
            await expect(handler.execute(query)).rejects.toThrow(
                `Booking with ID ${bookingId.toString()} not found`
            );
        });

        it('should handle repository errors', async () => {
            bookingRepository.findById.mockRejectedValue(new Error('Database connection failed'));

            await expect(handler.execute(query)).rejects.toThrow('Database connection failed');
        });

        it('should work with different booking IDs', async () => {
            const differentBookingId = new BookingId();
            const differentQuery = new GetBookingQuery(differentBookingId.toString());
            const differentBooking = new Booking(differentBookingId, userId, resourceId, validTimeSlot);

            bookingRepository.findById.mockResolvedValue(differentBooking);

            const result = await handler.execute(differentQuery);

            expect(bookingRepository.findById).toHaveBeenCalledWith(differentBookingId);
            expect(result).toBe(differentBooking);
        });

        it('should work with confirmed booking', async () => {
            const confirmedBooking = new Booking(bookingId, userId, resourceId, validTimeSlot);
            confirmedBooking.confirm();
            bookingRepository.findById.mockResolvedValue(confirmedBooking);

            const result = await handler.execute(query);

            expect(result).toBe(confirmedBooking);
            expect(result.status).toBe(BookingStatus.CONFIRMED);
        });

        it('should work with cancelled booking', async () => {
            const cancelledBooking = new Booking(bookingId, userId, resourceId, validTimeSlot);
            cancelledBooking.cancel();
            bookingRepository.findById.mockResolvedValue(cancelledBooking);

            const result = await handler.execute(query);

            expect(result).toBe(cancelledBooking);
            expect(result.status).toBe(BookingStatus.CANCELLED);
        });

        it('should work with booking without notes', async () => {
            const bookingWithoutNotes = new Booking(bookingId, userId, resourceId, validTimeSlot);
            bookingRepository.findById.mockResolvedValue(bookingWithoutNotes);

            const result = await handler.execute(query);

            expect(result).toBe(bookingWithoutNotes);
            expect(result.notes).toBeUndefined();
        });

        it('should handle invalid booking ID format', async () => {
            const invalidQuery = new GetBookingQuery('invalid-id');
            bookingRepository.findById.mockResolvedValue(null);

            await expect(handler.execute(invalidQuery)).rejects.toThrow(NotFoundException);
            await expect(handler.execute(invalidQuery)).rejects.toThrow(
                'Booking with ID invalid-id not found'
            );
        });
    });
});