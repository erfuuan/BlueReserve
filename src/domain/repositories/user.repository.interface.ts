import { User } from '../entities/user.entity';

export interface UserRepository {
    save(user: User): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    delete(id: string): Promise<void>;
}
