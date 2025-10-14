export class BookingCancelledEvent {
    constructor(
        public readonly bookingId: string,
        public readonly userId: string,
        public readonly resourceId: string,
        public readonly cancelledAt: Date,
        public readonly reason?: string
    ) { }
}
