import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetBookingQuery {
    @IsNotEmpty()
    @IsUUID()
    bookingId: string;

    constructor(bookingId: string) {
        this.bookingId = bookingId;
    }
}
