import { CreateTaskDto, Task, UpdateTaskDto } from '../models/task.model';

// Contrato del repositorio de tareas
export interface TaskRepository {
    findAllByUserId(userId: string): Promise<Task[]>;
    findById(id: string): Promise<Task | null>;
    create(dto: CreateTaskDto): Promise<Task>;
    update(id: string, dto: UpdateTaskDto): Promise<Task>;
    delete(id: string): Promise<void>;
}
