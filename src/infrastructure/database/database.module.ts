import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../../domain/entities/booking.entity';
import { User } from '../../domain/entities/user.entity';
import { Resource } from '../../domain/entities/resource.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Booking, User, Resource]),
    ],
    exports: [TypeOrmModule],
})
export class DatabaseModule { }
