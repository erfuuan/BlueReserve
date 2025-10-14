import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelBookingDto {
    @ApiProperty({ description: 'Reason for cancellation', example: 'Change of plans', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    reason?: string;
}
