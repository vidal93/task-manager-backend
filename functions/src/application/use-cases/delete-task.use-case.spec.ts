import { DeleteTaskUseCase } from './delete-task.use-case';
import { TaskRepository } from '../../domain/repositories/task.repository';
import { Task } from '../../domain/models/task.model';

const mockTask: Task = {
    id: 'task-1',
    title: 'Tarea a eliminar',
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

describe('DeleteTaskUseCase', () => {
    let useCase: DeleteTaskUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new DeleteTaskUseCase(mockRepo);
    });

    it('debe retornar not_found cuando la tarea no existe', async () => {
        mockRepo.findById.mockResolvedValue(null);
        const result = await useCase.execute('task-1', 'user-1');
        expect(result.status).toBe('not_found');
        expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    it('debe retornar forbidden cuando la tarea pertenece a otro usuario', async () => {
        mockRepo.findById.mockResolvedValue({ ...mockTask, userId: 'other-user' });
        const result = await useCase.execute('task-1', 'user-1');
        expect(result.status).toBe('forbidden');
        expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    it('debe retornar ok y llamar a delete cuando el propietario elimina', async () => {
        mockRepo.findById.mockResolvedValue(mockTask);
        mockRepo.delete.mockResolvedValue(undefined);
        const result = await useCase.execute('task-1', 'user-1');
        expect(result.status).toBe('ok');
        expect(mockRepo.delete).toHaveBeenCalledWith('task-1');
    });
});
