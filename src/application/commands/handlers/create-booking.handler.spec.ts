import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { CreateBookingHandler } from './create-booking.handler';
import { CreateBookingCommand } from '../create-booking.command';
import { BookingRepository } from '@/infrastructure/persistence/typeorm/booking.repository';
import { UserRepository } from '@/infrastructure/persistence/typeorm/user.repository';
import { ResourceRepository } from '@/infrastructure/persistence/typeorm/resource.repository';
import { User } from '@/domain/entities/user.entity';
import { Resource } from '@/domain/entities/resource.entity';
import { Booking } from '@/domain/entities/booking.entity';
import { ResourceType } from '@/domain/enums/resource-type.enum';
import { BookingStatus } from '@/domain/enums/booking-status.enum';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('CreateBookingHandler', () => {
    let handler: CreateBookingHandler;
    let bookingRepository: jest.Mocked<BookingRepository>;
    let userRepository: jest.Mocked<UserRepository>;
    let resourceRepository: jest.Mocked<ResourceRepository>;
    let eventBus: jest.Mocked<EventBus>;

    const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
        bookings: [],
        getFullName: jest.fn().mockReturnValue('John Doe'),
    } as any;

    const mockResource: Resource = {
        id: 'resource-456',
        name: 'Conference Room A',
        type: ResourceType.MEETING_ROOM,
        capacity: 10,
        isActive: true,
        isAvailable: jest.fn().mockReturnValue(true),
        getAvailableCapacity: jest.fn().mockReturnValue(10),
        createdAt: new Date(),
        updatedAt: new Date(),
        bookings: [],
    } as any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateBookingHandler,
                {
                    provide: BookingRepository,
                    useValue: {
                        save: jest.fn(),
                        findOverlappingBookings: jest.fn(),
                    },
                },
                {
                    provide: UserRepository,
                    useValue: {
                        findById: jest.fn(),
                    },
                },
                {
                    provide: ResourceRepository,
                    useValue: {
                        findById: jest.fn(),
                    },
                },
                {
                    provide: EventBus,
                    useValue: {
                        publish: jest.fn(),
                    },
                },
            ],
        }).compile();

        handler = module.get<CreateBookingHandler>(CreateBookingHandler);
        bookingRepository = module.get(BookingRepository);
        userRepository = module.get(UserRepository);
        resourceRepository = module.get(ResourceRepository);
        eventBus = module.get(EventBus);
    });

    describe('execute', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        const futureEndDate = new Date(futureDate);
        futureEndDate.setHours(futureEndDate.getHours() + 2);

        const command = new CreateBookingCommand(
            'user-123',
            'resource-456',
            futureDate.toISOString(),
            futureEndDate.toISOString(),
            'Test booking'
        );

        it('should create a booking successfully', async () => {
            userRepository.findById.mockResolvedValue(mockUser);
            resourceRepository.findById.mockResolvedValue(mockResource);
            bookingRepository.findOverlappingBookings.mockResolvedValue([]);
            bookingRepository.save.mockResolvedValue({
                id: 'booking-789',
                userId: 'user-123',
                resourceId: 'resource-456',
                startTime: futureDate,
                endTime: futureEndDate,
                status: BookingStatus.PENDING,
                notes: 'Test booking',
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any);

            const result = await handler.execute(command);

            expect(result).toBeDefined();
            expect(bookingRepository.save).toHaveBeenCalled();
            expect(eventBus.publish).toHaveBeenCalled();
        });

        it('should throw NotFoundException when user not found', async () => {
            userRepository.findById.mockResolvedValue(null);

            await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException when resource not found', async () => {
            userRepository.findById.mockResolvedValue(mockUser);
            resourceRepository.findById.mockResolvedValue(null);

            await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
        });

        it('should throw ConflictException when overlapping bookings exist', async () => {
            userRepository.findById.mockResolvedValue(mockUser);
            resourceRepository.findById.mockResolvedValue(mockResource);
            bookingRepository.findOverlappingBookings.mockResolvedValue([{} as any]);

            await expect(handler.execute(command)).rejects.toThrow(ConflictException);
        });

        it('should throw ConflictException when resource is not available', async () => {
            userRepository.findById.mockResolvedValue(mockUser);
            resourceRepository.findById.mockResolvedValue({
                ...mockResource,
                isAvailable: jest.fn().mockReturnValue(false),
                getAvailableCapacity: jest.fn().mockReturnValue(0),
            });
            bookingRepository.findOverlappingBookings.mockResolvedValue([]);

            await expect(handler.execute(command)).rejects.toThrow(ConflictException);
        });
    });
});