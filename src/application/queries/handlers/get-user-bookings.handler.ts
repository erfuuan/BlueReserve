import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserBookingsQuery } from '../get-user-bookings.query';
import { BookingRepository } from '../../../infrastructure/persistence/typeorm/booking.repository';
import { Booking } from '../../../domain/entities/booking.entity';
import { PaginatedResponse } from '../../../shared/dto/pagination.dto';

@QueryHandler(GetUserBookingsQuery)
export class GetUserBookingsHandler implements IQueryHandler<GetUserBookingsQuery> {
    constructor(
        private readonly bookingRepository: BookingRepository,
    ) { }

    async execute(query: GetUserBookingsQuery): Promise<Booking[] | PaginatedResponse<Booking>> {
        const { userId, status, pagination } = query;

        // If pagination is requested, return paginated results
        if (pagination) {
            if (status) {
                return this.bookingRepository.findByUserIdAndStatusWithPagination(userId, status, pagination);
            }
            return this.bookingRepository.findByUserIdWithPagination(userId, pagination);
        }

        // Return non-paginated results for backward compatibility
        if (status) {
            return this.bookingRepository.findBookingsByStatus(status);
        }

        return this.bookingRepository.findByUserId(userId);
    }
}