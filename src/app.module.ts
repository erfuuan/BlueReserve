import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { BookingModule } from './modules/booking.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { LoggingModule } from './infrastructure/logging/logging.module';
import { Booking } from './domain/entities/booking.entity';
import { User } from './domain/entities/user.entity';
import { Resource } from './domain/entities/resource.entity';
import { BookingHistory } from './domain/entities/booking-history.entity';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('DB_HOST', 'localhost'),
                port: configService.get<number>('DB_PORT', 5432),
                username: configService.get<string>('DB_USERNAME', 'postgres'),
                password: configService.get<string>('DB_PASSWORD', 'password'),
                database: configService.get<string>('DB_DATABASE', 'blu_reserve'),
                entities: [Booking, User, Resource, BookingHistory],
                synchronize: configService.get<string>('NODE_ENV') !== 'production',
                logging: false,

                autoLoadEntities: true,
            }),
            inject: [ConfigService],
        }),

        CqrsModule.forRoot(),
        LoggingModule,
        DatabaseModule,
        BookingModule,
    ],
    controllers: [],
    providers: [
    ],
})
export class AppModule { }
