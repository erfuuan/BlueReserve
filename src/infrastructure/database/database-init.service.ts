import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { Resource } from '../../domain/entities/resource.entity';
import { ResourceType } from '../../domain/enums/resource-type.enum';

@Injectable()
export class DatabaseInitService {
    private readonly logger = new Logger(DatabaseInitService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Resource)
        private readonly resourceRepository: Repository<Resource>,
    ) { }

    async initializeDatabase(): Promise<void> {
        this.logger.log('🔍 Checking database initialization...');

        try {
            // Wait a moment for TypeORM to create tables
            await new Promise(resolve => setTimeout(resolve, 6000));

            // Check if we have any users (indicates if database is seeded)
            const userCount = await this.userRepository.count();

            if (userCount === 0) {
                this.logger.log('📊 Database is empty, starting seed process...');
                await this.seedDatabase();
            } else {
                this.logger.log(`✅ Database already initialized with ${userCount} users`);
            }
        } catch (error) {
            // If tables don't exist yet, wait and try again
            if (error.code === '42P01') { // relation does not exist
                this.logger.log('⏳ Tables not ready yet, waiting for TypeORM synchronization...');
                await new Promise(resolve => setTimeout(resolve, 7000));

                try {
                    const userCount = await this.userRepository.count();
                    if (userCount === 0) {
                        this.logger.log('📊 Database is empty, starting seed process...');
                        await this.seedDatabase();
                    } else {
                        this.logger.log(`✅ Database already initialized with ${userCount} users`);
                    }
                } catch (retryError) {
                    this.logger.error('❌ Error during database initialization after retry:', retryError);
                    throw retryError;
                }
            } else {
                this.logger.error('❌ Error during database initialization:', error);
                throw error;
            }
        }
    }

    private async seedDatabase(): Promise<void> {
        this.logger.log('🌱 Seeding database with initial data...');

        try {
            // Create sample users
            const users = [
                {
                    id: 'a3db9897-93d3-46c1-8939-02d33b029950',
                    email: 'john.doe@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '+1234567890',
                },
                {
                    id: 'a3db9897-93d3-46c1-8939-02d33b029951',
                    email: 'jane.smith@example.com',
                    firstName: 'Jane',
                    lastName: 'Smith',
                    phone: '+1234567891',
                },
                {
                    id: 'a3db9897-93d3-46c1-8939-02d33b029952',
                    email: 'bob.johnson@example.com',
                    firstName: 'Bob',
                    lastName: 'Johnson',
                    phone: '+1234567892',
                },
            ];

            for (const userData of users) {
                const existingUser = await this.userRepository.findOne({ where: { id: userData.id } });
                if (!existingUser) {
                    const user = this.userRepository.create(userData);
                    await this.userRepository.save(user);
                    this.logger.log(`👤 Created user: ${userData.email}`);
                }
            }

            // Create sample resources
            const resources = [
                {
                    id: 'a3db9897-93d3-46c1-8939-02d33b029953',
                    name: 'Conference Room A',
                    description: 'Large conference room with projector and whiteboard',
                    type: ResourceType.MEETING_ROOM,
                    capacity: 20,
                    pricePerHour: 50.00,
                    metadata: {
                        hasProjector: true,
                        hasWhiteboard: true,
                        hasVideoConference: true,
                    },
                },
                {
                    id: 'a3db9897-93d3-46c1-8939-02d33b029954',
                    name: 'Conference Room B',
                    description: 'Medium conference room with basic amenities',
                    type: ResourceType.MEETING_ROOM,
                    capacity: 10,
                    pricePerHour: 30.00,
                    metadata: {
                        hasProjector: false,
                        hasWhiteboard: true,
                        hasVideoConference: false,
                    },
                },
                {
                    id: 'a3db9897-93d3-46c1-8939-02d33b029955',
                    name: 'Hotel Room 101',
                    description: 'Deluxe hotel room with king bed',
                    type: ResourceType.HOTEL_ROOM,
                    capacity: 2,
                    pricePerHour: 100.00,
                    metadata: {
                        bedType: 'king',
                        hasBalcony: true,
                        hasMinibar: true,
                    },
                },
                {
                    id: 'a3db9897-93d3-46c1-8939-02d33b029956',
                    name: 'Event Hall',
                    description: 'Large event hall for conferences and weddings',
                    type: ResourceType.CONFERENCE_HALL,
                    capacity: 200,
                    pricePerHour: 500.00,
                    metadata: {
                        hasStage: true,
                        hasSoundSystem: true,
                        hasLighting: true,
                    },
                },
                {
                    id: 'a3db9897-93d3-46c1-8939-02d33b029957',
                    name: 'Workspace Desk 1',
                    description: 'Individual workspace desk in co-working space',
                    type: ResourceType.WORKSPACE,
                    capacity: 1,
                    pricePerHour: 15.00,
                    metadata: {
                        hasMonitor: true,
                        hasKeyboard: true,
                        hasMouse: true,
                    },
                },
            ];

            for (const resourceData of resources) {
                const existingResource = await this.resourceRepository.findOne({ where: { id: resourceData.id } });
                if (!existingResource) {
                    const resource = this.resourceRepository.create(resourceData);
                    await this.resourceRepository.save(resource);
                    this.logger.log(`🏢 Created resource: ${resourceData.name}`);
                }
            }

            this.logger.log('✅ Database seeded successfully!');
            this.logger.log('📊 Sample data created:');
            this.logger.log('   - 3 Users (john.doe@example.com, jane.smith@example.com, bob.johnson@example.com)');
            this.logger.log('   - 5 Resources (Meeting Rooms, Hotel Room, Event Hall, Workspace)');
            this.logger.log('🚀 Database is ready for use!');

        } catch (error) {
            this.logger.error('❌ Error seeding database:', error);
            throw error;
        }
    }
}
