import request from 'supertest';

jest.mock('../../config/firebase.config', () => ({
    db: {},
    createConverter: jest.fn(() => ({})),
}));

// task.routes también usa Firestore, hay que silenciarlo para no romper el setup
jest.mock('../../infrastructure/firestore/task.firestore.repository', () => ({
    TaskFirestoreRepository: jest.fn().mockImplementation(() => ({})),
}));

// El repo de usuarios con metodos controlables para simular respuestas en cada test
jest.mock('../../infrastructure/firestore/user.firestore.repository', () => ({
    UserFirestoreRepository: jest.fn().mockImplementation(() => ({
        findByEmail: jest.fn(),
        create: jest.fn(),
    })),
}));

import { UserFirestoreRepository } from '../../infrastructure/firestore/user.firestore.repository';
import { createApp } from '../../app';

// La app instancia el repositorio al cargar las rutas asi que el mock ya está listo aqui
const app = createApp();

// Capturamos la instancia que creó user.routes.ts para controlar sus respuestas
const repo = (UserFirestoreRepository as jest.Mock).mock.results[0].value as {
    findByEmail: jest.Mock;
    create: jest.Mock;
};

const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    createdAt: new Date('2024-01-01'),
};

describe('User routes', () => {
    beforeEach(() => {
        repo.findByEmail.mockReset();
        repo.create.mockReset();
    });

    describe('GET /users?email=', () => {
        it('debe retornar 400 cuando no se proporciona el correo', async () => {
            const res = await request(app).get('/users');
            expect(res.status).toBe(400);
        });

        it('debe retornar 404 cuando el usuario no existe', async () => {
            repo.findByEmail.mockResolvedValue(null);
            const res = await request(app).get('/users?email=notfound@example.com');
            expect(res.status).toBe(404);
        });

        it('debe retornar 200 con los datos del usuario y token cuando se encuentra', async () => {
            repo.findByEmail.mockResolvedValue(mockUser);
            const res = await request(app).get('/users?email=test@example.com');
            expect(res.status).toBe(200);
            expect(res.body.data.email).toBe(mockUser.email);
            expect(res.body.token).toBeDefined();
        });
    });

    describe('POST /users', () => {
        it('debe retornar 400 cuando no se proporciona el correo', async () => {
            const res = await request(app).post('/users').send({});
            expect(res.status).toBe(400);
        });

        it('debe retornar 409 cuando el usuario ya existe', async () => {
            repo.findByEmail.mockResolvedValue(mockUser);
            const res = await request(app).post('/users').send({ email: 'test@example.com' });
            expect(res.status).toBe(409);
        });

        it('debe retornar 201 con los datos del usuario y token al crear', async () => {
            repo.findByEmail.mockResolvedValue(null);
            repo.create.mockResolvedValue(mockUser);
            const res = await request(app).post('/users').send({ email: 'new@example.com' });
            expect(res.status).toBe(201);
            expect(res.body.data.email).toBe(mockUser.email);
            expect(res.body.token).toBeDefined();
        });
    });
});
