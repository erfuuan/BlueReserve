import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Booking } from './booking.entity';
import { ResourceType } from '../enums/resource-type.enum';

@Entity('resources')
export class Resource {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: ResourceType
    })
    type: ResourceType;

    @Column({ type: 'int', default: 1 })
    capacity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    pricePerHour: number;

    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Booking, booking => booking.resource)
    bookings: Booking[];

    constructor(
        id: string,
        name: string,
        type: ResourceType,
        capacity: number = 1,
        description?: string,
        pricePerHour?: number,
        metadata?: Record<string, any>
    ) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.description = description;
        this.pricePerHour = pricePerHour;
        this.metadata = metadata;
        this.isActive = true;
    }

    isAvailable(timeSlot: { startTime: Date; endTime: Date }): boolean {
        if (!this.isActive) return false;

        // Check if there are any overlapping bookings
        const overlappingBookings = this.bookings?.filter(booking =>
            booking.isActive() &&
            booking.startTime < timeSlot.endTime &&
            booking.endTime > timeSlot.startTime
        ) || [];

        return overlappingBookings.length < this.capacity;
    }

    getAvailableCapacity(timeSlot: { startTime: Date; endTime: Date }): number {
        if (!this.isActive) return 0;

        const overlappingBookings = this.bookings?.filter(booking =>
            booking.isActive() &&
            booking.startTime < timeSlot.endTime &&
            booking.endTime > timeSlot.startTime
        ) || [];

        return Math.max(0, this.capacity - overlappingBookings.length);
    }
}
