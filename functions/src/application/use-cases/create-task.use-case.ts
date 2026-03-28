import { Task } from '../../domain/models/task.model';
import { TaskRepository } from '../../domain/repositories/task.repository';

export class CreateTaskUseCase {
    constructor(private readonly taskRepository: TaskRepository) {}

    async execute(title: string, description: string, userId: string): Promise<Task> {
        return this.taskRepository.create({ title, description, userId });
    }
}
