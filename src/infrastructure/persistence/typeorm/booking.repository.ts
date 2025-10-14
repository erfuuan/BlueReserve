import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingRepository as IBookingRepository } from '@/domain/repositories/booking.repository.interface';
import { Booking } from '../../../domain/entities/booking.entity';
import { BookingId } from '../../../domain/value-objects/booking-id.value-object';
import { TimeSlot } from '../../../domain/value-objects/time-slot.value-object';
import { BookingStatus } from '../../../domain/enums/booking-status.enum';
import { PaginationDto, PaginatedResponse } from '../../../shared/dto/pagination.dto';

@Injectable()
export class BookingRepository implements IBookingRepository {
    constructor(
        @InjectRepository(Booking)
        private readonly repository: Repository<Booking>,
    ) { }

    async save(booking: Booking): Promise<Booking> {
        return this.repository.save(booking);
    }

    async findById(id: BookingId): Promise<Booking | null> {
        return this.repository.findOne({
            where: { id: id.toString() },
            relations: ['user', 'resource'],
        });
    }

    async findByUserId(userId: string): Promise<Booking[]> {
        return this.repository.find({
            where: { userId },
            relations: ['user', 'resource'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByUserIdWithPagination(
        userId: string,
        pagination: PaginationDto
    ): Promise<PaginatedResponse<Booking>> {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
        const skip = (page - 1) * limit;

        const [data, total] = await this.repository.findAndCount({
            where: { userId },
            relations: ['user', 'resource'],
            order: { [sortBy]: sortOrder },
            skip,
            take: limit,
        });

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1,
            },
        };
    }

    async findByUserIdAndStatusWithPagination(
        userId: string,
        status: string,
        pagination: PaginationDto
    ): Promise<PaginatedResponse<Booking>> {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
        const skip = (page - 1) * limit;

        const [data, total] = await this.repository.findAndCount({
            where: { userId, status: status as BookingStatus },
            relations: ['user', 'resource'],
            order: { [sortBy]: sortOrder },
            skip,
            take: limit,
        });

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1,
            },
        };
    }

    async findByResourceId(resourceId: string): Promise<Booking[]> {
        return this.repository.find({
            where: { resourceId },
            relations: ['user', 'resource'],
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Finds bookings that overlap with the given time slot for a specific resource.
     * Uses interval overlap logic: two intervals overlap if start1 < end2 AND end1 > start2
     */
    async findOverlappingBookings(resourceId: string, timeSlot: TimeSlot): Promise<Booking[]> {
        return this.repository
            .createQueryBuilder('booking')
            .where('booking.resourceId = :resourceId', { resourceId })
            .andWhere('booking.status != :cancelledStatus', { cancelledStatus: 'cancelled' })
            .andWhere(
                '(booking.startTime < :endTime AND booking.endTime > :startTime)',
                {
                    startTime: timeSlot.startTime,
                    endTime: timeSlot.endTime,
                }
            )
            .getMany();
    }

    async delete(id: BookingId): Promise<void> {
        await this.repository.delete(id.toString());
    }

    async findAll(): Promise<Booking[]> {
        return this.repository.find({
            relations: ['user', 'resource'],
            order: { createdAt: 'DESC' },
        });
    }

    async findActiveBookings(): Promise<Booking[]> {
        return this.repository.find({
            where: [
                { status: BookingStatus.PENDING },
                { status: BookingStatus.CONFIRMED },
            ],
            relations: ['user', 'resource'],
            order: { createdAt: 'DESC' },
        });
    }

    async findBookingsByStatus(status: string): Promise<Booking[]> {
        return this.repository.find({
            where: { status: status as BookingStatus },
            relations: ['user', 'resource'],
            order: { createdAt: 'DESC' },
        });
    }
}