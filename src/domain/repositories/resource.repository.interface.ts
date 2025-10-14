import { Resource } from '../entities/resource.entity';
import { ResourceType } from '../enums/resource-type.enum';
import { TimeSlot } from '../value-objects/time-slot.value-object';

export interface ResourceRepository {
    save(resource: Resource): Promise<Resource>;
    findById(id: string): Promise<Resource | null>;
    findByType(type: ResourceType): Promise<Resource[]>;
    findAvailable(timeSlot: TimeSlot): Promise<Resource[]>;
    findAll(): Promise<Resource[]>;
    findActive(): Promise<Resource[]>;
    delete(id: string): Promise<void>;
}
