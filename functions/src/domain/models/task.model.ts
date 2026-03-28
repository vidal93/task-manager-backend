// Entidad de dominio
export interface Task {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

// DTO para crear una tarea
export interface CreateTaskDto {
    title: string;
    description: string;
    userId: string;
}

// DTO para actualizar una tarea
export interface UpdateTaskDto {
    title?: string;
    description?: string;
    completed?: boolean;
}

// Tipos de resultado para operaciones sobre una tarea existente
type TaskOperationBase =
    | { status: 'not_found' }
    | { status: 'forbidden' };

export type TaskResult = TaskOperationBase | { status: 'ok'; task: Task };
export type TaskVoidResult = TaskOperationBase | { status: 'ok' };
