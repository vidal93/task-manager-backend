import { GetTasksUseCase } from './get-tasks.use-case';
import { TaskRepository } from '../../domain/repositories/task.repository';
import { Task } from '../../domain/models/task.model';

const mockTask: Task = {
    id: 'task-1',
    title: 'Tarea de prueba',
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

describe('GetTasksUseCase', () => {
    let useCase: GetTasksUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new GetTasksUseCase(mockRepo);
    });

    it('debe retornar las tareas del userId indicado', async () => {
        mockRepo.findAllByUserId.mockResolvedValue([mockTask]);
        const result = await useCase.execute('user-1');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(mockTask.id);
    });

    it('debe retornar un arreglo vacío cuando el usuario no tiene tareas', async () => {
        mockRepo.findAllByUserId.mockResolvedValue([]);
        const result = await useCase.execute('user-1');
        expect(result).toEqual([]);
    });

    it('debe llamar a findAllByUserId con el userId proporcionado', async () => {
        mockRepo.findAllByUserId.mockResolvedValue([]);
        await useCase.execute('user-1');
        expect(mockRepo.findAllByUserId).toHaveBeenCalledWith('user-1');
    });
});
