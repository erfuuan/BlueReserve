import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from './user.repository';
import { User } from '@/domain/entities/user.entity';

describe('UserRepository', () => {
    let repository: UserRepository;
    let mockRepository: jest.Mocked<Repository<User>>;

    const mockUser = {
        id: 'user-123',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
        bookings: [],
        getFullName: jest.fn().mockReturnValue('John Doe'),
    } as any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserRepository,
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        save: jest.fn(),
                        findOne: jest.fn(),
                        find: jest.fn(),
                        delete: jest.fn(),
                    },
                },
            ],
        }).compile();

        repository = module.get<UserRepository>(UserRepository);
        mockRepository = module.get(getRepositoryToken(User));
    });

    describe('save', () => {
        it('should save user successfully', async () => {
            mockRepository.save.mockResolvedValue(mockUser);

            const result = await repository.save(mockUser);

            expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
            expect(result).toBe(mockUser);
        });

        it('should handle save errors', async () => {
            mockRepository.save.mockRejectedValue(new Error('Database error'));

            await expect(repository.save(mockUser)).rejects.toThrow('Database error');
        });

        it('should save user with different data', async () => {
            const differentUser = {
                ...mockUser,
                email: 'jane.smith@example.com',
                firstName: 'Jane',
                lastName: 'Smith',
            } as any;
            mockRepository.save.mockResolvedValue(differentUser);

            const result = await repository.save(differentUser);

            expect(result.email).toBe('jane.smith@example.com');
            expect(result.firstName).toBe('Jane');
            expect(result.lastName).toBe('Smith');
        });

        it('should save user without phone number', async () => {
            const userWithoutPhone = { ...mockUser, phone: undefined } as any;
            mockRepository.save.mockResolvedValue(userWithoutPhone);

            const result = await repository.save(userWithoutPhone);

            expect(result.phone).toBeUndefined();
        });

        it('should save user with empty phone number', async () => {
            const userWithEmptyPhone = { ...mockUser, phone: '' } as any;
            mockRepository.save.mockResolvedValue(userWithEmptyPhone);

            const result = await repository.save(userWithEmptyPhone);

            expect(result.phone).toBe('');
        });
    });

    describe('findById', () => {
        it('should find user by ID successfully', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);

            const result = await repository.findById(mockUser.id);

            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUser.id } });
            expect(result).toBe(mockUser);
        });

        it('should return null when user not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            const result = await repository.findById('non-existent-id');

            expect(result).toBeNull();
        });

        it('should handle findById errors', async () => {
            mockRepository.findOne.mockRejectedValue(new Error('Database connection failed'));

            await expect(repository.findById(mockUser.id)).rejects.toThrow('Database connection failed');
        });

        it('should find user with empty ID', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            const result = await repository.findById('');

            expect(result).toBeNull();
        });

        it('should find user with different ID formats', async () => {
            const uuidUser = { ...mockUser, id: '123e4567-e89b-12d3-a456-426614174000' } as any;
            mockRepository.findOne.mockResolvedValue(uuidUser);

            const result = await repository.findById('123e4567-e89b-12d3-a456-426614174000');

            expect(result).toBe(uuidUser);
        });
    });

    describe('findByEmail', () => {
        it('should find user by email successfully', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);

            const result = await repository.findByEmail(mockUser.email);

            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: mockUser.email } });
            expect(result).toBe(mockUser);
        });

        it('should return null when user not found by email', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            const result = await repository.findByEmail('nonexistent@example.com');

            expect(result).toBeNull();
        });

        it('should handle findByEmail errors', async () => {
            mockRepository.findOne.mockRejectedValue(new Error('Database error'));

            await expect(repository.findByEmail(mockUser.email)).rejects.toThrow('Database error');
        });

        it('should find user with different email formats', async () => {
            const testEmails = [
                'test@example.com',
                'user.name@domain.co.uk',
                'user+tag@example.org',
                'user123@test-domain.com',
            ];

            for (const email of testEmails) {
                const userWithEmail = { ...mockUser, email } as any;
                mockRepository.findOne.mockResolvedValue(userWithEmail);

                const result = await repository.findByEmail(email);

                expect(result).toBe(userWithEmail);
                expect(result.email).toBe(email);
            }
        });

        it('should handle case sensitivity in email search', async () => {
            const upperCaseEmail = mockUser.email.toUpperCase();
            mockRepository.findOne.mockResolvedValue(null);

            const result = await repository.findByEmail(upperCaseEmail);

            expect(result).toBeNull();
        });

        it('should handle empty email', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            const result = await repository.findByEmail('');

            expect(result).toBeNull();
        });

        it('should handle malformed email addresses', async () => {
            const malformedEmails = [
                'not-an-email',
                '@example.com',
                'user@',
                'user@.com',
                'user..name@example.com',
            ];

            for (const email of malformedEmails) {
                mockRepository.findOne.mockResolvedValue(null);

                const result = await repository.findByEmail(email);

                expect(result).toBeNull();
            }
        });
    });

    describe('findAll', () => {
        it('should find all users successfully', async () => {
            const allUsers = [mockUser, { ...mockUser, id: 'user-2', email: 'user2@example.com' }] as any[];
            mockRepository.find.mockResolvedValue(allUsers);

            const result = await repository.findAll();

            expect(mockRepository.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
            expect(result).toBe(allUsers);
            expect(result).toHaveLength(2);
        });

        it('should return empty array when no users exist', async () => {
            mockRepository.find.mockResolvedValue([]);

            const result = await repository.findAll();

            expect(result).toEqual([]);
        });

        it('should handle findAll errors', async () => {
            mockRepository.find.mockRejectedValue(new Error('Database error'));

            await expect(repository.findAll()).rejects.toThrow('Database error');
        });

        it('should return users ordered by creation date descending', async () => {
            const olderUser = { ...mockUser, createdAt: new Date('2024-01-01') };
            const newerUser = { ...mockUser, createdAt: new Date('2024-01-02') };
            const users = [newerUser, olderUser] as any[];
            mockRepository.find.mockResolvedValue(users);

            const result = await repository.findAll();

            expect(result[0].createdAt).toEqual(new Date('2024-01-02'));
            expect(result[1].createdAt).toEqual(new Date('2024-01-01'));
        });

        it('should handle large number of users', async () => {
            const largeUserList = Array.from({ length: 100 }, (_, i) => ({
                ...mockUser,
                id: `user-${i}`,
                email: `user${i}@example.com`,
            })) as any[];
            mockRepository.find.mockResolvedValue(largeUserList);

            const result = await repository.findAll();

            expect(result).toHaveLength(100);
        });
    });

    describe('delete', () => {
        it('should delete user successfully', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 1 } as any);

            await repository.delete(mockUser.id);

            expect(mockRepository.delete).toHaveBeenCalledWith(mockUser.id);
        });

        it('should handle delete errors', async () => {
            mockRepository.delete.mockRejectedValue(new Error('Database error'));

            await expect(repository.delete(mockUser.id)).rejects.toThrow('Database error');
        });

        it('should handle deletion of non-existent user', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 0 } as any);

            await repository.delete('non-existent-id');

            expect(mockRepository.delete).toHaveBeenCalledWith('non-existent-id');
        });

        it('should handle deletion with empty ID', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 0 } as any);

            await repository.delete('');

            expect(mockRepository.delete).toHaveBeenCalledWith('');
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle concurrent operations', async () => {
            mockRepository.save.mockResolvedValue(mockUser);
            mockRepository.findOne.mockResolvedValue(mockUser);
            mockRepository.find.mockResolvedValue([mockUser]);

            const promises = [
                repository.save(mockUser),
                repository.findById(mockUser.id),
                repository.findByEmail(mockUser.email),
                repository.findAll(),
            ];

            const results = await Promise.all(promises);

            expect(results).toHaveLength(4);
            expect(results[0]).toBe(mockUser);
            expect(results[1]).toBe(mockUser);
            expect(results[2]).toBe(mockUser);
            expect(results[3]).toEqual([mockUser]);
        });

        it('should handle malformed user data', async () => {
            const malformedUser = {
                id: '',
                email: '',
                firstName: '',
                lastName: '',
                phone: null as any,
            } as User;
            mockRepository.save.mockResolvedValue(malformedUser);

            const result = await repository.save(malformedUser);

            expect(result).toBe(malformedUser);
        });

        it('should handle users with special characters in names', async () => {
            const userWithSpecialChars = {
                ...mockUser,
                firstName: 'José',
                lastName: 'O\'Connor',
            } as any;
            mockRepository.save.mockResolvedValue(userWithSpecialChars);

            const result = await repository.save(userWithSpecialChars);

            expect(result.firstName).toBe('José');
            expect(result.lastName).toBe('O\'Connor');
        });

        it('should handle users with very long names', async () => {
            const longName = 'A'.repeat(1000);
            const userWithLongName = {
                ...mockUser,
                firstName: longName,
                lastName: longName,
            } as any;
            mockRepository.save.mockResolvedValue(userWithLongName);

            const result = await repository.save(userWithLongName);

            expect(result.firstName).toBe(longName);
            expect(result.lastName).toBe(longName);
        });

        it('should handle users with unicode characters', async () => {
            const userWithUnicode = {
                ...mockUser,
                firstName: '李',
                lastName: '王',
                email: '李王@example.com',
            } as any;
            mockRepository.save.mockResolvedValue(userWithUnicode);

            const result = await repository.save(userWithUnicode);

            expect(result.firstName).toBe('李');
            expect(result.lastName).toBe('王');
            expect(result.email).toBe('李王@example.com');
        });

        it('should handle users with emoji in names', async () => {
            const userWithEmoji = {
                ...mockUser,
                firstName: 'John😀',
                lastName: 'Doe🎉',
            } as any;
            mockRepository.save.mockResolvedValue(userWithEmoji);

            const result = await repository.save(userWithEmoji);

            expect(result.firstName).toBe('John😀');
            expect(result.lastName).toBe('Doe🎉');
        });

        it('should handle users with complex phone numbers', async () => {
            const complexPhoneNumbers = [
                '+1-555-123-4567',
                '+44 20 7946 0958',
                '+33 1 42 86 83 26',
                '(555) 123-4567',
                '555.123.4567',
            ];

            for (const phone of complexPhoneNumbers) {
                const userWithPhone = { ...mockUser, phone } as any;
                mockRepository.save.mockResolvedValue(userWithPhone);

                const result = await repository.save(userWithPhone);

                expect(result.phone).toBe(phone);
            }
        });

        it('should handle database connection failures gracefully', async () => {
            mockRepository.save.mockRejectedValue(new Error('Connection timeout'));
            mockRepository.findOne.mockRejectedValue(new Error('Connection timeout'));
            mockRepository.find.mockRejectedValue(new Error('Connection timeout'));
            mockRepository.delete.mockRejectedValue(new Error('Connection timeout'));

            await expect(repository.save(mockUser)).rejects.toThrow('Connection timeout');
            await expect(repository.findById(mockUser.id)).rejects.toThrow('Connection timeout');
            await expect(repository.findByEmail(mockUser.email)).rejects.toThrow('Connection timeout');
            await expect(repository.findAll()).rejects.toThrow('Connection timeout');
            await expect(repository.delete(mockUser.id)).rejects.toThrow('Connection timeout');
        });
    });
});
