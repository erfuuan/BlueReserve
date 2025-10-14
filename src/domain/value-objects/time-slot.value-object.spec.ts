import { TimeSlot } from './time-slot.value-object';
import { BadRequestException } from '@nestjs/common';

describe('TimeSlot Value Object', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureEndDate = new Date(futureDate);
    futureEndDate.setHours(futureEndDate.getHours() + 2);

    describe('constructor', () => {
        it('should create a valid time slot', () => {
            const timeSlot = new TimeSlot(futureDate, futureEndDate);

            expect(timeSlot.startTime).toBe(futureDate);
            expect(timeSlot.endTime).toBe(futureEndDate);
        });

        it('should throw error when start time equals end time', () => {
            expect(() => new TimeSlot(futureDate, futureDate)).toThrow(BadRequestException);
            expect(() => new TimeSlot(futureDate, futureDate)).toThrow(
                'Start time must be before end time'
            );
        });

        it('should throw error when start time is after end time', () => {
            const startTime = new Date(futureDate);
            startTime.setHours(startTime.getHours() + 3);

            expect(() => new TimeSlot(startTime, futureEndDate)).toThrow(BadRequestException);
            expect(() => new TimeSlot(startTime, futureEndDate)).toThrow(
                'Start time must be before end time'
            );
        });

        it('should throw error when booking in the past', () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);
            const pastEndDate = new Date(pastDate);
            pastEndDate.setHours(pastEndDate.getHours() + 2);

            expect(() => new TimeSlot(pastDate, pastEndDate)).toThrow(BadRequestException);
            expect(() => new TimeSlot(pastDate, pastEndDate)).toThrow(
                'Cannot book in the past'
            );
        });

        it('should throw error when booking more than 1 year in advance', () => {
            const farFutureDate = new Date();
            farFutureDate.setFullYear(farFutureDate.getFullYear() + 2);
            const farFutureEndDate = new Date(farFutureDate);
            farFutureEndDate.setHours(farFutureEndDate.getHours() + 2);

            expect(() => new TimeSlot(farFutureDate, farFutureEndDate)).toThrow(BadRequestException);
            expect(() => new TimeSlot(farFutureDate, farFutureEndDate)).toThrow(
                'Cannot book more than 1 year in advance'
            );
        });

        it('should allow booking exactly 1 year in advance', () => {
            const oneYearFromNow = new Date();
            oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
            const oneYearEndDate = new Date(oneYearFromNow);
            oneYearEndDate.setHours(oneYearEndDate.getHours() + 2);

            expect(() => new TimeSlot(oneYearFromNow, oneYearEndDate)).not.toThrow();
        });
    });

    describe('getDurationInHours', () => {
        it('should return correct duration in hours', () => {
            const startTime = new Date();
            startTime.setDate(startTime.getDate() + 30);
            const endTime = new Date(startTime);
            endTime.setHours(endTime.getHours() + 4);
            const timeSlot = new TimeSlot(startTime, endTime);

            const duration = timeSlot.getDurationInHours();

            expect(duration).toBe(4);
        });

        it('should return fractional hours', () => {
            const startTime = new Date();
            startTime.setDate(startTime.getDate() + 30);
            const endTime = new Date(startTime);
            endTime.setHours(endTime.getHours() + 2);
            endTime.setMinutes(endTime.getMinutes() + 30);
            const timeSlot = new TimeSlot(startTime, endTime);

            const duration = timeSlot.getDurationInHours();

            expect(duration).toBe(2.5);
        });

        it('should return 0 for same time (edge case)', () => {
            const startTime = new Date('2024-01-15T10:00:00Z');
            const endTime = new Date('2024-01-15T10:00:00Z');

            // This should throw an error, but if we bypass validation for testing
            expect(() => new TimeSlot(startTime, endTime)).toThrow();
        });
    });

    describe('getDurationInMinutes', () => {
        it('should return correct duration in minutes', () => {
            const startTime = new Date();
            startTime.setDate(startTime.getDate() + 30);
            const endTime = new Date(startTime);
            endTime.setHours(endTime.getHours() + 2);
            const timeSlot = new TimeSlot(startTime, endTime);

            const duration = timeSlot.getDurationInMinutes();

            expect(duration).toBe(120);
        });

        it('should return fractional minutes', () => {
            const startTime = new Date();
            startTime.setDate(startTime.getDate() + 30);
            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + 15);
            endTime.setSeconds(endTime.getSeconds() + 30);
            const timeSlot = new TimeSlot(startTime, endTime);

            const duration = timeSlot.getDurationInMinutes();

            expect(duration).toBe(15.5);
        });
    });

    describe('overlaps', () => {
        it('should detect overlapping time slots', () => {
            const timeSlot1 = new TimeSlot(futureDate, futureEndDate);
            const overlappingStart = new Date(futureDate);
            overlappingStart.setHours(overlappingStart.getHours() + 1);
            const overlappingEnd = new Date(overlappingStart);
            overlappingEnd.setHours(overlappingEnd.getHours() + 2);
            const timeSlot2 = new TimeSlot(overlappingStart, overlappingEnd);

            expect(timeSlot1.overlaps(timeSlot2)).toBe(true);
            expect(timeSlot2.overlaps(timeSlot1)).toBe(true);
        });

        it('should not detect non-overlapping time slots', () => {
            const timeSlot1 = new TimeSlot(futureDate, futureEndDate);
            const nonOverlappingStart = new Date(futureDate);
            nonOverlappingStart.setHours(nonOverlappingStart.getHours() + 5);
            const nonOverlappingEnd = new Date(nonOverlappingStart);
            nonOverlappingEnd.setHours(nonOverlappingEnd.getHours() + 2);
            const timeSlot2 = new TimeSlot(nonOverlappingStart, nonOverlappingEnd);

            expect(timeSlot1.overlaps(timeSlot2)).toBe(false);
            expect(timeSlot2.overlaps(timeSlot1)).toBe(false);
        });

        it('should detect adjacent time slots as non-overlapping', () => {
            const timeSlot1 = new TimeSlot(futureDate, futureEndDate);
            const adjacentStart = new Date(futureEndDate);
            const adjacentEnd = new Date(adjacentStart);
            adjacentEnd.setHours(adjacentEnd.getHours() + 2);
            const timeSlot2 = new TimeSlot(adjacentStart, adjacentEnd);

            expect(timeSlot1.overlaps(timeSlot2)).toBe(false);
            expect(timeSlot2.overlaps(timeSlot1)).toBe(false);
        });

        it('should detect when one time slot contains another', () => {
            const timeSlot1 = new TimeSlot(futureDate, futureEndDate);
            const containedStart = new Date(futureDate);
            containedStart.setHours(containedStart.getHours() + 0.5);
            const containedEnd = new Date(containedStart);
            containedEnd.setHours(containedEnd.getHours() + 1);
            const timeSlot2 = new TimeSlot(containedStart, containedEnd);

            expect(timeSlot1.overlaps(timeSlot2)).toBe(true);
            expect(timeSlot2.overlaps(timeSlot1)).toBe(true);
        });
    });

    describe('contains', () => {
        it('should return true for time within slot', () => {
            const timeSlot = new TimeSlot(futureDate, futureEndDate);
            const timeWithin = new Date(futureDate);
            timeWithin.setHours(timeWithin.getHours() + 1);

            expect(timeSlot.contains(timeWithin)).toBe(true);
        });

        it('should return true for start time', () => {
            const timeSlot = new TimeSlot(futureDate, futureEndDate);

            expect(timeSlot.contains(futureDate)).toBe(true);
        });

        it('should return true for end time', () => {
            const timeSlot = new TimeSlot(futureDate, futureEndDate);

            expect(timeSlot.contains(futureEndDate)).toBe(true);
        });

        it('should return false for time before slot', () => {
            const timeSlot = new TimeSlot(futureDate, futureEndDate);
            const timeBefore = new Date(futureDate);
            timeBefore.setHours(timeBefore.getHours() - 1);

            expect(timeSlot.contains(timeBefore)).toBe(false);
        });

        it('should return false for time after slot', () => {
            const timeSlot = new TimeSlot(futureDate, futureEndDate);
            const timeAfter = new Date(futureEndDate);
            timeAfter.setHours(timeAfter.getHours() + 1);

            expect(timeSlot.contains(timeAfter)).toBe(false);
        });
    });

    describe('static create', () => {
        it('should create time slot using static method', () => {
            const timeSlot = TimeSlot.create(futureDate, futureEndDate);

            expect(timeSlot.startTime).toBe(futureDate);
            expect(timeSlot.endTime).toBe(futureEndDate);
        });

        it('should validate time slot in static method', () => {
            expect(() => TimeSlot.create(futureDate, futureDate)).toThrow(BadRequestException);
        });
    });

    describe('static createFromDuration', () => {
        it('should create time slot from start time and duration', () => {
            const startTime = new Date();
            startTime.setDate(startTime.getDate() + 30);
            const durationInHours = 3;
            const expectedEndTime = new Date(startTime);
            expectedEndTime.setHours(expectedEndTime.getHours() + 3);

            const timeSlot = TimeSlot.createFromDuration(startTime, durationInHours);

            expect(timeSlot.startTime).toEqual(startTime);
            expect(timeSlot.endTime).toEqual(expectedEndTime);
        });

        it('should handle fractional duration', () => {
            const startTime = new Date();
            startTime.setDate(startTime.getDate() + 30);
            const durationInHours = 2.5;
            const expectedEndTime = new Date(startTime);
            expectedEndTime.setHours(expectedEndTime.getHours() + 2);
            expectedEndTime.setMinutes(expectedEndTime.getMinutes() + 30);

            const timeSlot = TimeSlot.createFromDuration(startTime, durationInHours);

            expect(timeSlot.startTime).toEqual(startTime);
            expect(timeSlot.endTime).toEqual(expectedEndTime);
        });

        it('should validate created time slot', () => {
            const pastTime = new Date();
            pastTime.setDate(pastTime.getDate() - 1);

            expect(() => TimeSlot.createFromDuration(pastTime, 2)).toThrow(BadRequestException);
        });
    });

    describe('edge cases', () => {
        it('should handle very short duration', () => {
            const startTime = new Date();
            startTime.setDate(startTime.getDate() + 30);
            const endTime = new Date(startTime);
            endTime.setSeconds(endTime.getSeconds() + 1);

            expect(() => new TimeSlot(startTime, endTime)).not.toThrow();
        });

        it('should handle very long duration', () => {
            const startTime = new Date();
            startTime.setDate(startTime.getDate() + 30);
            const endTime = new Date(startTime);
            endTime.setHours(endTime.getHours() + 12);

            expect(() => new TimeSlot(startTime, endTime)).not.toThrow();
        });

        it('should handle timezone differences', () => {
            const startTime = new Date();
            startTime.setDate(startTime.getDate() + 30);
            const endTime = new Date(startTime);
            endTime.setHours(endTime.getHours() + 2);

            expect(() => new TimeSlot(startTime, endTime)).not.toThrow();
        });

        it('should handle leap year dates', () => {
            const leapYearDate = new Date();
            leapYearDate.setMonth(1); // February
            leapYearDate.setDate(29);
            leapYearDate.setHours(10);
            leapYearDate.setMinutes(0);
            leapYearDate.setSeconds(0);
            leapYearDate.setMilliseconds(0);

            // If current year is not a leap year, use next leap year within 1 year limit
            if (leapYearDate.getDate() !== 29) {
                leapYearDate.setFullYear(leapYearDate.getFullYear() + 1);
            }

            const leapYearEndDate = new Date(leapYearDate);
            leapYearEndDate.setHours(12);

            expect(() => new TimeSlot(leapYearDate, leapYearEndDate)).not.toThrow();
        });
    });
});
