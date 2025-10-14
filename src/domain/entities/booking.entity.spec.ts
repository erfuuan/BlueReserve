import { Booking } from './booking.entity';
import { BookingId } from '../value-objects/booking-id.value-object';
import { TimeSlot } from '../value-objects/time-slot.value-object';
import { BookingStatus } from '../enums/booking-status.enum';

describe('Booking Entity', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // 30 days from now
    const futureEndDate = new Date(futureDate);
    futureEndDate.setHours(futureEndDate.getHours() + 2); // 2 hours later

    const validTimeSlot = new TimeSlot(futureDate, futureEndDate);

    const bookingId = new BookingId();
    const userId = 'user-123';
    const resourceId = 'resource-456';

    describe('constructor', () => {
        it('should create a booking with valid parameters', () => {
            const booking = new Booking(bookingId, userId, resourceId, validTimeSlot, 'Test notes');

            expect(booking.id).toBe(bookingId.toString());
            expect(booking.userId).toBe(userId);
            expect(booking.resourceId).toBe(resourceId);
            expect(booking.startTime).toEqual(validTimeSlot.startTime);
            expect(booking.endTime).toEqual(validTimeSlot.endTime);
            expect(booking.status).toBe(BookingStatus.PENDING);
            expect(booking.notes).toBe('Test notes');
        });

        it('should create a booking without notes', () => {
            const booking = new Booking(bookingId, userId, resourceId, validTimeSlot);

            expect(booking.notes).toBeUndefined();
        });
    });

    describe('confirm', () => {
        it('should confirm a pending booking', () => {
            const booking = new Booking(bookingId, userId, resourceId, validTimeSlot);

            booking.confirm();

            expect(booking.status).toBe(BookingStatus.CONFIRMED);
        });

        it('should throw error when confirming non-pending booking', () => {
            const booking = new Booking(bookingId, userId, resourceId, validTimeSlot);
            booking.confirm();

            expect(() => booking.confirm()).toThrow('Only pending bookings can be confirmed');
        });
    });

    describe('cancel', () => {
        it('should cancel a pending booking successfully', () => {
            const booking = new Booking(bookingId, userId, resourceId, validTimeSlot);
            expect(booking.status).toBe(BookingStatus.PENDING);

            booking.cancel();

            expect(booking.status).toBe(BookingStatus.CANCELLED);
        });

        it('should cancel a confirmed booking successfully', () => {
            const booking = new Booking(bookingId, userId, resourceId, validTimeSlot);
            booking.status = BookingStatus.CONFIRMED;

            booking.cancel();

            expect(booking.status).toBe(BookingStatus.CANCELLED);
        });

        it('should throw error when cancelling already cancelled booking', () => {
            const booking = new Booking(bookingId, userId, resourceId, validTimeSlot);
            booking.cancel(); // First cancel should work
            expect(booking.status).toBe(BookingStatus.CANCELLED);

            // Second cancel should throw error
            expect(() => booking.cancel()).toThrow('Booking is already cancelled');
            expect(booking.status).toBe(BookingStatus.CANCELLED); // Status should remain unchanged
        });

        it('should throw error when cancelling completed booking', () => {
            const booking = new Booking(bookingId, userId, resourceId, validTimeSlot);
            booking.status = BookingStatus.COMPLETED;

            expect(() => booking.cancel()).toThrow('Cannot cancel a completed booking');
            expect(booking.status).toBe(BookingStatus.COMPLETED); // Status should remain unchanged
        });
    });

    describe('isOverlapping', () => {
        it('should detect overlapping bookings for same resource', () => {
            const booking1 = new Booking(bookingId, userId, resourceId, validTimeSlot);
            const overlappingStartDate = new Date(futureDate);
            overlappingStartDate.setHours(overlappingStartDate.getHours() + 1); // 1 hour later
            const overlappingEndDate = new Date(overlappingStartDate);
            overlappingEndDate.setHours(overlappingEndDate.getHours() + 2); // 2 hours later
            const overlappingTimeSlot = new TimeSlot(overlappingStartDate, overlappingEndDate);
            const booking2 = new Booking(new BookingId(), userId, resourceId, overlappingTimeSlot);

            expect(booking1.isOverlapping(booking2)).toBe(true);
        });

        it('should not detect overlap for different resources', () => {
            const booking1 = new Booking(bookingId, userId, resourceId, validTimeSlot);
            const booking2 = new Booking(new BookingId(), userId, 'different-resource', validTimeSlot);

            expect(booking1.isOverlapping(booking2)).toBe(false);
        });

        it('should not detect overlap for same booking', () => {
            const booking1 = new Booking(bookingId, userId, resourceId, validTimeSlot);

            expect(booking1.isOverlapping(booking1)).toBe(false);
        });
    });

    describe('isActive', () => {
        it('should return true for pending booking', () => {
            const booking = new Booking(bookingId, userId, resourceId, validTimeSlot);
            expect(booking.isActive()).toBe(true);
        });

        it('should return true for confirmed booking', () => {
            const booking = new Booking(bookingId, userId, resourceId, validTimeSlot);
            booking.confirm();
            expect(booking.isActive()).toBe(true);
        });

        it('should return false for cancelled booking', () => {
            const booking = new Booking(bookingId, userId, resourceId, validTimeSlot);
            booking.cancel();
            expect(booking.isActive()).toBe(false);
        });
    });
});
