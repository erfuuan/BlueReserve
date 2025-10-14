import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ReservationController } from '../presentation/controllers/reservation.controller';
import { HealthController } from '../presentation/controllers/health.controller';
import { Booking } from '../domain/entities/booking.entity';
import { User } from '../domain/entities/user.entity';
import { Resource } from '../domain/entities/resource.entity';
import { BookingHistory } from '../domain/entities/booking-history.entity';
import { BookingRepository } from '../infrastructure/persistence/typeorm/booking.repository';
import { UserRepository } from '../infrastructure/persistence/typeorm/user.repository';
import { ResourceRepository } from '../infrastructure/persistence/typeorm/resource.repository';
import { CreateBookingHandler } from '../application/commands/handlers/create-booking.handler';
import { ConfirmBookingHandler } from '../application/commands/handlers/confirm-booking.handler';
import { CancelBookingHandler } from '../application/commands/handlers/cancel-booking.handler';
import { GetBookingHandler } from '../application/queries/handlers/get-booking.handler';
import { GetUserBookingsHandler } from '../application/queries/handlers/get-user-bookings.handler';
import { GetAvailableResourcesHandler } from '../application/queries/handlers/get-available-resources.handler';
import { BookingHistoryRepository } from '../infrastructure/persistence/typeorm/booking-history.repository';
import { BookingCreatedHistoryHandler, BookingConfirmedHistoryHandler, BookingCancelledHistoryHandler } from '../application/event-handlers/booking-history.handler';

const commandHandlers = [
    CreateBookingHandler,
    ConfirmBookingHandler,
    CancelBookingHandler,
];

const queryHandlers = [
    GetBookingHandler,
    GetUserBookingsHandler,
    GetAvailableResourcesHandler,
];

const eventHandlers = [
    BookingCreatedHistoryHandler,
    BookingConfirmedHistoryHandler,
    BookingCancelledHistoryHandler,
];

@Module({
    imports: [
        TypeOrmModule.forFeature([Booking, User, Resource, BookingHistory]),
        CqrsModule,
    ],
    controllers: [ReservationController, HealthController],
    providers: [
        ...commandHandlers,
        ...queryHandlers,
        ...eventHandlers,
        BookingRepository,
        UserRepository,
        ResourceRepository,
        BookingHistoryRepository,
    ],
    exports: [
        BookingRepository,
        UserRepository,
        ResourceRepository,
    ],
})
export class BookingModule { }
