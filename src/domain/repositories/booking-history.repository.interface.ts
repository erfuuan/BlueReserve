import { BookingHistory } from '../entities/booking-history.entity';

export interface BookingHistoryRepository {
    save(history: BookingHistory): Promise<BookingHistory>;
    findByBookingId(bookingId: string): Promise<BookingHistory[]>;
    findByUserId(userId: string): Promise<BookingHistory[]>;
    findByResourceId(resourceId: string): Promise<BookingHistory[]>;
    findAll(): Promise<BookingHistory[]>;
}
