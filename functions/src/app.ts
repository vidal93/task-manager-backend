import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

// Separar la app de Firebase facilita probarla de forma aislada
export function createApp() {
    const app = express();

    // Aceptar peticiones de cualquier origen
    app.use(cors({ origin: true }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Ruta para saber si el servidor esta respondiendo
    app.get('/health', (_req: Request, res: Response) => {
        res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });

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
