import { IsNotEmpty, IsUUID } from 'class-validator';

export class ConfirmBookingCommand {
    @IsNotEmpty()
    @IsUUID()
    bookingId: string;

    constructor(bookingId: string) {
        this.bookingId = bookingId;
    }
}
