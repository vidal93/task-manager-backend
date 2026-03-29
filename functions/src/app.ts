import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';

import taskRoutes from './presentation/routes/task.routes';
import userRoutes from './presentation/routes/user.routes';

const ALLOWED_ORIGINS = [
    'http://localhost:4200',
    'https://task-manager-app-900fc.web.app',
    'https://task-manager-app-900fc.firebaseapp.com',
];

// Separar la app de Firebase facilita probarla de forma aislada
export function createApp() {
    const app = express();

    // Solo los orígenes conocidos pueden consumir la API
    app.use(cors({ origin: ALLOWED_ORIGINS }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Ruta para saber si el servidor esta respondiendo
    app.get('/health', (_req: Request, res: Response) => {
        res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    app.use('/users', userRoutes);
    app.use('/tasks', taskRoutes);

    // Responder con 404 si la ruta no existe
    app.use((_req: Request, res: Response) => {
        res.status(404).json({ error: 'Ruta no encontrada' });
    });

    // Capturar cualquier error no controlado
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
        res.status(500).json({ error: 'Error interno del servidor' });
    });

    return app;
}
