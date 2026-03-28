import { Task } from '../../domain/models/task.model';
import { TaskRepository } from '../../domain/repositories/task.repository';

export class GetTasksUseCase {
    constructor(private readonly taskRepository: TaskRepository) {}

    async execute(userId: string): Promise<Task[]> {
        return this.taskRepository.findAllByUserId(userId);
    }
}
