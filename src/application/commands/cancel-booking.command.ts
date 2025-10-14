import { IsNotEmpty, IsUUID, IsOptional, IsString } from 'class-validator';

export class CancelBookingCommand {
    @IsNotEmpty()
    @IsUUID()
    bookingId: string;

    @IsOptional()
    @IsString()
    reason?: string;

    constructor(bookingId: string, reason?: string) {
        this.bookingId = bookingId;
        this.reason = reason;
    }
}
