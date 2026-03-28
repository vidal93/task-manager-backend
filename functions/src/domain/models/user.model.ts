// Entidad de dominio
export interface User {
    id: string;
    email: string;
    createdAt: Date;
}

// DTO para registrar un nuevo usuario
export interface CreateUserDto {
    email: string;
}
