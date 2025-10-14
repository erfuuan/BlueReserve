import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceRepository as IResourceRepository } from '@/domain/repositories/resource.repository.interface';
import { Resource } from '../../../domain/entities/resource.entity';
import { ResourceType } from '../../../domain/enums/resource-type.enum';
import { TimeSlot } from '../../../domain/value-objects/time-slot.value-object';
import { PaginationDto, PaginatedResponse } from '../../../shared/dto/pagination.dto';

@Injectable()
export class ResourceRepository implements IResourceRepository {
    constructor(
        @InjectRepository(Resource)
        private readonly repository: Repository<Resource>,
    ) { }

    async save(resource: Resource): Promise<Resource> {
        return this.repository.save(resource);
    }

    async findById(id: string): Promise<Resource | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['bookings'],
        });
    }

    async findByType(type: ResourceType): Promise<Resource[]> {
        return this.repository.find({
            where: { type, isActive: true },
            relations: ['bookings'],
            order: { name: 'ASC' },
        });
    }

    async findByTypeWithPagination(
        type: ResourceType,
        pagination: PaginationDto
    ): Promise<PaginatedResponse<Resource>> {
        const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'ASC' } = pagination;
        const skip = (page - 1) * limit;

        const [data, total] = await this.repository.findAndCount({
            where: { type, isActive: true },
            relations: ['bookings'],
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

    async findAvailable(timeSlot: TimeSlot): Promise<Resource[]> {
        const resources = await this.repository.find({
            where: { isActive: true },
            relations: ['bookings'],
        });

        return resources.filter(resource => resource.isAvailable(timeSlot));
    }

    async findAvailableWithPagination(
        timeSlot: TimeSlot,
        pagination: PaginationDto
    ): Promise<PaginatedResponse<Resource>> {
        const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'ASC' } = pagination;
        const skip = (page - 1) * limit;

        // First get all active resources
        const allResources = await this.repository.find({
            where: { isActive: true },
            relations: ['bookings'],
        });

        // Filter available resources
        const availableResources = allResources.filter(resource => resource.isAvailable(timeSlot));

        // Apply pagination to filtered results
        const total = availableResources.length;
        const paginatedData = availableResources
            .sort((a, b) => {
                const aValue = a[sortBy as keyof Resource];
                const bValue = b[sortBy as keyof Resource];
                if (sortOrder === 'ASC') {
                    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
                } else {
                    return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
                }
            })
            .slice(skip, skip + limit);

        return {
            data: paginatedData,
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

    async findAll(): Promise<Resource[]> {
        return this.repository.find({
            relations: ['bookings'],
            order: { name: 'ASC' },
        });
    }

    async findActive(): Promise<Resource[]> {
        return this.repository.find({
            where: { isActive: true },
            relations: ['bookings'],
            order: { name: 'ASC' },
        });
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }
}