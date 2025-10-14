import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { CancelBookingHandler } from './cancel-booking.handler';
import { CancelBookingCommand } from '../cancel-booking.command';
import { BookingRepository } from '@/infrastructure/persistence/typeorm/booking.repository';
import { Booking } from '@/domain/entities/booking.entity';
import { BookingId } from '@/domain/value-objects/booking-id.value-object';
import { TimeSlot } from '@/domain/value-objects/time-slot.value-object';
import { BookingStatus } from '@/domain/enums/booking-status.enum';
import { BookingCancelledEvent } from '@/domain/events/booking-cancelled.event';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CancelBookingHandler', () => {
    let handler: CancelBookingHandler;
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
                CancelBookingHandler,
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

        handler = module.get<CancelBookingHandler>(CancelBookingHandler);
        bookingRepository = module.get(BookingRepository);
        eventBus = module.get(EventBus);
    });

    describe('execute', () => {
        const command = new CancelBookingCommand(bookingId.toString(), 'Change of plans');

        it('should cancel a booking successfully', async () => {
            bookingRepository.findById.mockResolvedValue(mockBooking);
            bookingRepository.save.mockResolvedValue({
                ...mockBooking,
                status: BookingStatus.CANCELLED,
            } as any);

            const result = await handler.execute(command);

            expect(bookingRepository.findById).toHaveBeenCalledWith(bookingId);
            expect(bookingRepository.save).toHaveBeenCalledWith(mockBooking);
            expect(eventBus.publish).toHaveBeenCalledWith(
                expect.any(BookingCancelledEvent)
            );
            expect(result).toBeDefined();
            expect(result.status).toBe(BookingStatus.CANCELLED);
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

        it('should throw BadRequestException when booking is already cancelled', async () => {
            const cancelledBooking = new Booking(bookingId, userId, resourceId, validTimeSlot);
            cancelledBooking.cancel(); // Cancel it first
            bookingRepository.findById.mockResolvedValue(cancelledBooking);

            await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
            await expect(handler.execute(command)).rejects.toThrow('Booking is already cancelled');
            expect(bookingRepository.save).not.toHaveBeenCalled();
            expect(eventBus.publish).not.toHaveBeenCalled();
        });

        it('should cancel a confirmed booking successfully', async () => {
            const confirmedBooking = new Booking(bookingId, userId, resourceId, validTimeSlot);
            confirmedBooking.status = BookingStatus.CONFIRMED;
            bookingRepository.findById.mockResolvedValue(confirmedBooking);
            bookingRepository.save.mockResolvedValue({
                ...confirmedBooking,
                status: BookingStatus.CANCELLED,
            } as any);

            const result = await handler.execute(command);

            expect(bookingRepository.findById).toHaveBeenCalledWith(bookingId);
            expect(bookingRepository.save).toHaveBeenCalledWith(confirmedBooking);
            expect(eventBus.publish).toHaveBeenCalledWith(
                expect.any(BookingCancelledEvent)
            );
            expect(result).toBeDefined();
            expect(result.status).toBe(BookingStatus.CANCELLED);
        });

        it('should throw BadRequestException when trying to cancel a completed booking', async () => {
            const completedBooking = new Booking(bookingId, userId, resourceId, validTimeSlot);
            completedBooking.status = BookingStatus.COMPLETED;
            bookingRepository.findById.mockResolvedValue(completedBooking);

            await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
            await expect(handler.execute(command)).rejects.toThrow('Cannot cancel a completed booking');
            expect(bookingRepository.save).not.toHaveBeenCalled();
            expect(eventBus.publish).not.toHaveBeenCalled();
        });

        it('should publish BookingCancelledEvent with correct data', async () => {
            const freshBooking = new Booking(bookingId, userId, resourceId, validTimeSlot, 'Test booking');
            bookingRepository.findById.mockResolvedValue(freshBooking);
            bookingRepository.save.mockResolvedValue({
                ...freshBooking,
                status: BookingStatus.CANCELLED,
            } as any);

            await handler.execute(command);

            expect(eventBus.publish).toHaveBeenCalledWith(
                expect.objectContaining({
                    bookingId: bookingId.toString(),
                    userId: userId,
                    resourceId: resourceId,
                    reason: 'Change of plans',
                })
            );
        });

        it('should handle repository save errors', async () => {
            const freshBooking = new Booking(bookingId, userId, resourceId, validTimeSlot, 'Test booking');
            bookingRepository.findById.mockResolvedValue(freshBooking);
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

        it('should work with different cancellation reasons', async () => {
            const differentCommand = new CancelBookingCommand(bookingId.toString(), 'Emergency');
            const freshBooking = new Booking(bookingId, userId, resourceId, validTimeSlot, 'Test booking');
            bookingRepository.findById.mockResolvedValue(freshBooking);
            bookingRepository.save.mockResolvedValue({
                ...freshBooking,
                status: BookingStatus.CANCELLED,
            } as any);

            await handler.execute(differentCommand);

            expect(eventBus.publish).toHaveBeenCalledWith(
                expect.objectContaining({
                    reason: 'Emergency',
                })
            );
        });

        it('should work with empty cancellation reason', async () => {
            const emptyReasonCommand = new CancelBookingCommand(bookingId.toString(), '');
            const freshBooking = new Booking(bookingId, userId, resourceId, validTimeSlot, 'Test booking');
            bookingRepository.findById.mockResolvedValue(freshBooking);
            bookingRepository.save.mockResolvedValue({
                ...freshBooking,
                status: BookingStatus.CANCELLED,
            } as any);

            await handler.execute(emptyReasonCommand);

            expect(eventBus.publish).toHaveBeenCalledWith(
                expect.objectContaining({
                    reason: '',
                })
            );
        });
    });
});