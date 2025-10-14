import { IsNotEmpty, IsDateString, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../shared/dto/pagination.dto';

export class GetAvailableResourcesQuery {
    @IsNotEmpty()
    @IsDateString()
    startTime: string;

    @IsNotEmpty()
    @IsDateString()
    endTime: string;

    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    pagination?: PaginationDto;

    constructor(startTime: string, endTime: string, type?: string, pagination?: PaginationDto) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.type = type;
        this.pagination = pagination;
    }
}
