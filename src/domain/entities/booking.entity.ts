import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Resource } from './resource.entity';
import { BookingStatus } from '../enums/booking-status.enum';
import { BookingId } from '../value-objects/booking-id.value-object';
import { TimeSlot } from '../value-objects/time-slot.value-object';

@Entity('bookings')
export class Booking {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'uuid' })
    resourceId: string;

    @Column({ type: 'timestamp' })
    startTime: Date;

    @Column({ type: 'timestamp' })
    endTime: Date;

    @Column({
        type: 'enum',
        enum: BookingStatus,
        default: BookingStatus.PENDING
    })
    status: BookingStatus;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, user => user.bookings)
    user: User;

    @ManyToOne(() => Resource, resource => resource.bookings)
    resource: Resource;

    constructor(
        id?: BookingId,
        userId?: string,
        resourceId?: string,
        timeSlot?: TimeSlot,
        notes?: string
    ) {

        if (id) this.id = id.value;
        if (userId) this.userId = userId;
        if (resourceId) this.resourceId = resourceId;
        if (timeSlot) {
            this.startTime = timeSlot.startTime;
            this.endTime = timeSlot.endTime;
        }
        this.status = BookingStatus.PENDING;
        if (notes) this.notes = notes;

    }

    // Domain methods
    confirm(): void {
        if (this.status !== BookingStatus.PENDING) {
            throw new Error('Only pending bookings can be confirmed');
        }
        this.status = BookingStatus.CONFIRMED;
    }

    cancel(): void {
        if (this.status === BookingStatus.CANCELLED) {
            throw new Error('Booking is already cancelled');
        }
        if (this.status === BookingStatus.COMPLETED) {
            throw new Error('Cannot cancel a completed booking');
        }
        this.status = BookingStatus.CANCELLED;
    }

    /**
     * Determines if this booking overlaps with another booking.
     * Two bookings overlap if they:
     * - Are for the same resource
     * - Are different bookings (not the same instance)
     * - Both are active (not cancelled)
     * - Their time ranges intersect
     * 
     * NOTE: This logic was tricky to get right - had to handle edge cases
     * where bookings start exactly when another ends (they don't overlap)
     */
    isOverlapping(other: Booking): boolean {
        return this.resourceId === other.resourceId &&
            this.id !== other.id &&
            this.status !== BookingStatus.CANCELLED &&
            other.status !== BookingStatus.CANCELLED &&
            this.startTime < other.endTime &&
            this.endTime > other.startTime;
    }

    getTimeSlot(): TimeSlot {
        return new TimeSlot(this.startTime, this.endTime);
    }

    isActive(): boolean {
        return this.status === BookingStatus.CONFIRMED || this.status === BookingStatus.PENDING;
    }
}
