import { TaskResult, UpdateTaskDto } from '../../domain/models/task.model';
import { TaskRepository } from '../../domain/repositories/task.repository';

export class UpdateTaskUseCase {
    constructor(private readonly taskRepository: TaskRepository) {}

    async execute(id: string, userId: string, dto: UpdateTaskDto): Promise<TaskResult> {
        const task = await this.taskRepository.findById(id);
        if (!task) return { status: 'not_found' };
        // Solo el propietario puede modificar su tarea
        if (task.userId !== userId) return { status: 'forbidden' };
        const updated = await this.taskRepository.update(id, dto);
        return { status: 'ok', task: updated };
    }
}
