import { BookingId } from './booking-id.value-object';

describe('BookingId Value Object', () => {
    describe('constructor', () => {
        it('should generate a new UUID when no value provided', () => {
            const bookingId1 = new BookingId();
            const bookingId2 = new BookingId();

            expect(bookingId1.value).toBeDefined();
            expect(bookingId2.value).toBeDefined();
            expect(bookingId1.value).not.toBe(bookingId2.value);
            expect(bookingId1.value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        });

        it('should use provided value when given', () => {
            const customValue = 'custom-booking-id';
            const bookingId = new BookingId(customValue);

            expect(bookingId.value).toBe(customValue);
        });

        it('should generate UUID when empty string provided', () => {
            const bookingId = new BookingId('');

            expect(bookingId.value).toBeDefined();
            expect(bookingId.value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        });

        it('should generate UUID when null provided', () => {
            const bookingId = new BookingId(null as any);

            expect(bookingId.value).toBeDefined();
            expect(bookingId.value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        });

        it('should use undefined when provided', () => {
            const bookingId = new BookingId(undefined);

            expect(bookingId.value).toBeDefined();
            expect(bookingId.value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        });
    });

    describe('toString', () => {
        it('should return the value as string', () => {
            const customValue = 'test-booking-id';
            const bookingId = new BookingId(customValue);

            expect(bookingId.toString()).toBe(customValue);
        });

        it('should return generated UUID as string', () => {
            const bookingId = new BookingId();

            expect(bookingId.toString()).toBe(bookingId.value);
            expect(bookingId.toString()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        });
    });

    describe('equals', () => {
        it('should return true for same value', () => {
            const customValue = 'same-booking-id';
            const bookingId1 = new BookingId(customValue);
            const bookingId2 = new BookingId(customValue);

            expect(bookingId1.equals(bookingId2)).toBe(true);
        });

        it('should return false for different values', () => {
            const bookingId1 = new BookingId('id-1');
            const bookingId2 = new BookingId('id-2');

            expect(bookingId1.equals(bookingId2)).toBe(false);
        });

        it('should throw error when comparing with null', () => {
            const bookingId = new BookingId('test-id');

            expect(() => bookingId.equals(null as any)).toThrow();
        });

        it('should throw error when comparing with undefined', () => {
            const bookingId = new BookingId('test-id');

            expect(() => bookingId.equals(undefined as any)).toThrow();
        });

        it('should return true for same instance', () => {
            const bookingId = new BookingId('test-id');

            expect(bookingId.equals(bookingId)).toBe(true);
        });

        it('should handle case sensitivity', () => {
            const bookingId1 = new BookingId('Test-ID');
            const bookingId2 = new BookingId('test-id');

            expect(bookingId1.equals(bookingId2)).toBe(false);
        });

        it('should handle empty strings', () => {
            const bookingId1 = new BookingId('');
            const bookingId2 = new BookingId('');

            // Both will generate different UUIDs since empty string triggers UUID generation
            expect(bookingId1.equals(bookingId2)).toBe(false);
        });

        it('should handle special characters', () => {
            const specialValue = 'booking-id-with-special-chars!@#$%^&*()';
            const bookingId1 = new BookingId(specialValue);
            const bookingId2 = new BookingId(specialValue);

            expect(bookingId1.equals(bookingId2)).toBe(true);
        });
    });

    describe('static fromString', () => {
        it('should create BookingId from string', () => {
            const customValue = 'string-booking-id';
            const bookingId = BookingId.fromString(customValue);

            expect(bookingId.value).toBe(customValue);
            expect(bookingId).toBeInstanceOf(BookingId);
        });

        it('should generate UUID from empty string', () => {
            const bookingId = BookingId.fromString('');

            expect(bookingId.value).toBeDefined();
            expect(bookingId.value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        });

        it('should create BookingId from UUID string', () => {
            const uuidString = '123e4567-e89b-12d3-a456-426614174000';
            const bookingId = BookingId.fromString(uuidString);

            expect(bookingId.value).toBe(uuidString);
        });

        it('should create BookingId from numeric string', () => {
            const numericString = '12345';
            const bookingId = BookingId.fromString(numericString);

            expect(bookingId.value).toBe(numericString);
        });
    });

    describe('immutability', () => {
        it('should be immutable after creation', () => {
            const bookingId = new BookingId('test-id');
            const originalValue = bookingId.value;

            // Attempting to modify should not work (TypeScript will prevent this)
            // bookingId.value = 'new-value'; // This would cause a TypeScript error

            expect(bookingId.value).toBe(originalValue);
        });

        it('should maintain immutability through operations', () => {
            const bookingId1 = new BookingId('original-id');
            const bookingId2 = new BookingId('original-id');

            const equalsResult = bookingId1.equals(bookingId2);
            const toStringResult = bookingId1.toString();

            expect(bookingId1.value).toBe('original-id');
            expect(equalsResult).toBe(true);
            expect(toStringResult).toBe('original-id');
        });
    });

    describe('edge cases', () => {
        it('should handle very long strings', () => {
            const longString = 'a'.repeat(1000);
            const bookingId = new BookingId(longString);

            expect(bookingId.value).toBe(longString);
            expect(bookingId.toString()).toBe(longString);
        });

        it('should handle unicode characters', () => {
            const unicodeString = '预订-123-🎫';
            const bookingId = new BookingId(unicodeString);

            expect(bookingId.value).toBe(unicodeString);
            expect(bookingId.toString()).toBe(unicodeString);
        });

        it('should handle whitespace', () => {
            const whitespaceString = '  booking id  ';
            const bookingId = new BookingId(whitespaceString);

            expect(bookingId.value).toBe(whitespaceString);
        });

        it('should handle newlines and special characters', () => {
            const specialString = 'booking\nid\twith\rspecial';
            const bookingId = new BookingId(specialString);

            expect(bookingId.value).toBe(specialString);
        });

        it('should generate unique IDs consistently', () => {
            const ids = Array.from({ length: 100 }, () => new BookingId());
            const uniqueIds = new Set(ids.map(id => id.value));

            expect(uniqueIds.size).toBe(100);
        });

        it('should handle comparison with different types', () => {
            const bookingId = new BookingId('test-id');
            const stringValue = 'test-id';

            // Direct comparison should work
            expect(bookingId.value === stringValue).toBe(true);
            expect(bookingId.toString() === stringValue).toBe(true);
        });
    });

    describe('integration scenarios', () => {
        it('should work in array operations', () => {
            const ids = [
                new BookingId('id-1'),
                new BookingId('id-2'),
                new BookingId('id-3')
            ];

            const found = ids.find(id => id.equals(new BookingId('id-2')));
            expect(found).toBeDefined();
            expect(found?.value).toBe('id-2');
        });

        it('should work in Set operations', () => {
            const id1 = new BookingId('same-id');
            const id2 = new BookingId('same-id');
            const id3 = new BookingId('different-id');

            const idSet = new Set([id1, id2, id3]);
            expect(idSet.size).toBe(3); // Set uses reference equality, not equals method
        });

        it('should work in Map operations', () => {
            const id1 = new BookingId('map-key');
            const id2 = new BookingId('map-key');

            const idMap = new Map();
            idMap.set(id1, 'value1');
            idMap.set(id2, 'value2');

            expect(idMap.size).toBe(2); // Map uses reference equality, not equals method
            expect(idMap.get(id1)).toBe('value1');
            expect(idMap.get(id2)).toBe('value2');
        });
    });
});
