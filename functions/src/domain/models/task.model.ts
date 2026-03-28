// Entidad de dominio
export interface Task {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    userId: string;
    createdAt: string;
    updatedAt: string;
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
