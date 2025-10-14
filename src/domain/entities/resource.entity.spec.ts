import { Resource } from './resource.entity';
import { ResourceType } from '../enums/resource-type.enum';
import { Booking } from './booking.entity';
import { BookingId } from '../value-objects/booking-id.value-object';
import { TimeSlot } from '../value-objects/time-slot.value-object';
import { BookingStatus } from '../enums/booking-status.enum';

describe('Resource Entity', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureEndDate = new Date(futureDate);
    futureEndDate.setHours(futureEndDate.getHours() + 2);

    const validTimeSlot = new TimeSlot(futureDate, futureEndDate);
    const userId = 'user-123';
    const resourceId = 'resource-456';

    describe('constructor', () => {
        it('should create a resource with all parameters', () => {
            const resource = new Resource(
                resourceId,
                'Conference Room A',
                ResourceType.MEETING_ROOM,
                10,
                'A large conference room',
                50.00,
                { hasProjector: true, hasWhiteboard: true }
            );

            expect(resource.id).toBe(resourceId);
            expect(resource.name).toBe('Conference Room A');
            expect(resource.type).toBe(ResourceType.MEETING_ROOM);
            expect(resource.capacity).toBe(10);
            expect(resource.description).toBe('A large conference room');
            expect(resource.pricePerHour).toBe(50.00);
            expect(resource.metadata).toEqual({ hasProjector: true, hasWhiteboard: true });
            expect(resource.isActive).toBe(true);
        });

        it('should create a resource with minimal parameters', () => {
            const resource = new Resource(
                resourceId,
                'Room B',
                ResourceType.MEETING_ROOM
            );

            expect(resource.id).toBe(resourceId);
            expect(resource.name).toBe('Room B');
            expect(resource.type).toBe(ResourceType.MEETING_ROOM);
            expect(resource.capacity).toBe(1); // Default capacity
            expect(resource.description).toBeUndefined();
            expect(resource.pricePerHour).toBeUndefined();
            expect(resource.metadata).toBeUndefined();
            expect(resource.isActive).toBe(true);
        });

        it('should create a resource with default capacity', () => {
            const resource = new Resource(
                resourceId,
                'Room C',
                ResourceType.MEETING_ROOM,
                5
            );

            expect(resource.capacity).toBe(5);
        });
    });

    describe('isAvailable', () => {
        let resource: Resource;

        beforeEach(() => {
            resource = new Resource(
                resourceId,
                'Test Room',
                ResourceType.MEETING_ROOM,
                2
            );
        });

        it('should return false when resource is inactive', () => {
            resource.isActive = false;

            const result = resource.isAvailable(validTimeSlot);

            expect(result).toBe(false);
        });

        it('should return true when no bookings exist', () => {
            resource.bookings = [];

            const result = resource.isAvailable(validTimeSlot);

            expect(result).toBe(true);
        });

        it('should return true when bookings is undefined', () => {
            resource.bookings = undefined;

            const result = resource.isAvailable(validTimeSlot);

            expect(result).toBe(true);
        });

        it('should return true when capacity is not exceeded', () => {
            const booking1 = new Booking(new BookingId(), userId, resourceId, validTimeSlot);
            const booking2 = new Booking(new BookingId(), userId, resourceId, validTimeSlot);
            booking2.cancel(); // Cancel one booking

            resource.bookings = [booking1, booking2];

            const result = resource.isAvailable(validTimeSlot);

            expect(result).toBe(true);
        });

        it('should return false when capacity is exceeded', () => {
            const booking1 = new Booking(new BookingId(), userId, resourceId, validTimeSlot);
            const booking2 = new Booking(new BookingId(), userId, resourceId, validTimeSlot);
            const booking3 = new Booking(new BookingId(), userId, resourceId, validTimeSlot);

            resource.bookings = [booking1, booking2, booking3];

            const result = resource.isAvailable(validTimeSlot);

            expect(result).toBe(false);
        });

        it('should ignore cancelled bookings when checking availability', () => {
            const booking1 = new Booking(new BookingId(), userId, resourceId, validTimeSlot);
            const booking2 = new Booking(new BookingId(), userId, resourceId, validTimeSlot);
            booking2.cancel(); // Cancel one booking

            resource.bookings = [booking1, booking2];

            const result = resource.isAvailable(validTimeSlot);

            expect(result).toBe(true);
        });

        it('should ignore non-overlapping bookings', () => {
            const nonOverlappingStart = new Date(futureDate);
            nonOverlappingStart.setHours(nonOverlappingStart.getHours() + 5); // 5 hours later
            const nonOverlappingEnd = new Date(nonOverlappingStart);
            nonOverlappingEnd.setHours(nonOverlappingEnd.getHours() + 2);
            const nonOverlappingTimeSlot = new TimeSlot(nonOverlappingStart, nonOverlappingEnd);

            const booking1 = new Booking(new BookingId(), userId, resourceId, validTimeSlot);
            const booking2 = new Booking(new BookingId(), userId, resourceId, nonOverlappingTimeSlot);

            resource.bookings = [booking1, booking2];

            const result = resource.isAvailable(validTimeSlot);

            expect(result).toBe(true);
        });

        it('should detect overlapping bookings correctly', () => {
            const overlappingStart = new Date(futureDate);
            overlappingStart.setHours(overlappingStart.getHours() + 1); // 1 hour later
            const overlappingEnd = new Date(overlappingStart);
            overlappingEnd.setHours(overlappingEnd.getHours() + 2);
            const overlappingTimeSlot = new TimeSlot(overlappingStart, overlappingEnd);

            const booking1 = new Booking(new BookingId(), userId, resourceId, validTimeSlot);
            const booking2 = new Booking(new BookingId(), userId, resourceId, overlappingTimeSlot);

            resource.bookings = [booking1, booking2];

            const result = resource.isAvailable(validTimeSlot);

            expect(result).toBe(false);
        });
    });

    describe('getAvailableCapacity', () => {
        let resource: Resource;

        beforeEach(() => {
            resource = new Resource(
                resourceId,
                'Test Room',
                ResourceType.MEETING_ROOM,
                3
            );
        });

        it('should return 0 when resource is inactive', () => {
            resource.isActive = false;

            const result = resource.getAvailableCapacity(validTimeSlot);

            expect(result).toBe(0);
        });

        it('should return full capacity when no bookings exist', () => {
            resource.bookings = [];

            const result = resource.getAvailableCapacity(validTimeSlot);

            expect(result).toBe(3);
        });

        it('should return full capacity when bookings is undefined', () => {
            resource.bookings = undefined;

            const result = resource.getAvailableCapacity(validTimeSlot);

            expect(result).toBe(3);
        });

        it('should return correct available capacity with active bookings', () => {
            const booking1 = new Booking(new BookingId(), userId, resourceId, validTimeSlot);
            const booking2 = new Booking(new BookingId(), userId, resourceId, validTimeSlot);

            resource.bookings = [booking1, booking2];

            const result = resource.getAvailableCapacity(validTimeSlot);

            expect(result).toBe(1); // 3 - 2 = 1
        });

        it('should ignore cancelled bookings when calculating capacity', () => {
            const booking1 = new Booking(new BookingId(), userId, resourceId, validTimeSlot);
            const booking2 = new Booking(new BookingId(), userId, resourceId, validTimeSlot);
            booking2.cancel(); // Cancel one booking

            resource.bookings = [booking1, booking2];

            const result = resource.getAvailableCapacity(validTimeSlot);

            expect(result).toBe(2); // 3 - 1 = 2
        });

        it('should return 0 when capacity is fully utilized', () => {
            const booking1 = new Booking(new BookingId(), userId, resourceId, validTimeSlot);
            const booking2 = new Booking(new BookingId(), userId, resourceId, validTimeSlot);
            const booking3 = new Booking(new BookingId(), userId, resourceId, validTimeSlot);

            resource.bookings = [booking1, booking2, booking3];

            const result = resource.getAvailableCapacity(validTimeSlot);

            expect(result).toBe(0);
        });

        it('should return 0 when capacity is exceeded', () => {
            const booking1 = new Booking(new BookingId(), userId, resourceId, validTimeSlot);
            const booking2 = new Booking(new BookingId(), userId, resourceId, validTimeSlot);
            const booking3 = new Booking(new BookingId(), userId, resourceId, validTimeSlot);
            const booking4 = new Booking(new BookingId(), userId, resourceId, validTimeSlot);

            resource.bookings = [booking1, booking2, booking3, booking4];

            const result = resource.getAvailableCapacity(validTimeSlot);

            expect(result).toBe(0); // Math.max(0, 3 - 4) = 0
        });

        it('should ignore non-overlapping bookings', () => {
            const nonOverlappingStart = new Date(futureDate);
            nonOverlappingStart.setHours(nonOverlappingStart.getHours() + 5);
            const nonOverlappingEnd = new Date(nonOverlappingStart);
            nonOverlappingEnd.setHours(nonOverlappingEnd.getHours() + 2);
            const nonOverlappingTimeSlot = new TimeSlot(nonOverlappingStart, nonOverlappingEnd);

            const booking1 = new Booking(new BookingId(), userId, resourceId, validTimeSlot);
            const booking2 = new Booking(new BookingId(), userId, resourceId, nonOverlappingTimeSlot);

            resource.bookings = [booking1, booking2];

            const result = resource.getAvailableCapacity(validTimeSlot);

            expect(result).toBe(2); // 3 - 1 = 2 (only booking1 overlaps)
        });
    });

    describe('edge cases', () => {
        it('should handle resource with capacity 0', () => {
            const resource = new Resource(
                resourceId,
                'Maintenance Room',
                ResourceType.MEETING_ROOM,
                0
            );

            expect(resource.isAvailable(validTimeSlot)).toBe(false);
            expect(resource.getAvailableCapacity(validTimeSlot)).toBe(0);
        });

        it('should handle resource with very large capacity', () => {
            const resource = new Resource(
                resourceId,
                'Stadium',
                ResourceType.MEETING_ROOM,
                10000
            );

            expect(resource.isAvailable(validTimeSlot)).toBe(true);
            expect(resource.getAvailableCapacity(validTimeSlot)).toBe(10000);
        });

        it('should handle time slot with same start and end time', () => {
            // This test is not applicable since TimeSlot validation prevents same start/end time
            // Instead, test with a very short duration
            const startTime = new Date(futureDate);
            const endTime = new Date(startTime);
            endTime.setSeconds(endTime.getSeconds() + 1);
            const shortTimeSlot = new TimeSlot(startTime, endTime);

            const resource = new Resource(
                resourceId,
                'Test Room',
                ResourceType.MEETING_ROOM,
                1
            );

            expect(resource.isAvailable(shortTimeSlot)).toBe(true);
            expect(resource.getAvailableCapacity(shortTimeSlot)).toBe(1);
        });
    });
});
