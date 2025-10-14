import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetBookingQuery } from '../get-booking.query';
import { BookingRepository } from '../../../infrastructure/persistence/typeorm/booking.repository';
import { BookingId } from '../../../domain/value-objects/booking-id.value-object';
import { Booking } from '../../../domain/entities/booking.entity';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetBookingQuery)
export class GetBookingHandler implements IQueryHandler<GetBookingQuery> {
    constructor(
        private readonly bookingRepository: BookingRepository,
    ) { }

    async execute(query: GetBookingQuery): Promise<Booking> {
        const { bookingId } = query;

        const booking = await this.bookingRepository.findById(new BookingId(bookingId));
        if (!booking) {
            throw new NotFoundException(`Booking with ID ${bookingId} not found`);
        }

        return booking;
    }
}
