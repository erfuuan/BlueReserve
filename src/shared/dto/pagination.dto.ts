import { IsOptional, IsEnum, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
    @ApiPropertyOptional({
        description: 'Page number (starts from 1)',
        minimum: 1,
        default: 1,
        example: 1
    })
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @Transform(({ value }) => parseInt(value) || 1)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        minimum: 1,
        maximum: 100,
        default: 10,
        example: 10
    })
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    @Transform(({ value }) => parseInt(value) || 10)
    limit?: number = 10;

    @ApiPropertyOptional({
        description: 'Field to sort by',
        example: 'createdAt'
    })
    @IsOptional()
    sortBy?: string;

    @ApiPropertyOptional({
        description: 'Sort order',
        enum: ['ASC', 'DESC'],
        default: 'DESC',
        example: 'DESC'
    })
    @IsOptional()
    @IsEnum(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}

export function createPaginationMeta(
    page: number,
    limit: number,
    total: number
): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
}
