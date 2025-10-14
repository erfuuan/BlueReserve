import { ApiProperty } from '@nestjs/swagger';
import { Booking } from '../../domain/entities/booking.entity';
import { BookingStatus } from '../../domain/enums/booking-status.enum';

export class BookingResponseDto {
    @ApiProperty({ description: 'Booking ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;

    @ApiProperty({ description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174001' })
    userId: string;

    @ApiProperty({ description: 'Resource ID', example: '123e4567-e89b-12d3-a456-426614174002' })
    resourceId: string;

    @ApiProperty({ description: 'Start time', example: '2024-01-15T10:00:00.000Z' })
    startTime: Date;

    @ApiProperty({ description: 'End time', example: '2024-01-15T12:00:00.000Z' })
    endTime: Date;

    @ApiProperty({ description: 'Booking status', enum: BookingStatus, example: BookingStatus.PENDING })
    status: BookingStatus;

    @ApiProperty({ description: 'Optional notes', example: 'Meeting room for team standup', required: false })
    notes?: string;

    @ApiProperty({ description: 'Creation timestamp', example: '2024-01-15T09:00:00.000Z' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update timestamp', example: '2024-01-15T09:30:00.000Z' })
    updatedAt: Date;

    @ApiProperty({ description: 'User information', required: false })
    user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };

    @ApiProperty({ description: 'Resource information', required: false })
    resource?: {
        id: string;
        name: string;
        type: string;
        capacity: number;
    };

    static fromEntity(booking: Booking): BookingResponseDto {
        const dto = new BookingResponseDto();
        dto.id = booking.id;
        dto.userId = booking.userId;
        dto.resourceId = booking.resourceId;
        dto.startTime = booking.startTime;
        dto.endTime = booking.endTime;
        dto.status = booking.status;
        dto.notes = booking.notes;
        dto.createdAt = booking.createdAt;
        dto.updatedAt = booking.updatedAt;

        if (booking.user) {
            dto.user = {
                id: booking.user.id,
                email: booking.user.email,
                firstName: booking.user.firstName,
                lastName: booking.user.lastName,
            };
        }

        if (booking.resource) {
            dto.resource = {
                id: booking.resource.id,
                name: booking.resource.name,
                type: booking.resource.type,
                capacity: booking.resource.capacity,
            };
        }

        return dto;
    }
}
