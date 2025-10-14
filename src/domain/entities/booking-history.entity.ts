import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { BookingStatus } from '../enums/booking-status.enum';

@Entity('booking_history')
export class BookingHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    bookingId: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'uuid' })
    resourceId: string;

    @Column({
        type: 'enum',
        enum: BookingStatus
    })
    previousStatus: BookingStatus;

    @Column({
        type: 'enum',
        enum: BookingStatus
    })
    newStatus: BookingStatus;

    @Column({ type: 'text', nullable: true })
    reason: string;

    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;

    @CreateDateColumn()
    createdAt: Date;

    constructor(
        bookingId: string,
        userId: string,
        resourceId: string,
        previousStatus: BookingStatus,
        newStatus: BookingStatus,
        reason?: string,
        metadata?: Record<string, any>
    ) {
        this.bookingId = bookingId;
        this.userId = userId;
        this.resourceId = resourceId;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.reason = reason;
        this.metadata = metadata;
    }
}
