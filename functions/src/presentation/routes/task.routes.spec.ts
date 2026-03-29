import request from 'supertest';

jest.mock('../../config/firebase.config', () => ({
    db: {},
    createConverter: jest.fn(() => ({})),
}));

// user.routes también usa Firestore, hay que silenciarlo para no romper el setup
jest.mock('../../infrastructure/firestore/user.firestore.repository', () => ({
    UserFirestoreRepository: jest.fn().mockImplementation(() => ({})),
}));

// El repo de tareas con métodos controlables para simular respuestas en cada test
jest.mock('../../infrastructure/firestore/task.firestore.repository', () => ({
    TaskFirestoreRepository: jest.fn().mockImplementation(() => ({
        findAllByUserId: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    })),
}));

import { TaskFirestoreRepository } from '../../infrastructure/firestore/task.firestore.repository';
import { createApp } from '../../app';
import { signToken } from '../../config/jwt.config';

// La app instancia el repositorio al cargar las rutas, así que el mock ya está listo aquí
const app = createApp();

// Capturamos la instancia que creó task.routes.ts para controlar sus respuestas
const repo = (TaskFirestoreRepository as jest.Mock).mock.results[0].value as {
    findAllByUserId: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
};

const validToken = signToken({ userId: 'user-1', email: 'test@example.com' });
const authHeader = { Authorization: `Bearer ${validToken}` };

const mockTask = {
    id: 'task-1',
    title: 'Test task',
    description: 'Desc',
    completed: false,
    userId: 'user-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
};

describe('Task routes', () => {
    beforeEach(() => {
        repo.findAllByUserId.mockReset();
        repo.findById.mockReset();
        repo.create.mockReset();
        repo.update.mockReset();
        repo.delete.mockReset();
    });

    describe('Autenticación', () => {
        it('debe retornar 401 cuando no se provee token', async () => {
            const res = await request(app).get('/tasks');
            expect(res.status).toBe(401);
        });
    });

    describe('GET /tasks', () => {
        it('debe retornar 200 con la lista de tareas', async () => {
            repo.findAllByUserId.mockResolvedValue([mockTask]);
            const res = await request(app).get('/tasks').set(authHeader);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
        });
    });

    describe('POST /tasks', () => {
        it('debe retornar 400 cuando falta el título', async () => {
            const res = await request(app)
                .post('/tasks')
                .set(authHeader)
                .send({ description: 'Desc' });
            expect(res.status).toBe(400);
        });

        it('debe retornar 201 con la tarea creada', async () => {
            repo.create.mockResolvedValue(mockTask);
            const res = await request(app)
                .post('/tasks')
                .set(authHeader)
                .send({ title: 'Test task', description: 'Desc' });
            expect(res.status).toBe(201);
            expect(res.body.data.title).toBe(mockTask.title);
        });
    });

    describe('PUT /tasks/:id', () => {
        it('debe retornar 200 con la tarea actualizada cuando el propietario actualiza', async () => {
            repo.findById.mockResolvedValue(mockTask);
            repo.update.mockResolvedValue({ ...mockTask, completed: true });
            const res = await request(app)
                .put('/tasks/task-1')
                .set(authHeader)
                .send({ completed: true });
            expect(res.status).toBe(200);
            expect(res.body.data.completed).toBe(true);
        });

        it('debe retornar 404 cuando la tarea no existe', async () => {
            repo.findById.mockResolvedValue(null);
            const res = await request(app)
                .put('/tasks/nonexistent')
                .set(authHeader)
                .send({ completed: true });
            expect(res.status).toBe(404);
        });

        it('debe retornar 403 cuando la tarea pertenece a otro usuario', async () => {
            repo.findById.mockResolvedValue({ ...mockTask, userId: 'other-user' });
            const res = await request(app)
                .put('/tasks/task-1')
                .set(authHeader)
                .send({ completed: true });
            expect(res.status).toBe(403);
        });
    });

    describe('DELETE /tasks/:id', () => {
        it('debe retornar 204 al eliminar correctamente', async () => {
            repo.findById.mockResolvedValue(mockTask);
            repo.delete.mockResolvedValue(undefined);
            const res = await request(app).delete('/tasks/task-1').set(authHeader);
            expect(res.status).toBe(204);
        });

        it('debe retornar 403 cuando la tarea pertenece a otro usuario', async () => {
            repo.findById.mockResolvedValue({ ...mockTask, userId: 'other-user' });
            const res = await request(app).delete('/tasks/task-1').set(authHeader);
            expect(res.status).toBe(403);
        });
    });
});
