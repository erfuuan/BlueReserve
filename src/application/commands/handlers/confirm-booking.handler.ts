import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { ConfirmBookingCommand } from '../confirm-booking.command';
import { BookingRepository } from '../../../infrastructure/persistence/typeorm/booking.repository';
import { BookingId } from '../../../domain/value-objects/booking-id.value-object';
import { BookingConfirmedEvent } from '../../../domain/events/booking-confirmed.event';
import { Booking } from '../../../domain/entities/booking.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@CommandHandler(ConfirmBookingCommand)
export class ConfirmBookingHandler implements ICommandHandler<ConfirmBookingCommand> {
    constructor(
        private readonly bookingRepository: BookingRepository,
        private readonly eventBus: EventBus,
    ) { }

    async execute(command: ConfirmBookingCommand): Promise<Booking> {
        const { bookingId } = command;

        // Find booking
        const booking = await this.bookingRepository.findById(new BookingId(bookingId));
        if (!booking) {
            throw new NotFoundException(`Booking with ID ${bookingId} not found`);
        }

        // Confirm booking
        try {
            booking.confirm();
        } catch (error) {
            throw new BadRequestException(error.message);
        }

        // Save updated booking
        const updatedBooking = await this.bookingRepository.save(booking);

        // Publish domain event
        this.eventBus.publish(
            new BookingConfirmedEvent(
                updatedBooking.id,
                updatedBooking.userId,
                updatedBooking.resourceId,
                new Date()
            )
        );

        return updatedBooking;
    }
}
