import { ApiProperty } from '@nestjs/swagger';
import { Resource } from '../../domain/entities/resource.entity';
import { ResourceType } from '../../domain/enums/resource-type.enum';

export class ResourceResponseDto {
    @ApiProperty({ description: 'Resource ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;

    @ApiProperty({ description: 'Resource name', example: 'Conference Room A' })
    name: string;

    @ApiProperty({ description: 'Resource description', example: 'Large conference room with projector', required: false })
    description?: string;

    @ApiProperty({ description: 'Resource type', enum: ResourceType, example: ResourceType.MEETING_ROOM })
    type: ResourceType;

    @ApiProperty({ description: 'Resource capacity', example: 10 })
    capacity: number;

    @ApiProperty({ description: 'Price per hour', example: 50.00, required: false })
    pricePerHour?: number;

    @ApiProperty({ description: 'Additional metadata', required: false })
    metadata?: Record<string, any>;

    @ApiProperty({ description: 'Is resource active', example: true })
    isActive: boolean;

    @ApiProperty({ description: 'Creation timestamp', example: '2024-01-15T09:00:00.000Z' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update timestamp', example: '2024-01-15T09:30:00.000Z' })
    updatedAt: Date;

    static fromEntity(resource: Resource): ResourceResponseDto {
        const dto = new ResourceResponseDto();
        dto.id = resource.id;
        dto.name = resource.name;
        dto.description = resource.description;
        dto.type = resource.type;
        dto.capacity = resource.capacity;
        dto.pricePerHour = resource.pricePerHour;
        dto.metadata = resource.metadata;
        dto.isActive = resource.isActive;
        dto.createdAt = resource.createdAt;
        dto.updatedAt = resource.updatedAt;
        return dto;
    }
}
