import { Booking } from '../entities/booking.entity';
import { BookingId } from '../value-objects/booking-id.value-object';
import { TimeSlot } from '../value-objects/time-slot.value-object';

export interface BookingRepository {
    save(booking: Booking): Promise<Booking>;
    findById(id: BookingId): Promise<Booking | null>;
    findByUserId(userId: string): Promise<Booking[]>;
    findByResourceId(resourceId: string): Promise<Booking[]>;
    findOverlappingBookings(resourceId: string, timeSlot: TimeSlot): Promise<Booking[]>;
    delete(id: BookingId): Promise<void>;
    findAll(): Promise<Booking[]>;
    findActiveBookings(): Promise<Booking[]>;
    findBookingsByStatus(status: string): Promise<Booking[]>;
}
