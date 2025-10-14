import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { CreateBookingCommand } from '../create-booking.command';
import { BookingRepository } from '../../../infrastructure/persistence/typeorm/booking.repository';
import { UserRepository } from '../../../infrastructure/persistence/typeorm/user.repository';
import { ResourceRepository } from '../../../infrastructure/persistence/typeorm/resource.repository';
import { Booking } from '../../../domain/entities/booking.entity';
import { BookingId } from '../../../domain/value-objects/booking-id.value-object';
import { TimeSlot } from '../../../domain/value-objects/time-slot.value-object';
import { BookingCreatedEvent } from '../../../domain/events/booking-created.event';
import { ConflictException, NotFoundException } from '@nestjs/common';

@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler implements ICommandHandler<CreateBookingCommand> {
    constructor(
        private readonly bookingRepository: BookingRepository,
        private readonly userRepository: UserRepository,
        private readonly resourceRepository: ResourceRepository,
        private readonly eventBus: EventBus,
    ) { }

    async execute(command: CreateBookingCommand): Promise<Booking> {
        const { userId, resourceId, startTime, endTime, notes } = command;

        // Validate user exists - had issues with deleted users before
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const resource = await this.resourceRepository.findById(resourceId);
        if (!resource) {
            throw new NotFoundException(`Resource with ID ${resourceId} not found`);
        }

        const timeSlot = new TimeSlot(new Date(startTime), new Date(endTime));

        const overlappingBookings = await this.bookingRepository.findOverlappingBookings(
            resourceId,
            timeSlot
        );

        if (overlappingBookings.length > 0) {
            throw new ConflictException(
                `Resource is not available for the requested time slot. Found ${overlappingBookings.length} overlapping bookings.`
            );
        }

        if (!resource.isAvailable(timeSlot)) {
            throw new ConflictException('Resource is not available for the requested time slot');
        }

        const bookingId = new BookingId();
        const booking = new Booking(bookingId, userId, resourceId, timeSlot, notes);

        const savedBooking = await this.bookingRepository.save(booking);

        this.eventBus.publish(
            new BookingCreatedEvent(
                savedBooking.id,
                savedBooking.userId,
                savedBooking.resourceId,
                savedBooking.startTime,
                savedBooking.endTime,
                savedBooking.createdAt
            )
        );

        return savedBooking;
    }
}
