import { LoginUserUseCase } from './login-user.use-case';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/models/user.model';

const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    createdAt: new Date('2024-01-01'),
};

const mockRepo: jest.Mocked<UserRepository> = {
    findByEmail: jest.fn(),
    create: jest.fn(),
};

describe('LoginUserUseCase', () => {
    let useCase: LoginUserUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new LoginUserUseCase(mockRepo);
    });

    it('debe retornar null cuando el usuario no existe', async () => {
        mockRepo.findByEmail.mockResolvedValue(null);
        const result = await useCase.execute('test@example.com');
        expect(result).toBeNull();
    });

    it('debe llamar a findByEmail con el correo proporcionado', async () => {
        mockRepo.findByEmail.mockResolvedValue(null);
        await useCase.execute('test@example.com');
        expect(mockRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('debe retornar los datos del usuario con token cuando se encuentra', async () => {
        mockRepo.findByEmail.mockResolvedValue(mockUser);
        const result = await useCase.execute('test@example.com');
        expect(result).not.toBeNull();
        expect(result?.id).toBe(mockUser.id);
        expect(result?.email).toBe(mockUser.email);
        expect(result?.token).toBeDefined();
        expect(typeof result?.token).toBe('string');
    });
});
