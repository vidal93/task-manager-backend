import { CreateTaskUseCase } from './create-task.use-case';
import { TaskRepository } from '../../domain/repositories/task.repository';
import { Task } from '../../domain/models/task.model';

const mockTask: Task = {
    id: 'task-1',
    title: 'Nueva tarea',
    description: 'Descripción',
    completed: false,
    userId: 'user-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
};

const mockRepo: jest.Mocked<TaskRepository> = {
    findAllByUserId: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

describe('CreateTaskUseCase', () => {
    let useCase: CreateTaskUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new CreateTaskUseCase(mockRepo);
    });

    it('debe crear y retornar la nueva tarea', async () => {
        mockRepo.create.mockResolvedValue(mockTask);
        const result = await useCase.execute('Nueva tarea', 'Descripción', 'user-1');
        expect(result).toEqual(mockTask);
    });

    it('debe llamar a create con el DTO correcto', async () => {
        mockRepo.create.mockResolvedValue(mockTask);
        await useCase.execute('Nueva tarea', 'Descripción', 'user-1');
        expect(mockRepo.create).toHaveBeenCalledWith({
            title: 'Nueva tarea',
            description: 'Descripción',
            userId: 'user-1',
        });
    });
});
