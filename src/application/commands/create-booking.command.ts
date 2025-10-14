import { IsNotEmpty, IsUUID, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateBookingCommand {
    @IsNotEmpty()
    @IsUUID()
    userId: string;

    @IsNotEmpty()
    @IsUUID()
    resourceId: string;

    @IsNotEmpty()
    @IsDateString()
    startTime: string;

    @IsNotEmpty()
    @IsDateString()
    endTime: string;

    @IsOptional()
    @IsString()
    notes?: string;

    constructor(
        userId: string,
        resourceId: string,
        startTime: string,
        endTime: string,
        notes?: string
    ) {
        this.userId = userId;
        this.resourceId = resourceId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.notes = notes;
    }
}
