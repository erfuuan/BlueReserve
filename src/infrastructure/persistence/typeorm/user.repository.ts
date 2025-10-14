import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository as IUserRepository } from '@/domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>,
    ) { }

    async save(user: User): Promise<User> {
        return this.repository.save(user);
    }

    async findById(id: string): Promise<User | null> {
        return this.repository.findOne({ where: { id } });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.repository.findOne({ where: { email } });
    }

    async findAll(): Promise<User[]> {
        return this.repository.find({ order: { createdAt: 'DESC' } });
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }
}
