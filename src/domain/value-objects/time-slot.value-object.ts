import { BadRequestException } from "@nestjs/common";

export class TimeSlot {
    constructor(
        public readonly startTime: Date,
        public readonly endTime: Date
    ) {
        this.validate();
    }

    private validate(): void {
        if (this.startTime >= this.endTime) {
            throw new BadRequestException('Start time must be before end time');
        }

        if (this.startTime < new Date()) {
            throw new BadRequestException('Cannot book in the past');
        }

        // Check if booking is not too far in the future (e.g., 1 year)
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        if (this.startTime > oneYearFromNow) {
            throw new BadRequestException('Cannot book more than 1 year in advance');
        }
    }

    getDurationInHours(): number {
        return (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60 * 60);
    }

    getDurationInMinutes(): number {
        return (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60);
    }

    overlaps(other: TimeSlot): boolean {
        return this.startTime < other.endTime && this.endTime > other.startTime;
    }

    contains(time: Date): boolean {
        return time >= this.startTime && time <= this.endTime;
    }

    static create(startTime: Date, endTime: Date): TimeSlot {
        return new TimeSlot(startTime, endTime);
    }

    static createFromDuration(startTime: Date, durationInHours: number): TimeSlot {
        const endTime = new Date(startTime.getTime() + (durationInHours * 60 * 60 * 1000));
        return new TimeSlot(startTime, endTime);
    }
}
