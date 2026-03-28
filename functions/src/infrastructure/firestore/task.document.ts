import { Timestamp } from 'firebase-admin/firestore';

// Estructura del documento de tarea en Firestore
export interface TaskDocument {
    title: string;
    description: string;
    completed: boolean;
    userId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
