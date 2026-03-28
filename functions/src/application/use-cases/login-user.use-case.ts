import { signToken } from '../../config/jwt.config';
import { UserRepository } from '../../domain/repositories/user.repository';

export interface LoginUserResult {
    id: string;
    email: string;
    createdAt: Date;
    token: string;
}

export class LoginUserUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(email: string): Promise<LoginUserResult | null> {
        const user = await this.userRepository.findByEmail(email);
        // Si el usuario no existe retornamos null para que la ruta responda 404
        if (!user) return null;
        const token = signToken({ userId: user.id, email: user.email });
        return { ...user, token };
    }
}
