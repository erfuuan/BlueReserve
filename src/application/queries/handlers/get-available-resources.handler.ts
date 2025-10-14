import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAvailableResourcesQuery } from '../get-available-resources.query';
import { ResourceRepository } from '../../../infrastructure/persistence/typeorm/resource.repository';
import { TimeSlot } from '../../../domain/value-objects/time-slot.value-object';
import { ResourceType } from '../../../domain/enums/resource-type.enum';
import { Resource } from '../../../domain/entities/resource.entity';
import { PaginatedResponse } from '../../../shared/dto/pagination.dto';

@QueryHandler(GetAvailableResourcesQuery)
export class GetAvailableResourcesHandler implements IQueryHandler<GetAvailableResourcesQuery> {
    constructor(
        private readonly resourceRepository: ResourceRepository,
    ) { }

    async execute(query: GetAvailableResourcesQuery): Promise<Resource[] | PaginatedResponse<Resource>> {
        const { startTime, endTime, type, pagination } = query;

        const timeSlot = new TimeSlot(new Date(startTime), new Date(endTime));

        // If pagination is requested, return paginated results
        if (pagination) {
            if (type) {
                const resources = await this.resourceRepository.findByType(type as ResourceType);
                const availableResources = resources.filter(resource => resource.isAvailable(timeSlot));

                // Apply pagination to filtered results
                const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'ASC' } = pagination;
                const skip = (page - 1) * limit;
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
            return this.resourceRepository.findAvailableWithPagination(timeSlot, pagination);
        }

        // Return non-paginated results for backward compatibility
        if (type) {
            const resources = await this.resourceRepository.findByType(type as ResourceType);
            return resources.filter(resource => resource.isAvailable(timeSlot));
        }
        return this.resourceRepository.findAvailable(timeSlot);
    }
}