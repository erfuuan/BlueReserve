import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingRepository } from './booking.repository';
import { Booking } from '@/domain/entities/booking.entity';
import { BookingId } from '@/domain/value-objects/booking-id.value-object';
import { TimeSlot } from '@/domain/value-objects/time-slot.value-object';
import { BookingStatus } from '@/domain/enums/booking-status.enum';

describe('BookingRepository', () => {
    let repository: BookingRepository;
    let mockRepository: jest.Mocked<Repository<Booking>>;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureEndDate = new Date(futureDate);
    futureEndDate.setHours(futureEndDate.getHours() + 2);

    const validTimeSlot = new TimeSlot(futureDate, futureEndDate);
    const bookingId = new BookingId();
    const userId = 'user-123';
    const resourceId = 'resource-456';

    const mockBooking = {
        id: bookingId.toString(),
        userId: userId,
        resourceId: resourceId,
        startTime: futureDate,
        endTime: futureEndDate,
        status: BookingStatus.PENDING,
        notes: 'Test booking',
        createdAt: new Date(),
        updatedAt: new Date(),
        confirm: jest.fn(),
        cancel: jest.fn().mockReturnValue('Booking cancelled'),
        isOverlapping: jest.fn().mockReturnValue(false),
        getTimeSlot: jest.fn().mockReturnValue(validTimeSlot),
        isActive: jest.fn().mockReturnValue(true),
    } as any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BookingRepository,
                {
                    provide: getRepositoryToken(Booking),
                    useValue: {
                        save: jest.fn(),
                        findOne: jest.fn(),
                        find: jest.fn(),
                        createQueryBuilder: jest.fn(),
                    },
                },
            ],
        }).compile();

        repository = module.get<BookingRepository>(BookingRepository);
        mockRepository = module.get(getRepositoryToken(Booking));
    });

    describe('save', () => {
        it('should save booking successfully', async () => {
            mockRepository.save.mockResolvedValue(mockBooking);

            const result = await repository.save(mockBooking);

            expect(mockRepository.save).toHaveBeenCalledWith(mockBooking);
            expect(result).toBe(mockBooking);
        });

        it('should handle save errors', async () => {
            mockRepository.save.mockRejectedValue(new Error('Database error'));

            await expect(repository.save(mockBooking)).rejects.toThrow('Database error');
        });

        it('should save booking with different statuses', async () => {
            const confirmedBooking = { ...mockBooking, status: BookingStatus.CONFIRMED } as any;
            mockRepository.save.mockResolvedValue(confirmedBooking);

            const result = await repository.save(confirmedBooking);

            expect(result.status).toBe(BookingStatus.CONFIRMED);
        });
    });

    describe('findById', () => {
        it('should find booking by ID successfully', async () => {
            mockRepository.findOne.mockResolvedValue(mockBooking);

            const result = await repository.findById(bookingId);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: bookingId.toString() },
                relations: ['user', 'resource'],
            });
            expect(result).toBe(mockBooking);
        });

        it('should return null when booking not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            const result = await repository.findById(bookingId);

            expect(result).toBeNull();
        });

        it('should handle findById errors', async () => {
            mockRepository.findOne.mockRejectedValue(new Error('Database connection failed'));

            await expect(repository.findById(bookingId)).rejects.toThrow('Database connection failed');
        });

        it('should find booking with relations loaded', async () => {
            const bookingWithRelations = {
                ...mockBooking,
                user: { id: userId, email: 'test@example.com' },
                resource: { id: resourceId, name: 'Test Room' },
            } as any;
            mockRepository.findOne.mockResolvedValue(bookingWithRelations);

            const result = await repository.findById(bookingId);

            expect(result).toBe(bookingWithRelations);
            expect(result.user).toBeDefined();
            expect(result.resource).toBeDefined();
        });
    });

    describe('findByUserId', () => {
        it('should find bookings by user ID successfully', async () => {
            const userBookings = [mockBooking, { ...mockBooking, id: 'booking-2' }] as any[];
            mockRepository.find.mockResolvedValue(userBookings);

            const result = await repository.findByUserId(userId);

            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { userId },
                relations: ['user', 'resource'],
                order: { createdAt: 'DESC' },
            });
            expect(result).toBe(userBookings);
            expect(result).toHaveLength(2);
        });

        it('should return empty array when no bookings found', async () => {
            mockRepository.find.mockResolvedValue([]);

            const result = await repository.findByUserId(userId);

            expect(result).toEqual([]);
        });

        it('should handle findByUserId errors', async () => {
            mockRepository.find.mockRejectedValue(new Error('Database error'));

            await expect(repository.findByUserId(userId)).rejects.toThrow('Database error');
        });

        it('should return bookings ordered by creation date descending', async () => {
            const olderBooking = { ...mockBooking, createdAt: new Date('2024-01-01') };
            const newerBooking = { ...mockBooking, createdAt: new Date('2024-01-02') };
            const userBookings = [newerBooking, olderBooking];
            mockRepository.find.mockResolvedValue(userBookings);

            const result = await repository.findByUserId(userId);

            expect(result[0].createdAt).toEqual(new Date('2024-01-02'));
            expect(result[1].createdAt).toEqual(new Date('2024-01-01'));
        });
    });

    describe('findOverlappingBookings', () => {
        let mockQueryBuilder: any;

        beforeEach(() => {
            mockQueryBuilder = {
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getMany: jest.fn(),
            };
            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
        });

        it('should find overlapping bookings successfully', async () => {
            const overlappingBookings = [mockBooking];
            mockQueryBuilder.getMany.mockResolvedValue(overlappingBookings);

            const result = await repository.findOverlappingBookings(resourceId, validTimeSlot);

            expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('booking');
            expect(mockQueryBuilder.where).toHaveBeenCalledWith('booking.resourceId = :resourceId', { resourceId });
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('booking.status != :cancelledStatus', {
                cancelledStatus: 'cancelled'
            });
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
                '(booking.startTime < :endTime AND booking.endTime > :startTime)',
                {
                    startTime: futureDate,
                    endTime: futureEndDate,
                }
            );
            expect(result).toBe(overlappingBookings);
        });

        it('should return empty array when no overlapping bookings', async () => {
            mockQueryBuilder.getMany.mockResolvedValue([]);

            const result = await repository.findOverlappingBookings(resourceId, validTimeSlot);

            expect(result).toEqual([]);
        });

        it('should exclude cancelled bookings from overlap check', async () => {
            mockQueryBuilder.getMany.mockResolvedValue([]);

            const result = await repository.findOverlappingBookings(resourceId, validTimeSlot);

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('booking.status != :cancelledStatus', {
                cancelledStatus: 'cancelled'
            });
            expect(result).toEqual([]);
        });

        it('should handle findOverlappingBookings errors', async () => {
            mockQueryBuilder.getMany.mockRejectedValue(new Error('Query execution failed'));

            await expect(repository.findOverlappingBookings(resourceId, validTimeSlot)).rejects.toThrow('Query execution failed');
        });

        it('should handle different time slots correctly', async () => {
            const differentTimeSlot = new TimeSlot(
                new Date(futureDate.getTime() + 1000 * 60 * 60), // 1 hour later
                new Date(futureEndDate.getTime() + 1000 * 60 * 60) // 1 hour later
            );
            mockQueryBuilder.getMany.mockResolvedValue([]);

            const result = await repository.findOverlappingBookings(resourceId, differentTimeSlot);

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
                '(booking.startTime < :endTime AND booking.endTime > :startTime)',
                {
                    startTime: differentTimeSlot.startTime,
                    endTime: differentTimeSlot.endTime,
                }
            );
        });

        it('should handle different resource IDs', async () => {
            const differentResourceId = 'different-resource';
            mockQueryBuilder.getMany.mockResolvedValue([]);

            const result = await repository.findOverlappingBookings(differentResourceId, validTimeSlot);

            expect(mockQueryBuilder.where).toHaveBeenCalledWith('booking.resourceId = :resourceId', {
                resourceId: differentResourceId
            });
        });
    });

    describe('findBookingsByStatus', () => {
        it('should find bookings by status successfully', async () => {
            const pendingBookings = [mockBooking];
            mockRepository.find.mockResolvedValue(pendingBookings);

            const result = await repository.findBookingsByStatus(BookingStatus.PENDING);

            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { status: BookingStatus.PENDING },
                relations: ['user', 'resource'],
                order: { createdAt: 'DESC' },
            });
            expect(result).toBe(pendingBookings);
        });

        it('should find confirmed bookings', async () => {
            const confirmedBookings = [{ ...mockBooking, status: BookingStatus.CONFIRMED }] as any[];
            mockRepository.find.mockResolvedValue(confirmedBookings);

            const result = await repository.findBookingsByStatus(BookingStatus.CONFIRMED);

            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { status: BookingStatus.CONFIRMED },
                relations: ['user', 'resource'],
                order: { createdAt: 'DESC' },
            });
            expect(result[0].status).toBe(BookingStatus.CONFIRMED);
        });

        it('should find cancelled bookings', async () => {
            const cancelledBookings = [{ ...mockBooking, status: BookingStatus.CANCELLED }] as any[];
            mockRepository.find.mockResolvedValue(cancelledBookings);

            const result = await repository.findBookingsByStatus(BookingStatus.CANCELLED);

            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { status: BookingStatus.CANCELLED },
                relations: ['user', 'resource'],
                order: { createdAt: 'DESC' },
            });
            expect(result[0].status).toBe(BookingStatus.CANCELLED);
        });

        it('should return empty array when no bookings with status found', async () => {
            mockRepository.find.mockResolvedValue([]);

            const result = await repository.findBookingsByStatus(BookingStatus.PENDING);

            expect(result).toEqual([]);
        });

        it('should handle findBookingsByStatus errors', async () => {
            mockRepository.find.mockRejectedValue(new Error('Database error'));

            await expect(repository.findBookingsByStatus(BookingStatus.PENDING)).rejects.toThrow('Database error');
        });

        it('should return bookings ordered by creation date descending', async () => {
            const olderBooking = { ...mockBooking, createdAt: new Date('2024-01-01') };
            const newerBooking = { ...mockBooking, createdAt: new Date('2024-01-02') };
            const bookings = [newerBooking, olderBooking] as any[];
            mockRepository.find.mockResolvedValue(bookings);

            const result = await repository.findBookingsByStatus(BookingStatus.PENDING);

            expect(result[0].createdAt).toEqual(new Date('2024-01-02'));
            expect(result[1].createdAt).toEqual(new Date('2024-01-01'));
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle malformed BookingId', async () => {
            const malformedId = new BookingId('invalid-id');
            mockRepository.findOne.mockResolvedValue(null);

            const result = await repository.findById(malformedId);

            expect(result).toBeNull();
        });

        it('should handle empty user ID', async () => {
            mockRepository.find.mockResolvedValue([]);

            const result = await repository.findByUserId('');

            expect(result).toEqual([]);
        });

        it('should handle null time slot', async () => {
            const mockQueryBuilder = {
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([]),
            };
            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

            await expect(repository.findOverlappingBookings(resourceId, null as any)).rejects.toThrow();
        });

        it('should handle concurrent operations', async () => {
            mockRepository.save.mockResolvedValue(mockBooking);
            mockRepository.findOne.mockResolvedValue(mockBooking);

            const promises = [
                repository.save(mockBooking),
                repository.findById(bookingId),
                repository.findByUserId(userId),
            ];

            const results = await Promise.all(promises);

            expect(results).toHaveLength(3);
            expect(results[0]).toBe(mockBooking);
            expect(results[1]).toBe(mockBooking);
        });
    });
});
