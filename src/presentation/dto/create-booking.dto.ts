import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBookingDto {
    @ApiProperty({ description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsNotEmpty()
    @IsUUID()
    userId: string;

    @ApiProperty({ description: 'Resource ID', example: '123e4567-e89b-12d3-a456-426614174001' })
    @IsNotEmpty()
    @IsUUID()
    resourceId: string;

    @ApiProperty({ description: 'Start time (ISO string)', example: '2024-01-15T10:00:00.000Z' })
    @IsNotEmpty()
    @IsDateString()
    startTime: string;

    @ApiProperty({ description: 'End time (ISO string)', example: '2024-01-15T12:00:00.000Z' })
    @IsNotEmpty()
    @IsDateString()
    endTime: string;

    @ApiProperty({ description: 'Optional notes', example: 'Meeting room for team standup', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}
