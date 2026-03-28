import { CreateUserDto, User } from '../models/user.model';

// Contrato del repositorio de usuarios
export interface UserRepository {
    findByEmail(email: string): Promise<User | null>;
    create(dto: CreateUserDto): Promise<User>;
}
