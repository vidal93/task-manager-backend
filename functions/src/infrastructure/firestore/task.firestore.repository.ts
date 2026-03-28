import { Timestamp } from 'firebase-admin/firestore';

import { createConverter, db } from '../../config/firebase.config';
import { CreateTaskDto, Task, UpdateTaskDto } from '../../domain/models/task.model';
import { TaskRepository } from '../../domain/repositories/task.repository';
import { TaskDocument } from './task.document';

const COLLECTION = 'tasks';

const tasksCollection = db
    .collection(COLLECTION)
    .withConverter(createConverter<TaskDocument>());

// Convierte un documento de Firestore al modelo de dominio
function toDomain(id: string, doc: TaskDocument): Task {
    return {
        id,
        title: doc.title,
        description: doc.description,
        completed: doc.completed,
        userId: doc.userId,
        createdAt: doc.createdAt.toDate(),
        updatedAt: doc.updatedAt.toDate(),
    };
}

export class TaskFirestoreRepository implements TaskRepository {
    async findAllByUserId(userId: string): Promise<Task[]> {
        // Filtra por propietario y ordena por mas recientes primero
        const snapshot = await tasksCollection
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map((doc) => toDomain(doc.id, doc.data()));
    }

    async findById(id: string): Promise<Task | null> {
        const doc = await tasksCollection.doc(id).get();
        if (!doc.exists) return null;
        return toDomain(doc.id, doc.data()!);
    }

    async create(dto: CreateTaskDto): Promise<Task> {
        const now = Timestamp.now();
        const document: TaskDocument = {
            title: dto.title,
            description: dto.description,
            completed: false,
            userId: dto.userId,
            createdAt: now,
            updatedAt: now,
        };

        const ref = await tasksCollection.add(document);
        return toDomain(ref.id, document);
    }

    async update(id: string, dto: UpdateTaskDto): Promise<Task> {
        const ref = tasksCollection.doc(id);
        const existing = await ref.get();

        if (!existing.exists) {
            throw new Error(`Tarea con id ${id} no encontrada`);
        }

        await ref.update({ ...dto, updatedAt: Timestamp.now() });

        const updated = await ref.get();
        return toDomain(updated.id, updated.data()!);
    }

    async delete(id: string): Promise<void> {
        await tasksCollection.doc(id).delete();
    }
}
