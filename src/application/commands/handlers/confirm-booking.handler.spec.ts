import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { ConfirmBookingHandler } from './confirm-booking.handler';
import { ConfirmBookingCommand } from '../confirm-booking.command';
import { BookingRepository } from '@/infrastructure/persistence/typeorm/booking.repository';
import { Booking } from '@/domain/entities/booking.entity';
import { BookingId } from '@/domain/value-objects/booking-id.value-object';
import { TimeSlot } from '@/domain/value-objects/time-slot.value-object';
import { BookingStatus } from '@/domain/enums/booking-status.enum';
import { BookingConfirmedEvent } from '@/domain/events/booking-confirmed.event';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ConfirmBookingHandler', () => {
    let handler: ConfirmBookingHandler;
    let bookingRepository: jest.Mocked<BookingRepository>;
    let eventBus: jest.Mocked<EventBus>;

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
                ConfirmBookingHandler,
                {
                    provide: BookingRepository,
                    useValue: {
                        findById: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: EventBus,
                    useValue: {
                        publish: jest.fn(),
                    },
                },
            ],
        }).compile();

        handler = module.get<ConfirmBookingHandler>(ConfirmBookingHandler);
        bookingRepository = module.get(BookingRepository);
        eventBus = module.get(EventBus);
    });

    describe('execute', () => {
        const command = new ConfirmBookingCommand(bookingId.toString());

        it('should confirm a booking successfully', async () => {
            bookingRepository.findById.mockResolvedValue(mockBooking);
            bookingRepository.save.mockResolvedValue({
                ...mockBooking,
                status: BookingStatus.CONFIRMED,
            } as any);

            const result = await handler.execute(command);

            expect(bookingRepository.findById).toHaveBeenCalledWith(bookingId);
            expect(bookingRepository.save).toHaveBeenCalledWith(mockBooking);
            expect(eventBus.publish).toHaveBeenCalledWith(
                expect.any(BookingConfirmedEvent)
            );
            expect(result).toBeDefined();
            expect(result.status).toBe(BookingStatus.CONFIRMED);
        });

        it('should throw NotFoundException when booking not found', async () => {
            bookingRepository.findById.mockResolvedValue(null);

            await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
            await expect(handler.execute(command)).rejects.toThrow(
                `Booking with ID ${bookingId.toString()} not found`
            );
            expect(bookingRepository.save).not.toHaveBeenCalled();
            expect(eventBus.publish).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when booking is already confirmed', async () => {
            const confirmedBooking = new Booking(bookingId, userId, resourceId, validTimeSlot);
            confirmedBooking.confirm();
            bookingRepository.findById.mockResolvedValue(confirmedBooking);

            await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
            await expect(handler.execute(command)).rejects.toThrow(
                'Only pending bookings can be confirmed'
            );
            expect(bookingRepository.save).not.toHaveBeenCalled();
            expect(eventBus.publish).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when booking is cancelled', async () => {
            const cancelledBooking = new Booking(bookingId, userId, resourceId, validTimeSlot);
            cancelledBooking.cancel();
            bookingRepository.findById.mockResolvedValue(cancelledBooking);

            await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
            await expect(handler.execute(command)).rejects.toThrow(
                'Only pending bookings can be confirmed'
            );
            expect(bookingRepository.save).not.toHaveBeenCalled();
            expect(eventBus.publish).not.toHaveBeenCalled();
        });

        it('should publish BookingConfirmedEvent with correct data', async () => {
            const pendingBooking = new Booking(bookingId, userId, resourceId, validTimeSlot);
            bookingRepository.findById.mockResolvedValue(pendingBooking);
            bookingRepository.save.mockResolvedValue({
                ...pendingBooking,
                status: BookingStatus.CONFIRMED,
            } as any);

            await handler.execute(command);

            expect(eventBus.publish).toHaveBeenCalledWith(
                expect.objectContaining({
                    bookingId: bookingId.toString(),
                    userId: userId,
                    resourceId: resourceId,
                })
            );
        });

        it('should handle repository save errors', async () => {
            const pendingBooking = new Booking(bookingId, userId, resourceId, validTimeSlot);
            bookingRepository.findById.mockResolvedValue(pendingBooking);
            bookingRepository.save.mockRejectedValue(new Error('Database error'));

            await expect(handler.execute(command)).rejects.toThrow('Database error');
            expect(eventBus.publish).not.toHaveBeenCalled();
        });

        it('should handle repository findById errors', async () => {
            bookingRepository.findById.mockRejectedValue(new Error('Database connection failed'));

            await expect(handler.execute(command)).rejects.toThrow('Database connection failed');
            expect(bookingRepository.save).not.toHaveBeenCalled();
            expect(eventBus.publish).not.toHaveBeenCalled();
        });

        it('should confirm booking with different status transitions', async () => {
            const pendingBooking = new Booking(bookingId, userId, resourceId, validTimeSlot);
            expect(pendingBooking.status).toBe(BookingStatus.PENDING);

            bookingRepository.findById.mockResolvedValue(pendingBooking);
            bookingRepository.save.mockResolvedValue({
                ...pendingBooking,
                status: BookingStatus.CONFIRMED,
            } as any);

            const result = await handler.execute(command);

            expect(result.status).toBe(BookingStatus.CONFIRMED);
            expect(eventBus.publish).toHaveBeenCalledWith(
                expect.any(BookingConfirmedEvent)
            );
        });

        it('should handle event publishing errors gracefully', async () => {
            const pendingBooking = new Booking(bookingId, userId, resourceId, validTimeSlot);
            bookingRepository.findById.mockResolvedValue(pendingBooking);
            bookingRepository.save.mockResolvedValue({
                ...pendingBooking,
                status: BookingStatus.CONFIRMED,
            } as any);
            eventBus.publish.mockImplementation(() => {
                throw new Error('Event publishing failed');
            });

            await expect(handler.execute(command)).rejects.toThrow('Event publishing failed');
        });
    });
});