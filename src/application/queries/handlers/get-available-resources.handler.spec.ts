import { Test, TestingModule } from '@nestjs/testing';
import { GetAvailableResourcesHandler } from './get-available-resources.handler';
import { GetAvailableResourcesQuery } from '../get-available-resources.query';
import { ResourceRepository } from '@/infrastructure/persistence/typeorm/resource.repository';
import { Resource } from '@/domain/entities/resource.entity';
import { ResourceType } from '@/domain/enums/resource-type.enum';
import { TimeSlot } from '@/domain/value-objects/time-slot.value-object';

describe('GetAvailableResourcesHandler', () => {
    let handler: GetAvailableResourcesHandler;
    let resourceRepository: jest.Mocked<ResourceRepository>;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureEndDate = new Date(futureDate);
    futureEndDate.setHours(futureEndDate.getHours() + 2);

    const validTimeSlot = new TimeSlot(futureDate, futureEndDate);

    const mockResources = [
        new Resource('resource-1', 'Room A', ResourceType.MEETING_ROOM, 10),
        new Resource('resource-2', 'Room B', ResourceType.MEETING_ROOM, 5),
        new Resource('resource-3', 'Room C', ResourceType.CONFERENCE_HALL, 20),
    ];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetAvailableResourcesHandler,
                {
                    provide: ResourceRepository,
                    useValue: {
                        findAvailable: jest.fn(),
                        findByType: jest.fn(),
                    },
                },
            ],
        }).compile();

        handler = module.get<GetAvailableResourcesHandler>(GetAvailableResourcesHandler);
        resourceRepository = module.get(ResourceRepository);
    });

    describe('execute', () => {
        it('should return all available resources when no type filter', async () => {
            const query = new GetAvailableResourcesQuery(
                futureDate.toISOString(),
                futureEndDate.toISOString()
            );
            resourceRepository.findAvailable.mockResolvedValue(mockResources);

            const result = await handler.execute(query);

            expect(resourceRepository.findAvailable).toHaveBeenCalledWith(validTimeSlot);
            expect(resourceRepository.findByType).not.toHaveBeenCalled();
            expect(result).toBe(mockResources);
            expect(result).toHaveLength(3);
        });

        it('should return filtered resources by type', async () => {
            const query = new GetAvailableResourcesQuery(
                futureDate.toISOString(),
                futureEndDate.toISOString(),
                ResourceType.MEETING_ROOM
            );
            const meetingRooms = mockResources.slice(0, 2);
            resourceRepository.findByType.mockResolvedValue(meetingRooms);

            // Mock isAvailable method for each resource
            meetingRooms.forEach(resource => {
                jest.spyOn(resource, 'isAvailable').mockReturnValue(true);
            });

            const result = await handler.execute(query);

            expect(resourceRepository.findByType).toHaveBeenCalledWith(ResourceType.MEETING_ROOM);
            expect(resourceRepository.findAvailable).not.toHaveBeenCalled();
            expect(result).toStrictEqual(meetingRooms);
            expect(result).toHaveLength(2);
        });

        it('should filter out unavailable resources by type', async () => {
            const query = new GetAvailableResourcesQuery(
                futureDate.toISOString(),
                futureEndDate.toISOString(),
                ResourceType.MEETING_ROOM
            );
            const meetingRooms = mockResources.slice(0, 2);
            resourceRepository.findByType.mockResolvedValue(meetingRooms);

            // Mock isAvailable method - first available, second unavailable
            jest.spyOn(meetingRooms[0], 'isAvailable').mockReturnValue(true);
            jest.spyOn(meetingRooms[1], 'isAvailable').mockReturnValue(false);

            const result = await handler.execute(query);

            expect(result).toHaveLength(1);
            expect(result[0]).toBe(meetingRooms[0]);
        });

        it('should return empty array when no resources available', async () => {
            const query = new GetAvailableResourcesQuery(
                futureDate.toISOString(),
                futureEndDate.toISOString()
            );
            resourceRepository.findAvailable.mockResolvedValue([]);

            const result = await handler.execute(query);

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('should return empty array when no resources of specified type', async () => {
            const query = new GetAvailableResourcesQuery(
                futureDate.toISOString(),
                futureEndDate.toISOString(),
                ResourceType.MEETING_ROOM
            );
            resourceRepository.findByType.mockResolvedValue([]);

            const result = await handler.execute(query);

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('should handle repository errors for findAvailable', async () => {
            const query = new GetAvailableResourcesQuery(
                futureDate.toISOString(),
                futureEndDate.toISOString()
            );
            resourceRepository.findAvailable.mockRejectedValue(new Error('Database error'));

            await expect(handler.execute(query)).rejects.toThrow('Database error');
        });

        it('should handle repository errors for findByType', async () => {
            const query = new GetAvailableResourcesQuery(
                futureDate.toISOString(),
                futureEndDate.toISOString(),
                ResourceType.MEETING_ROOM
            );
            resourceRepository.findByType.mockRejectedValue(new Error('Database error'));

            await expect(handler.execute(query)).rejects.toThrow('Database error');
        });

        it('should work with different resource types', async () => {
            // Test each resource type
            const resourceTypes = [
                ResourceType.MEETING_ROOM,
                ResourceType.CONFERENCE_HALL,
                ResourceType.HOTEL_ROOM,
                ResourceType.EVENT_TICKET
            ];

            for (const type of resourceTypes) {
                const query = new GetAvailableResourcesQuery(
                    futureDate.toISOString(),
                    futureEndDate.toISOString(),
                    type
                );
                const typeResources = [mockResources[0]];
                resourceRepository.findByType.mockResolvedValue(typeResources);
                jest.spyOn(typeResources[0], 'isAvailable').mockReturnValue(true);

                const result = await handler.execute(query);

                expect(resourceRepository.findByType).toHaveBeenCalledWith(type);
                expect(result).toStrictEqual(typeResources);
            }
        });

        it('should handle invalid time slot', async () => {
            const invalidQuery = new GetAvailableResourcesQuery(
                'invalid-date',
                'invalid-date'
            );
            resourceRepository.findAvailable.mockRejectedValue(new Error('Invalid date'));

            await expect(handler.execute(invalidQuery)).rejects.toThrow('Invalid date');
        });

        it('should handle past time slots', async () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);
            const pastEndDate = new Date(pastDate);
            pastEndDate.setHours(pastEndDate.getHours() + 2);

            const query = new GetAvailableResourcesQuery(
                pastDate.toISOString(),
                pastEndDate.toISOString()
            );
            resourceRepository.findAvailable.mockRejectedValue(new Error('Cannot book in the past'));

            await expect(handler.execute(query)).rejects.toThrow('Cannot book in the past');
        });

        it('should handle resources with different availability states', async () => {
            const query = new GetAvailableResourcesQuery(
                futureDate.toISOString(),
                futureEndDate.toISOString(),
                ResourceType.MEETING_ROOM
            );
            const resources = [
                new Resource('resource-1', 'Room A', ResourceType.MEETING_ROOM, 10),
                new Resource('resource-2', 'Room B', ResourceType.MEETING_ROOM, 5),
                new Resource('resource-3', 'Room C', ResourceType.MEETING_ROOM, 20),
            ];
            resourceRepository.findByType.mockResolvedValue(resources);

            // Mock availability - first and third available, second unavailable
            jest.spyOn(resources[0], 'isAvailable').mockReturnValue(true);
            jest.spyOn(resources[1], 'isAvailable').mockReturnValue(false);
            jest.spyOn(resources[2], 'isAvailable').mockReturnValue(true);

            const result = await handler.execute(query);

            expect(result).toHaveLength(2);
            expect(result[0]).toBe(resources[0]);
            expect(result[1]).toBe(resources[2]);
        });

        it('should handle inactive resources', async () => {
            const query = new GetAvailableResourcesQuery(
                futureDate.toISOString(),
                futureEndDate.toISOString(),
                ResourceType.MEETING_ROOM
            );
            const resources = [
                new Resource('resource-1', 'Room A', ResourceType.MEETING_ROOM, 10),
                new Resource('resource-2', 'Room B', ResourceType.MEETING_ROOM, 5),
            ];
            resources[1].isActive = false; // Make second resource inactive
            resourceRepository.findByType.mockResolvedValue(resources);

            // Mock availability - first available, second unavailable due to inactive status
            jest.spyOn(resources[0], 'isAvailable').mockReturnValue(true);
            jest.spyOn(resources[1], 'isAvailable').mockReturnValue(false);

            const result = await handler.execute(query);

            expect(result).toHaveLength(1);
            expect(result[0]).toBe(resources[0]);
        });
    });
});
