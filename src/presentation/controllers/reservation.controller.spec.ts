import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ReservationController } from './reservation.controller';
import { CreateBookingCommand } from '@/application/commands/create-booking.command';
import { ConfirmBookingCommand } from '@/application/commands/confirm-booking.command';
import { CancelBookingCommand } from '@/application/commands/cancel-booking.command';
import { GetBookingQuery } from '@/application/queries/get-booking.query';
import { GetUserBookingsQuery } from '@/application/queries/get-user-bookings.query';
import { GetAvailableResourcesQuery } from '@/application/queries/get-available-resources.query';
import { BookingStatus } from '@/domain/enums/booking-status.enum';

describe('ReservationController', () => {
    let controller: ReservationController;
    let commandBus: jest.Mocked<CommandBus>;
    let queryBus: jest.Mocked<QueryBus>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReservationController],
            providers: [
                {
                    provide: CommandBus,
                    useValue: {
                        execute: jest.fn(),
                    },
                },
                {
                    provide: QueryBus,
                    useValue: {
                        execute: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<ReservationController>(ReservationController);
        commandBus = module.get(CommandBus);
        queryBus = module.get(QueryBus);
    });

    describe('createReservation', () => {
        it('should create a reservation', async () => {
            const createBookingDto = {
                userId: 'user-123',
                resourceId: 'resource-456',
                startTime: '2024-01-15T10:00:00Z',
                endTime: '2024-01-15T12:00:00Z',
                notes: 'Test booking',
            };

            const mockBooking = {
                id: 'booking-789',
                userId: 'user-123',
                resourceId: 'resource-456',
                startTime: new Date('2024-01-15T10:00:00Z'),
                endTime: new Date('2024-01-15T12:00:00Z'),
                status: BookingStatus.PENDING,
                notes: 'Test booking',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            commandBus.execute.mockResolvedValue(mockBooking);

            const result = await controller.createReservation(createBookingDto);

            expect(commandBus.execute).toHaveBeenCalledWith(
                expect.any(CreateBookingCommand)
            );
            expect(result).toBeDefined();
        });
    });

    describe('getReservation', () => {
        it('should get a reservation by ID', async () => {
            const bookingId = 'booking-789';
            const mockBooking = {
                id: bookingId,
                userId: 'user-123',
                resourceId: 'resource-456',
                startTime: new Date('2024-01-15T10:00:00Z'),
                endTime: new Date('2024-01-15T12:00:00Z'),
                status: BookingStatus.PENDING,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            queryBus.execute.mockResolvedValue(mockBooking);

            const result = await controller.getReservation(bookingId);

            expect(queryBus.execute).toHaveBeenCalledWith(
                expect.any(GetBookingQuery)
            );
            expect(result).toBeDefined();
        });
    });

    describe('getUserReservations', () => {
        it('should get user reservations', async () => {
            const userId = 'user-123';
            const mockBookings = [
                {
                    id: 'booking-789',
                    userId,
                    resourceId: 'resource-456',
                    startTime: new Date('2024-01-15T10:00:00Z'),
                    endTime: new Date('2024-01-15T12:00:00Z'),
                    status: BookingStatus.PENDING,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            queryBus.execute.mockResolvedValue(mockBookings);

            const result = await controller.getUserReservations(userId);

            expect(queryBus.execute).toHaveBeenCalledWith(
                expect.any(GetUserBookingsQuery)
            );
            expect(result).toBeDefined();
        });
    });

    describe('getAvailableResources', () => {
        it('should get available resources', async () => {
            const startTime = '2024-01-15T10:00:00Z';
            const endTime = '2024-01-15T12:00:00Z';
            const mockResources = [
                {
                    id: 'resource-456',
                    name: 'Conference Room A',
                    type: 'meeting_room',
                    capacity: 10,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            queryBus.execute.mockResolvedValue(mockResources);

            const result = await controller.getAvailableResources(startTime, endTime);

            expect(queryBus.execute).toHaveBeenCalledWith(
                expect.any(GetAvailableResourcesQuery)
            );
            expect(result).toBeDefined();
        });
    });

    describe('confirmReservation', () => {
        it('should confirm a reservation', async () => {
            const bookingId = 'booking-789';
            const mockBooking = {
                id: bookingId,
                userId: 'user-123',
                resourceId: 'resource-456',
                startTime: new Date('2024-01-15T10:00:00Z'),
                endTime: new Date('2024-01-15T12:00:00Z'),
                status: BookingStatus.CONFIRMED,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            commandBus.execute.mockResolvedValue(mockBooking);

            const result = await controller.confirmReservation(bookingId);

            expect(commandBus.execute).toHaveBeenCalledWith(
                expect.any(ConfirmBookingCommand)
            );
            expect(result).toBeDefined();
        });
    });

    describe('cancelReservation', () => {
        it('should cancel a reservation', async () => {
            const bookingId = 'booking-789';
            const cancelBookingDto = { reason: 'Change of plans' };

            commandBus.execute.mockResolvedValue(undefined);

            await controller.cancelReservation(bookingId, cancelBookingDto);

            expect(commandBus.execute).toHaveBeenCalledWith(
                expect.any(CancelBookingCommand)
            );
        });
    });
});
