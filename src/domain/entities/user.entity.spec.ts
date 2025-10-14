import { User } from './user.entity';

describe('User Entity', () => {
    const userId = 'user-123';
    const email = 'john.doe@example.com';
    const firstName = 'John';
    const lastName = 'Doe';
    const phone = '1234567890';

    describe('constructor', () => {
        it('should create a user with all parameters', () => {
            const user = new User(userId, email, firstName, lastName, phone);

            expect(user.id).toBe(userId);
            expect(user.email).toBe(email);
            expect(user.firstName).toBe(firstName);
            expect(user.lastName).toBe(lastName);
            expect(user.phone).toBe(phone);
        });

        it('should create a user without phone', () => {
            const user = new User(userId, email, firstName, lastName);

            expect(user.id).toBe(userId);
            expect(user.email).toBe(email);
            expect(user.firstName).toBe(firstName);
            expect(user.lastName).toBe(lastName);
            expect(user.phone).toBeUndefined();
        });

        it('should create a user with empty phone', () => {
            const user = new User(userId, email, firstName, lastName, '');

            expect(user.id).toBe(userId);
            expect(user.email).toBe(email);
            expect(user.firstName).toBe(firstName);
            expect(user.lastName).toBe(lastName);
            expect(user.phone).toBe('');
        });
    });

    describe('getFullName', () => {
        it('should return full name with first and last name', () => {
            const user = new User(userId, email, firstName, lastName);

            const fullName = user.getFullName();

            expect(fullName).toBe('John Doe');
        });

        it('should handle names with spaces', () => {
            const user = new User(userId, email, 'John Michael', 'Doe Smith');

            const fullName = user.getFullName();

            expect(fullName).toBe('John Michael Doe Smith');
        });

        it('should handle empty first name', () => {
            const user = new User(userId, email, '', lastName);

            const fullName = user.getFullName();

            expect(fullName).toBe(' Doe');
        });

        it('should handle empty last name', () => {
            const user = new User(userId, email, firstName, '');

            const fullName = user.getFullName();

            expect(fullName).toBe('John ');
        });

        it('should handle both empty names', () => {
            const user = new User(userId, email, '', '');

            const fullName = user.getFullName();

            expect(fullName).toBe(' ');
        });

        it('should handle single character names', () => {
            const user = new User(userId, email, 'J', 'D');

            const fullName = user.getFullName();

            expect(fullName).toBe('J D');
        });

        it('should handle special characters in names', () => {
            const user = new User(userId, email, 'José', 'O\'Connor');

            const fullName = user.getFullName();

            expect(fullName).toBe('José O\'Connor');
        });

        it('should handle numbers in names', () => {
            const user = new User(userId, email, 'John2', 'Doe3');

            const fullName = user.getFullName();

            expect(fullName).toBe('John2 Doe3');
        });
    });

    describe('edge cases', () => {
        it('should handle very long names', () => {
            const longFirstName = 'A'.repeat(100);
            const longLastName = 'B'.repeat(100);
            const user = new User(userId, email, longFirstName, longLastName);

            const fullName = user.getFullName();

            expect(fullName).toBe(`${longFirstName} ${longLastName}`);
        });

        it('should handle unicode characters', () => {
            const user = new User(userId, email, '李', '王');

            const fullName = user.getFullName();

            expect(fullName).toBe('李 王');
        });

        it('should handle emoji in names', () => {
            const user = new User(userId, email, 'John😀', 'Doe🎉');

            const fullName = user.getFullName();

            expect(fullName).toBe('John😀 Doe🎉');
        });
    });

    describe('property access', () => {
        it('should allow access to all properties', () => {
            const user = new User(userId, email, firstName, lastName, phone);

            expect(user.id).toBe(userId);
            expect(user.email).toBe(email);
            expect(user.firstName).toBe(firstName);
            expect(user.lastName).toBe(lastName);
            expect(user.phone).toBe(phone);
        });

        it('should have bookings property initialized', () => {
            const user = new User(userId, email, firstName, lastName);

            expect(user.bookings).toBeUndefined(); // Will be set by TypeORM
        });

        it('should have timestamps properties', () => {
            const user = new User(userId, email, firstName, lastName);

            expect(user.createdAt).toBeUndefined(); // Will be set by TypeORM
            expect(user.updatedAt).toBeUndefined(); // Will be set by TypeORM
        });
    });
});
