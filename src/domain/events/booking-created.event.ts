export class BookingCreatedEvent {
    constructor(
        public readonly bookingId: string,
        public readonly userId: string,
        public readonly resourceId: string,
        public readonly startTime: Date,
        public readonly endTime: Date,
        public readonly createdAt: Date
    ) { }
}
