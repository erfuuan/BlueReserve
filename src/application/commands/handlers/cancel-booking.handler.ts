import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { CancelBookingCommand } from '../cancel-booking.command';
import { BookingRepository } from '../../../infrastructure/persistence/typeorm/booking.repository';
import { BookingId } from '../../../domain/value-objects/booking-id.value-object';
import { BookingCancelledEvent } from '../../../domain/events/booking-cancelled.event';
import { Booking } from '../../../domain/entities/booking.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@CommandHandler(CancelBookingCommand)
export class CancelBookingHandler implements ICommandHandler<CancelBookingCommand> {
    constructor(
        private readonly bookingRepository: BookingRepository,
        private readonly eventBus: EventBus,
    ) { }

    async execute(command: CancelBookingCommand): Promise<Booking> {
        const { bookingId, reason } = command;

        const booking = await this.bookingRepository.findById(new BookingId(bookingId));
        if (!booking) {
            throw new NotFoundException(`Booking with ID ${bookingId} not found`);
        }

        try {
            booking.cancel();
        } catch (error) {
            throw new BadRequestException(error.message);
        }

        const updatedBooking = await this.bookingRepository.save(booking);

        this.eventBus.publish(
            new BookingCancelledEvent(
                updatedBooking.id,
                updatedBooking.userId,
                updatedBooking.resourceId,
                new Date(),
                reason
            )
        );

        return updatedBooking;
    }
}
