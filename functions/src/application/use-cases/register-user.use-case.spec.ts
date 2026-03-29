import { RegisterUserUseCase } from './register-user.use-case';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/models/user.model';

const mockUser: User = {
    id: 'user-1',
    email: 'new@example.com',
    createdAt: new Date('2024-01-01'),
};

const mockRepo: jest.Mocked<UserRepository> = {
    findByEmail: jest.fn(),
    create: jest.fn(),
};

describe('RegisterUserUseCase', () => {
    let useCase: RegisterUserUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new RegisterUserUseCase(mockRepo);
    });

    it('debe retornar conflict cuando el correo ya existe', async () => {
        mockRepo.findByEmail.mockResolvedValue(mockUser);
        const result = await useCase.execute('new@example.com');
        expect(result).toBe('conflict');
        expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('debe crear el usuario y retornar los datos con token cuando el correo es nuevo', async () => {
        mockRepo.findByEmail.mockResolvedValue(null);
        mockRepo.create.mockResolvedValue(mockUser);
        const result = await useCase.execute('new@example.com');
        expect(result).not.toBe('conflict');
        if (result !== 'conflict') {
            expect(result.id).toBe(mockUser.id);
            expect(result.email).toBe(mockUser.email);
            expect(result.token).toBeDefined();
        }
    });

    it('debe llamar a create con el correo proporcionado', async () => {
        mockRepo.findByEmail.mockResolvedValue(null);
        mockRepo.create.mockResolvedValue(mockUser);
        await useCase.execute('new@example.com');
        expect(mockRepo.create).toHaveBeenCalledWith({ email: 'new@example.com' });
    });
});
