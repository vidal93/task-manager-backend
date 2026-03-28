import { TaskVoidResult } from '../../domain/models/task.model';
import { TaskRepository } from '../../domain/repositories/task.repository';

export class DeleteTaskUseCase {
    constructor(private readonly taskRepository: TaskRepository) {}

    async execute(id: string, userId: string): Promise<TaskVoidResult> {
        const task = await this.taskRepository.findById(id);
        if (!task) return { status: 'not_found' };
        // Solo el propietario puede eliminar su tarea
        if (task.userId !== userId) return { status: 'forbidden' };
        await this.taskRepository.delete(id);
        return { status: 'ok' };
    }
}
