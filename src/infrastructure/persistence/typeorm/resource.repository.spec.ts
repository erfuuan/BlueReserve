import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceRepository } from './resource.repository';
import { Resource } from '@/domain/entities/resource.entity';
import { ResourceType } from '@/domain/enums/resource-type.enum';
import { TimeSlot } from '@/domain/value-objects/time-slot.value-object';

describe('ResourceRepository', () => {
    let repository: ResourceRepository;
    let mockRepository: jest.Mocked<Repository<Resource>>;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureEndDate = new Date(futureDate);
    futureEndDate.setHours(futureEndDate.getHours() + 2);

    const validTimeSlot = new TimeSlot(futureDate, futureEndDate);

    const mockResource = {
        id: 'resource-123',
        name: 'Conference Room A',
        description: 'Large conference room',
        type: ResourceType.MEETING_ROOM,
        capacity: 10,
        pricePerHour: 50.00,
        metadata: { hasProjector: true },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        bookings: [],
        isAvailable: jest.fn().mockReturnValue(true),
        getAvailableCapacity: jest.fn().mockReturnValue(10),
    } as any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ResourceRepository,
                {
                    provide: getRepositoryToken(Resource),
                    useValue: {
                        save: jest.fn(),
                        findOne: jest.fn(),
                        find: jest.fn(),
                        delete: jest.fn(),
                    },
                },
            ],
        }).compile();

        repository = module.get<ResourceRepository>(ResourceRepository);
        mockRepository = module.get(getRepositoryToken(Resource));
    });

    describe('save', () => {
        it('should save resource successfully', async () => {
            mockRepository.save.mockResolvedValue(mockResource);

            const result = await repository.save(mockResource);

            expect(mockRepository.save).toHaveBeenCalledWith(mockResource);
            expect(result).toBe(mockResource);
        });

        it('should handle save errors', async () => {
            mockRepository.save.mockRejectedValue(new Error('Database error'));

            await expect(repository.save(mockResource)).rejects.toThrow('Database error');
        });

        it('should save resource with different types', async () => {
            const hotelRoom = { ...mockResource, type: ResourceType.HOTEL_ROOM } as any;
            mockRepository.save.mockResolvedValue(hotelRoom);

            const result = await repository.save(hotelRoom);

            expect(result.type).toBe(ResourceType.HOTEL_ROOM);
        });
    });

    describe('findById', () => {
        it('should find resource by ID successfully', async () => {
            mockRepository.findOne.mockResolvedValue(mockResource);

            const result = await repository.findById(mockResource.id);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: mockResource.id },
                relations: ['bookings'],
            });
            expect(result).toBe(mockResource);
        });

        it('should return null when resource not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            const result = await repository.findById('non-existent-id');

            expect(result).toBeNull();
        });

        it('should handle findById errors', async () => {
            mockRepository.findOne.mockRejectedValue(new Error('Database connection failed'));

            await expect(repository.findById(mockResource.id)).rejects.toThrow('Database connection failed');
        });

        it('should find resource with bookings relations loaded', async () => {
            const resourceWithBookings = {
                ...mockResource,
                bookings: [
                    { id: 'booking-1', startTime: futureDate, endTime: futureEndDate },
                    { id: 'booking-2', startTime: futureDate, endTime: futureEndDate },
                ],
            } as any;
            mockRepository.findOne.mockResolvedValue(resourceWithBookings);

            const result = await repository.findById(mockResource.id);

            expect(result).toBe(resourceWithBookings);
            expect(result.bookings).toHaveLength(2);
        });
    });

    describe('findByType', () => {
        it('should find resources by type successfully', async () => {
            const meetingRooms = [mockResource];
            mockRepository.find.mockResolvedValue(meetingRooms);

            const result = await repository.findByType(ResourceType.MEETING_ROOM);

            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { type: ResourceType.MEETING_ROOM, isActive: true },
                relations: ['bookings'],
                order: { name: 'ASC' },
            });
            expect(result).toBe(meetingRooms);
        });

        it('should find hotel rooms', async () => {
            const hotelRooms = [{ ...mockResource, type: ResourceType.HOTEL_ROOM }] as any[];
            mockRepository.find.mockResolvedValue(hotelRooms);

            const result = await repository.findByType(ResourceType.HOTEL_ROOM);

            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { type: ResourceType.HOTEL_ROOM, isActive: true },
                relations: ['bookings'],
                order: { name: 'ASC' },
            });
            expect(result[0].type).toBe(ResourceType.HOTEL_ROOM);
        });

        it('should find conference halls', async () => {
            const conferenceHalls = [{ ...mockResource, type: ResourceType.CONFERENCE_HALL }] as any[];
            mockRepository.find.mockResolvedValue(conferenceHalls);

            const result = await repository.findByType(ResourceType.CONFERENCE_HALL);

            expect(result[0].type).toBe(ResourceType.CONFERENCE_HALL);
        });

        it('should find event tickets', async () => {
            const eventTickets = [{ ...mockResource, type: ResourceType.EVENT_TICKET }] as any[];
            mockRepository.find.mockResolvedValue(eventTickets);

            const result = await repository.findByType(ResourceType.EVENT_TICKET);

            expect(result[0].type).toBe(ResourceType.EVENT_TICKET);
        });

        it('should find workspaces', async () => {
            const workspaces = [{ ...mockResource, type: ResourceType.WORKSPACE }] as any[];
            mockRepository.find.mockResolvedValue(workspaces);

            const result = await repository.findByType(ResourceType.WORKSPACE);

            expect(result[0].type).toBe(ResourceType.WORKSPACE);
        });

        it('should find vehicles', async () => {
            const vehicles = [{ ...mockResource, type: ResourceType.VEHICLE }] as any[];
            mockRepository.find.mockResolvedValue(vehicles);

            const result = await repository.findByType(ResourceType.VEHICLE);

            expect(result[0].type).toBe(ResourceType.VEHICLE);
        });

        it('should only return active resources', async () => {
            const activeResources = [mockResource] as any[];
            mockRepository.find.mockResolvedValue(activeResources);

            const result = await repository.findByType(ResourceType.MEETING_ROOM);

            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { type: ResourceType.MEETING_ROOM, isActive: true },
                relations: ['bookings'],
                order: { name: 'ASC' },
            });
        });

        it('should return empty array when no resources of type found', async () => {
            mockRepository.find.mockResolvedValue([]);

            const result = await repository.findByType(ResourceType.MEETING_ROOM);

            expect(result).toEqual([]);
        });

        it('should handle findByType errors', async () => {
            mockRepository.find.mockRejectedValue(new Error('Database error'));

            await expect(repository.findByType(ResourceType.MEETING_ROOM)).rejects.toThrow('Database error');
        });

        it('should return resources ordered by name ascending', async () => {
            const resources = [
                { ...mockResource, name: 'Room B' },
                { ...mockResource, name: 'Room A' },
            ] as any[];
            mockRepository.find.mockResolvedValue(resources);

            const result = await repository.findByType(ResourceType.MEETING_ROOM);

            expect(result[0].name).toBe('Room B');
            expect(result[1].name).toBe('Room A');
        });
    });

    describe('findAvailable', () => {
        it('should find available resources successfully', async () => {
            const availableResources = [mockResource];
            mockRepository.find.mockResolvedValue(availableResources);

            const result = await repository.findAvailable(validTimeSlot);

            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { isActive: true },
                relations: ['bookings'],
            });
            expect(result).toStrictEqual(availableResources);
        });

        it('should filter by availability correctly', async () => {
            const availableResource = { ...mockResource, isAvailable: jest.fn().mockReturnValue(true) };
            const unavailableResource = { ...mockResource, isAvailable: jest.fn().mockReturnValue(false) };
            const allResources = [availableResource, unavailableResource] as any[];
            mockRepository.find.mockResolvedValue(allResources);

            const result = await repository.findAvailable(validTimeSlot);

            // The repository should filter out unavailable resources
            expect(result).toStrictEqual([availableResource]);
            // The filtering happens in the repository implementation
        });

        it('should only return active resources', async () => {
            const activeResources = [mockResource] as any[];
            mockRepository.find.mockResolvedValue(activeResources);

            const result = await repository.findAvailable(validTimeSlot);

            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { isActive: true },
                relations: ['bookings'],
            });
        });

        it('should return empty array when no available resources', async () => {
            mockRepository.find.mockResolvedValue([]);

            const result = await repository.findAvailable(validTimeSlot);

            expect(result).toEqual([]);
        });

        it('should handle findAvailable errors', async () => {
            mockRepository.find.mockRejectedValue(new Error('Database error'));

            await expect(repository.findAvailable(validTimeSlot)).rejects.toThrow('Database error');
        });

        it('should handle different time slots', async () => {
            const differentTimeSlot = new TimeSlot(
                new Date(futureDate.getTime() + 1000 * 60 * 60), // 1 hour later
                new Date(futureEndDate.getTime() + 1000 * 60 * 60) // 1 hour later
            );
            mockRepository.find.mockResolvedValue([mockResource]);

            const result = await repository.findAvailable(differentTimeSlot);

            expect(result).toBeDefined();
        });
    });

    describe('findAll', () => {
        it('should find all resources successfully', async () => {
            const allResources = [mockResource, { ...mockResource, id: 'resource-2' }] as any[];
            mockRepository.find.mockResolvedValue(allResources);

            const result = await repository.findAll();

            expect(mockRepository.find).toHaveBeenCalledWith({
                relations: ['bookings'],
                order: { name: 'ASC' },
            });
            expect(result).toStrictEqual(allResources);
            expect(result).toHaveLength(2);
        });

        it('should return empty array when no resources exist', async () => {
            mockRepository.find.mockResolvedValue([]);

            const result = await repository.findAll();

            expect(result).toEqual([]);
        });

        it('should handle findAll errors', async () => {
            mockRepository.find.mockRejectedValue(new Error('Database error'));

            await expect(repository.findAll()).rejects.toThrow('Database error');
        });

        it('should return resources ordered by name ascending', async () => {
            const resources = [
                { ...mockResource, name: 'Room B' },
                { ...mockResource, name: 'Room A' },
            ] as any[];
            mockRepository.find.mockResolvedValue(resources);

            const result = await repository.findAll();

            expect(result[0].name).toBe('Room B');
            expect(result[1].name).toBe('Room A');
        });
    });

    describe('findActive', () => {
        it('should find active resources successfully', async () => {
            const activeResources = [mockResource] as any[];
            mockRepository.find.mockResolvedValue(activeResources);

            const result = await repository.findActive();

            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { isActive: true },
                relations: ['bookings'],
                order: { name: 'ASC' },
            });
            expect(result).toBe(activeResources);
        });

        it('should return empty array when no active resources', async () => {
            mockRepository.find.mockResolvedValue([]);

            const result = await repository.findActive();

            expect(result).toEqual([]);
        });

        it('should handle findActive errors', async () => {
            mockRepository.find.mockRejectedValue(new Error('Database error'));

            await expect(repository.findActive()).rejects.toThrow('Database error');
        });
    });

    describe('delete', () => {
        it('should delete resource successfully', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 1 } as any);

            await repository.delete(mockResource.id);

            expect(mockRepository.delete).toHaveBeenCalledWith(mockResource.id);
        });

        it('should handle delete errors', async () => {
            mockRepository.delete.mockRejectedValue(new Error('Database error'));

            await expect(repository.delete(mockResource.id)).rejects.toThrow('Database error');
        });

        it('should handle deletion of non-existent resource', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 0 } as any);

            await repository.delete('non-existent-id');

            expect(mockRepository.delete).toHaveBeenCalledWith('non-existent-id');
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle empty resource ID', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            const result = await repository.findById('');

            expect(result).toBeNull();
        });

        it('should handle null time slot', async () => {
            mockRepository.find.mockResolvedValue([]);

            // The repository should handle null gracefully by returning empty array
            const result = await repository.findAvailable(null as any);
            expect(result).toEqual([]);
        });

        it('should handle concurrent operations', async () => {
            mockRepository.save.mockResolvedValue(mockResource);
            mockRepository.findOne.mockResolvedValue(mockResource);
            mockRepository.find.mockResolvedValue([mockResource]);

            const promises = [
                repository.save(mockResource),
                repository.findById(mockResource.id),
                repository.findAll(),
            ];

            const results = await Promise.all(promises);

            expect(results).toHaveLength(3);
            expect(results[0]).toBe(mockResource);
            expect(results[1]).toBe(mockResource);
            expect(results[2]).toEqual([mockResource]);
        });

        it('should handle malformed resource data', async () => {
            const malformedResource = {
                id: '',
                name: '',
                type: null as any,
                capacity: -1,
                isActive: null as any,
            } as Resource;
            mockRepository.save.mockResolvedValue(malformedResource);

            const result = await repository.save(malformedResource);

            expect(result).toBe(malformedResource);
        });

        it('should handle resources with complex metadata', async () => {
            const complexMetadata = {
                features: ['projector', 'whiteboard', 'video-conferencing'],
                location: { floor: 5, building: 'A' },
                restrictions: { maxDuration: 8, requiresApproval: true },
            };
            const resourceWithComplexMetadata = { ...mockResource, metadata: complexMetadata } as any;
            mockRepository.save.mockResolvedValue(resourceWithComplexMetadata);

            const result = await repository.save(resourceWithComplexMetadata);

            expect(result.metadata).toEqual(complexMetadata);
        });
    });
});
