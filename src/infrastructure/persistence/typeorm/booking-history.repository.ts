import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingHistoryRepository as IBookingHistoryRepository } from '../../../domain/repositories/booking-history.repository.interface';
import { BookingHistory } from '../../../domain/entities/booking-history.entity';

@Injectable()
export class BookingHistoryRepository implements IBookingHistoryRepository {
    constructor(
        @InjectRepository(BookingHistory)
        private readonly repository: Repository<BookingHistory>,
    ) { }

    async save(history: BookingHistory): Promise<BookingHistory> {
        return this.repository.save(history);
    }

    async findByBookingId(bookingId: string): Promise<BookingHistory[]> {
        return this.repository.find({
            where: { bookingId },
            order: { createdAt: 'DESC' },
        });
    }

    async findByUserId(userId: string): Promise<BookingHistory[]> {
        return this.repository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    async findByResourceId(resourceId: string): Promise<BookingHistory[]> {
        return this.repository.find({
            where: { resourceId },
            order: { createdAt: 'DESC' },
        });
    }

    async findAll(): Promise<BookingHistory[]> {
        return this.repository.find({
            order: { createdAt: 'DESC' },
        });
    }
}
