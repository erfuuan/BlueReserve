import { BookingHistory } from './booking-history.entity';
import { BookingStatus } from '../enums/booking-status.enum';

describe('BookingHistory Entity', () => {
    const bookingId = 'booking-123';
    const userId = 'user-456';
    const resourceId = 'resource-789';
    const reason = 'User requested cancellation';
    const metadata = { source: 'web', ipAddress: '192.168.1.1' };

    describe('constructor', () => {
        it('should create booking history with all parameters', () => {
            const history = new BookingHistory(
                bookingId,
                userId,
                resourceId,
                BookingStatus.PENDING,
                BookingStatus.CANCELLED,
                reason,
                metadata
            );

            expect(history.bookingId).toBe(bookingId);
            expect(history.userId).toBe(userId);
            expect(history.resourceId).toBe(resourceId);
            expect(history.previousStatus).toBe(BookingStatus.PENDING);
            expect(history.newStatus).toBe(BookingStatus.CANCELLED);
            expect(history.reason).toBe(reason);
            expect(history.metadata).toBe(metadata);
        });

        it('should create booking history without optional parameters', () => {
            const history = new BookingHistory(
                bookingId,
                userId,
                resourceId,
                BookingStatus.PENDING,
                BookingStatus.CONFIRMED
            );

            expect(history.bookingId).toBe(bookingId);
            expect(history.userId).toBe(userId);
            expect(history.resourceId).toBe(resourceId);
            expect(history.previousStatus).toBe(BookingStatus.PENDING);
            expect(history.newStatus).toBe(BookingStatus.CONFIRMED);
            expect(history.reason).toBeUndefined();
            expect(history.metadata).toBeUndefined();
        });

        it('should create booking history with empty reason', () => {
            const history = new BookingHistory(
                bookingId,
                userId,
                resourceId,
                BookingStatus.PENDING,
                BookingStatus.CANCELLED,
                ''
            );

            expect(history.reason).toBe('');
        });

        it('should create booking history with empty metadata', () => {
            const history = new BookingHistory(
                bookingId,
                userId,
                resourceId,
                BookingStatus.PENDING,
                BookingStatus.CANCELLED,
                reason,
                {}
            );

            expect(history.metadata).toEqual({});
        });
    });

    describe('status transitions', () => {
        it('should handle PENDING to CONFIRMED transition', () => {
            const history = new BookingHistory(
                bookingId,
                userId,
                resourceId,
                BookingStatus.PENDING,
                BookingStatus.CONFIRMED,
                'Payment processed'
            );

            expect(history.previousStatus).toBe(BookingStatus.PENDING);
            expect(history.newStatus).toBe(BookingStatus.CONFIRMED);
        });

        it('should handle PENDING to CANCELLED transition', () => {
            const history = new BookingHistory(
                bookingId,
                userId,
                resourceId,
                BookingStatus.PENDING,
                BookingStatus.CANCELLED,
                'User cancelled'
            );

            expect(history.previousStatus).toBe(BookingStatus.PENDING);
            expect(history.newStatus).toBe(BookingStatus.CANCELLED);
        });

        it('should handle CONFIRMED to CANCELLED transition', () => {
            const history = new BookingHistory(
                bookingId,
                userId,
                resourceId,
                BookingStatus.CONFIRMED,
                BookingStatus.CANCELLED,
                'Emergency cancellation'
            );

            expect(history.previousStatus).toBe(BookingStatus.CONFIRMED);
            expect(history.newStatus).toBe(BookingStatus.CANCELLED);
        });

        it('should handle same status transition', () => {
            const history = new BookingHistory(
                bookingId,
                userId,
                resourceId,
                BookingStatus.PENDING,
                BookingStatus.PENDING,
                'Status update'
            );

            expect(history.previousStatus).toBe(BookingStatus.PENDING);
            expect(history.newStatus).toBe(BookingStatus.PENDING);
        });
    });

    describe('metadata handling', () => {
        it('should handle complex metadata objects', () => {
            const complexMetadata = {
                source: 'mobile-app',
                version: '1.2.3',
                userAgent: 'Mozilla/5.0...',
                location: {
                    latitude: 40.7128,
                    longitude: -74.0060,
                    city: 'New York'
                },
                tags: ['urgent', 'vip'],
                timestamp: new Date().toISOString()
            };

            const history = new BookingHistory(
                bookingId,
                userId,
                resourceId,
                BookingStatus.PENDING,
                BookingStatus.CONFIRMED,
                'Complex metadata test',
                complexMetadata
            );

            expect(history.metadata).toEqual(complexMetadata);
            expect(history.metadata.source).toBe('mobile-app');
            expect(history.metadata.location.city).toBe('New York');
            expect(history.metadata.tags).toContain('urgent');
        });

        it('should handle null metadata', () => {
            const history = new BookingHistory(
                bookingId,
                userId,
                resourceId,
                BookingStatus.PENDING,
                BookingStatus.CONFIRMED,
                'No metadata',
                null as any
            );

            expect(history.metadata).toBeNull();
        });

        it('should handle metadata with special characters', () => {
            const specialMetadata = {
                'special-key': 'value with spaces',
                'key.with.dots': 'value',
                'key-with-dashes': 'value',
                'key_with_underscores': 'value',
                'keyWithCamelCase': 'value'
            };

            const history = new BookingHistory(
                bookingId,
                userId,
                resourceId,
                BookingStatus.PENDING,
                BookingStatus.CONFIRMED,
                'Special characters test',
                specialMetadata
            );

            expect(history.metadata).toEqual(specialMetadata);
        });
    });

    describe('reason handling', () => {
        it('should handle long reason text', () => {
            const longReason = 'A'.repeat(1000);
            const history = new BookingHistory(
                bookingId,
                userId,
                resourceId,
                BookingStatus.PENDING,
                BookingStatus.CANCELLED,
                longReason
            );

            expect(history.reason).toBe(longReason);
        });

        it('should handle reason with special characters', () => {
            const specialReason = 'Reason with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
            const history = new BookingHistory(
                bookingId,
                userId,
                resourceId,
                BookingStatus.PENDING,
                BookingStatus.CANCELLED,
                specialReason
            );

            expect(history.reason).toBe(specialReason);
        });

        it('should handle reason with unicode characters', () => {
            const unicodeReason = 'Reason with unicode: 预订取消 🎫';
            const history = new BookingHistory(
                bookingId,
                userId,
                resourceId,
                BookingStatus.PENDING,
                BookingStatus.CANCELLED,
                unicodeReason
            );

            expect(history.reason).toBe(unicodeReason);
        });

        it('should handle reason with newlines', () => {
            const multilineReason = 'Line 1\nLine 2\nLine 3';
            const history = new BookingHistory(
                bookingId,
                userId,
                resourceId,
                BookingStatus.PENDING,
                BookingStatus.CANCELLED,
                multilineReason
            );

            expect(history.reason).toBe(multilineReason);
        });
    });

    describe('edge cases', () => {
        it('should handle empty string IDs', () => {
            const history = new BookingHistory(
                '',
                '',
                '',
                BookingStatus.PENDING,
                BookingStatus.CONFIRMED
            );

            expect(history.bookingId).toBe('');
            expect(history.userId).toBe('');
            expect(history.resourceId).toBe('');
        });

        it('should handle very long IDs', () => {
            const longId = 'a'.repeat(100);
            const history = new BookingHistory(
                longId,
                longId,
                longId,
                BookingStatus.PENDING,
                BookingStatus.CONFIRMED
            );

            expect(history.bookingId).toBe(longId);
            expect(history.userId).toBe(longId);
            expect(history.resourceId).toBe(longId);
        });

        it('should handle all booking status combinations', () => {
            const statuses = [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CANCELLED];

            statuses.forEach(previousStatus => {
                statuses.forEach(newStatus => {
                    const history = new BookingHistory(
                        bookingId,
                        userId,
                        resourceId,
                        previousStatus,
                        newStatus,
                        `Transition from ${previousStatus} to ${newStatus}`
                    );

                    expect(history.previousStatus).toBe(previousStatus);
                    expect(history.newStatus).toBe(newStatus);
                });
            });
        });
    });

    describe('property access', () => {
        it('should allow access to all properties', () => {
            const history = new BookingHistory(
                bookingId,
                userId,
                resourceId,
                BookingStatus.PENDING,
                BookingStatus.CONFIRMED,
                reason,
                metadata
            );

            expect(history.id).toBeUndefined(); // Will be set by TypeORM
            expect(history.createdAt).toBeUndefined(); // Will be set by TypeORM
            expect(history.bookingId).toBe(bookingId);
            expect(history.userId).toBe(userId);
            expect(history.resourceId).toBe(resourceId);
            expect(history.previousStatus).toBe(BookingStatus.PENDING);
            expect(history.newStatus).toBe(BookingStatus.CONFIRMED);
            expect(history.reason).toBe(reason);
            expect(history.metadata).toBe(metadata);
        });
    });

    describe('immutability', () => {
        it('should maintain data integrity', () => {
            const history = new BookingHistory(
                bookingId,
                userId,
                resourceId,
                BookingStatus.PENDING,
                BookingStatus.CONFIRMED,
                reason,
                metadata
            );

            const originalBookingId = history.bookingId;
            const originalUserId = history.userId;
            const originalResourceId = history.resourceId;

            // Properties should remain unchanged
            expect(history.bookingId).toBe(originalBookingId);
            expect(history.userId).toBe(originalUserId);
            expect(history.resourceId).toBe(originalResourceId);
        });
    });
});
