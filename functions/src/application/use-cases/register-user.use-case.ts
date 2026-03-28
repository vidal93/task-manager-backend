import { signToken } from '../../config/jwt.config';
import { UserRepository } from '../../domain/repositories/user.repository';

export interface RegisterUserResult {
    id: string;
    email: string;
    createdAt: Date;
    token: string;
}

export class RegisterUserUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(email: string): Promise<RegisterUserResult | 'conflict'> {
        // Si el email ya esta registrado avisamos para que la ruta responda 409
        const existing = await this.userRepository.findByEmail(email);
        if (existing) return 'conflict';
        const user = await this.userRepository.create({ email });
        const token = signToken({ userId: user.id, email: user.email });
        return { ...user, token };
    }
}
