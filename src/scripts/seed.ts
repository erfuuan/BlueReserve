import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../domain/entities/user.entity';
import { Resource } from '../domain/entities/resource.entity';
import { ResourceType } from '../domain/enums/resource-type.enum';

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const logger = new Logger('SeedScript');

    const userRepository = app.get(getRepositoryToken(User));
    const resourceRepository = app.get(getRepositoryToken(Resource));

    try {
        // Create sample users
        const users = [
            {
                id: 'a3db9897-93d3-46c1-8939-02d33b029950', // John Doe
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
            const existingUser = await userRepository.findOne({ where: { id: userData.id } });
            if (!existingUser) {
                const user = userRepository.create(userData);
                await userRepository.save(user);
                logger.log(`Created user: ${userData.email}`);
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
            const existingResource = await resourceRepository.findOne({ where: { id: resourceData.id } });
            if (!existingResource) {
                const resource = resourceRepository.create(resourceData);
                await resourceRepository.save(resource);
                logger.log(`Created resource: ${resourceData.name}`);
            }
        }

        logger.log('✅ Seed data created successfully!');
        logger.log('📊 Sample data:');
        logger.log('   - 3 Users');
        logger.log('   - 5 Resources (Meeting Rooms, Hotel Room, Event Hall, Workspace)');
        logger.log('\n🚀 You can now test the API endpoints!');

    } catch (error) {
        logger.error('❌ Error seeding data:', error);
    } finally {
        await app.close();
    }
}

seed();
