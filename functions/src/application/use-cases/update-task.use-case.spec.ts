import { UpdateTaskUseCase } from './update-task.use-case';
import { TaskRepository } from '../../domain/repositories/task.repository';
import { Task } from '../../domain/models/task.model';

const mockTask: Task = {
    id: 'task-1',
    title: 'Tarea original',
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

describe('UpdateTaskUseCase', () => {
    let useCase: UpdateTaskUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new UpdateTaskUseCase(mockRepo);
    });

    it('debe retornar not_found cuando la tarea no existe', async () => {
        mockRepo.findById.mockResolvedValue(null);
        const result = await useCase.execute('task-1', 'user-1', { completed: true });
        expect(result.status).toBe('not_found');
    });

    it('debe retornar forbidden cuando la tarea pertenece a otro usuario', async () => {
        mockRepo.findById.mockResolvedValue({ ...mockTask, userId: 'other-user' });
        const result = await useCase.execute('task-1', 'user-1', { completed: true });
        expect(result.status).toBe('forbidden');
        expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('debe retornar ok con la tarea actualizada cuando el propietario actualiza', async () => {
        const updatedTask = { ...mockTask, completed: true };
        mockRepo.findById.mockResolvedValue(mockTask);
        mockRepo.update.mockResolvedValue(updatedTask);
        const result = await useCase.execute('task-1', 'user-1', { completed: true });
        expect(result.status).toBe('ok');
        if (result.status === 'ok') {
            expect(result.task.completed).toBe(true);
        }
    });

    it('debe llamar a update con los argumentos correctos', async () => {
        mockRepo.findById.mockResolvedValue(mockTask);
        mockRepo.update.mockResolvedValue(mockTask);
        await useCase.execute('task-1', 'user-1', { title: 'Nuevo titulo' });
        expect(mockRepo.update).toHaveBeenCalledWith('task-1', { title: 'Nuevo titulo' });
    });
});
