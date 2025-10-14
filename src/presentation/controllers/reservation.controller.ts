import {
    Controller,
    Post,
    Get,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateBookingCommand } from '../../application/commands/create-booking.command';
import { ConfirmBookingCommand } from '../../application/commands/confirm-booking.command';
import { CancelBookingCommand } from '../../application/commands/cancel-booking.command';
import { GetBookingQuery } from '../../application/queries/get-booking.query';
import { GetUserBookingsQuery } from '../../application/queries/get-user-bookings.query';
import { GetAvailableResourcesQuery } from '../../application/queries/get-available-resources.query';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { ConfirmBookingDto } from '../dto/confirm-booking.dto';
import { CancelBookingDto } from '../dto/cancel-booking.dto';
import { BookingResponseDto } from '../dto/booking-response.dto';
import { ResourceResponseDto } from '../dto/resource-response.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { PaginatedResponse } from '../../shared/dto/pagination.dto';

@ApiTags('reservations')
@Controller('reservations')
export class ReservationController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a new reservation' })
    @ApiResponse({ status: 201, description: 'Reservation created successfully', type: BookingResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'User or resource not found' })
    @ApiResponse({ status: 409, description: 'Resource not available for the requested time slot' })
    async createReservation(@Body() createBookingDto: CreateBookingDto): Promise<BookingResponseDto> {
        const command = new CreateBookingCommand(
            createBookingDto.userId,
            createBookingDto.resourceId,
            createBookingDto.startTime,
            createBookingDto.endTime,
            createBookingDto.notes,
        );

        const booking = await this.commandBus.execute(command);
        return BookingResponseDto.fromEntity(booking);
    }

    @Get('available-resources')
    @ApiOperation({ summary: 'Get available resources for a time slot' })
    @ApiQuery({ name: 'startTime', description: 'Start time (ISO string)' })
    @ApiQuery({ name: 'endTime', description: 'End time (ISO string)' })
    @ApiQuery({ name: 'type', description: 'Resource type filter', required: false })
    @ApiQuery({ name: 'page', description: 'Page number', required: false, type: Number })
    @ApiQuery({ name: 'limit', description: 'Items per page', required: false, type: Number })
    @ApiQuery({ name: 'sortBy', description: 'Field to sort by', required: false })
    @ApiQuery({ name: 'sortOrder', description: 'Sort order (ASC/DESC)', required: false })
    @ApiResponse({
        status: 200,
        description: 'Available resources retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/ResourceResponseDto' }
                },
                pagination: {
                    type: 'object',
                    properties: {
                        page: { type: 'number' },
                        limit: { type: 'number' },
                        total: { type: 'number' },
                        totalPages: { type: 'number' },
                        hasNext: { type: 'boolean' },
                        hasPrev: { type: 'boolean' }
                    }
                }
            }
        }
    })
    async getAvailableResources(
        @Query('startTime') startTime: string,
        @Query('endTime') endTime: string,
        @Query('type') type?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('sortBy') sortBy?: string,
        @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    ): Promise<ResourceResponseDto[] | PaginatedResponse<ResourceResponseDto>> {
        const pagination: PaginationDto | undefined = (page || limit || sortBy || sortOrder) ? {
            page: page || 1,
            limit: limit || 10,
            sortBy: sortBy || 'name',
            sortOrder: sortOrder || 'ASC'
        } : undefined;

        const query = new GetAvailableResourcesQuery(startTime, endTime, type, pagination);
        const result = await this.queryBus.execute(query);

        if (pagination && 'data' in result) {
            return {
                data: result.data.map(resource => ResourceResponseDto.fromEntity(resource)),
                pagination: result.pagination
            };
        }

        return (result as any[]).map(resource => ResourceResponseDto.fromEntity(resource));
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get reservation by ID' })
    @ApiParam({ name: 'id', description: 'Reservation ID' })
    @ApiResponse({ status: 200, description: 'Reservation retrieved successfully', type: BookingResponseDto })
    @ApiResponse({ status: 404, description: 'Reservation not found' })
    async getReservation(@Param('id') id: string): Promise<BookingResponseDto> {
        const query = new GetBookingQuery(id);
        const booking = await this.queryBus.execute(query);
        return BookingResponseDto.fromEntity(booking);
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get reservations by user ID' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiQuery({ name: 'status', description: 'Filter by reservation status', required: false })
    @ApiQuery({ name: 'page', description: 'Page number', required: false, type: Number })
    @ApiQuery({ name: 'limit', description: 'Items per page', required: false, type: Number })
    @ApiQuery({ name: 'sortBy', description: 'Field to sort by', required: false })
    @ApiQuery({ name: 'sortOrder', description: 'Sort order (ASC/DESC)', required: false })
    @ApiResponse({
        status: 200,
        description: 'User reservations retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/BookingResponseDto' }
                },
                pagination: {
                    type: 'object',
                    properties: {
                        page: { type: 'number' },
                        limit: { type: 'number' },
                        total: { type: 'number' },
                        totalPages: { type: 'number' },
                        hasNext: { type: 'boolean' },
                        hasPrev: { type: 'boolean' }
                    }
                }
            }
        }
    })
    async getUserReservations(
        @Param('userId') userId: string,
        @Query('status') status?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('sortBy') sortBy?: string,
        @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    ): Promise<BookingResponseDto[] | PaginatedResponse<BookingResponseDto>> {
        const pagination: PaginationDto | undefined = (page || limit || sortBy || sortOrder) ? {
            page: page || 1,
            limit: limit || 10,
            sortBy: sortBy || 'createdAt',
            sortOrder: sortOrder || 'DESC'
        } : undefined;

        const query = new GetUserBookingsQuery(userId, status, pagination);
        const result = await this.queryBus.execute(query);

        if (pagination && 'data' in result) {
            return {
                data: result.data.map(booking => BookingResponseDto.fromEntity(booking)),
                pagination: result.pagination
            };
        }

        return (result as any[]).map(booking => BookingResponseDto.fromEntity(booking));
    }

    @Put(':id/confirm')
    @ApiOperation({ summary: 'Confirm a reservation' })
    @ApiParam({ name: 'id', description: 'Reservation ID' })
    @ApiResponse({ status: 200, description: 'Reservation confirmed successfully', type: BookingResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Reservation not found' })
    async confirmReservation(@Param('id') id: string): Promise<BookingResponseDto> {
        const command = new ConfirmBookingCommand(id);
        const booking = await this.commandBus.execute(command);
        return BookingResponseDto.fromEntity(booking);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Cancel a reservation' })
    @ApiParam({ name: 'id', description: 'Reservation ID' })
    @ApiResponse({ status: 200, description: 'Reservation cancelled successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Reservation not found' })
    async cancelReservation(
        @Param('id') id: string,
        @Body() cancelBookingDto: CancelBookingDto,
    ): Promise<void> {
        const command = new CancelBookingCommand(id, cancelBookingDto.reason);
        await this.commandBus.execute(command);
    }
}