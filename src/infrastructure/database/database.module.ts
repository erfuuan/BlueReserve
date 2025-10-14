import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../../domain/entities/booking.entity';
import { User } from '../../domain/entities/user.entity';
import { Resource } from '../../domain/entities/resource.entity';
import { DatabaseInitService } from './database-init.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Booking, User, Resource]),
    ],
    providers: [DatabaseInitService],
    exports: [TypeOrmModule, DatabaseInitService],
})
export class DatabaseModule { }
