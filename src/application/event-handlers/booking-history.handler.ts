import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { BookingCreatedEvent } from '../../domain/events/booking-created.event';
import { BookingConfirmedEvent } from '../../domain/events/booking-confirmed.event';
import { BookingCancelledEvent } from '../../domain/events/booking-cancelled.event';
import { BookingHistoryRepository } from '../../infrastructure/persistence/typeorm/booking-history.repository';
import { BookingHistory } from '../../domain/entities/booking-history.entity';
import { BookingStatus } from '../../domain/enums/booking-status.enum';
import { Inject } from '@nestjs/common';

@EventsHandler(BookingCreatedEvent)
export class BookingCreatedHistoryHandler implements IEventHandler<BookingCreatedEvent> {
    constructor(
        private readonly bookingHistoryRepository: BookingHistoryRepository,
    ) { }

    async handle(event: BookingCreatedEvent): Promise<void> {
        const history = new BookingHistory(
            event.bookingId,
            event.userId,
            event.resourceId,
            null as any, // No previous status for new booking
            BookingStatus.PENDING,
            'Booking created',
            {
                startTime: event.startTime,
                endTime: event.endTime,
                createdAt: event.createdAt,
            }
        );

        await this.bookingHistoryRepository.save(history);
    }
}

@EventsHandler(BookingConfirmedEvent)
export class BookingConfirmedHistoryHandler implements IEventHandler<BookingConfirmedEvent> {
    constructor(
        private readonly bookingHistoryRepository: BookingHistoryRepository,
    ) { }

    async handle(event: BookingConfirmedEvent): Promise<void> {
        const history = new BookingHistory(
            event.bookingId,
            event.userId,
            event.resourceId,
            BookingStatus.PENDING,
            BookingStatus.CONFIRMED,
            'Booking confirmed',
            {
                confirmedAt: event.confirmedAt,
            }
        );

        await this.bookingHistoryRepository.save(history);
    }
}

@EventsHandler(BookingCancelledEvent)
export class BookingCancelledHistoryHandler implements IEventHandler<BookingCancelledEvent> {
    constructor(
        private readonly bookingHistoryRepository: BookingHistoryRepository,
    ) { }

    async handle(event: BookingCancelledEvent): Promise<void> {
        const history = new BookingHistory(
            event.bookingId,
            event.userId,
            event.resourceId,
            BookingStatus.PENDING, // Assuming it was pending before cancellation
            BookingStatus.CANCELLED,
            event.reason || 'Booking cancelled',
            {
                cancelledAt: event.cancelledAt,
            }
        );

        await this.bookingHistoryRepository.save(history);
    }
}
