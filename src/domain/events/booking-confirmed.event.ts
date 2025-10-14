export class BookingConfirmedEvent {
    constructor(
        public readonly bookingId: string,
        public readonly userId: string,
        public readonly resourceId: string,
        public readonly confirmedAt: Date
    ) { }
}
