import { IsNotEmpty, IsUUID, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../shared/dto/pagination.dto';

export class GetUserBookingsQuery {
    @IsNotEmpty()
    @IsUUID()
    userId: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    pagination?: PaginationDto;

    constructor(userId: string, status?: string, pagination?: PaginationDto) {
        this.userId = userId;
        this.status = status;
        this.pagination = pagination;
    }
}
