import { Router, Request, Response } from 'express';

import { CreateTaskUseCase } from '../../application/use-cases/create-task.use-case';
import { DeleteTaskUseCase } from '../../application/use-cases/delete-task.use-case';
import { GetTasksUseCase } from '../../application/use-cases/get-tasks.use-case';
import { UpdateTaskUseCase } from '../../application/use-cases/update-task.use-case';
import { UpdateTaskDto } from '../../domain/models/task.model';
import { TaskFirestoreRepository } from '../../infrastructure/firestore/task.firestore.repository';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const taskRepository = new TaskFirestoreRepository();
const getTasks = new GetTasksUseCase(taskRepository);
const createTask = new CreateTaskUseCase(taskRepository);
const updateTask = new UpdateTaskUseCase(taskRepository);
const deleteTask = new DeleteTaskUseCase(taskRepository);

// Todas las rutas de tareas requieren autenticacion
router.use(authMiddleware);

// Obtener todas las tareas del usuario autenticado
router.get('/', async (req: Request, res: Response) => {
    try {
        const tasks = await getTasks.execute(req.userId!);
        res.status(200).json({ data: tasks });
    } catch {
        res.status(500).json({ error: 'Error al obtener tareas' });
    }
});

// Crear nueva tarea para el usuario autenticado
router.post('/', async (req: Request, res: Response) => {
    const { title, description } = req.body as Record<string, unknown>;

    if (!title || typeof title !== 'string') {
        res.status(400).json({ error: 'El campo title es requerido' });
        return;
    }

    try {
        const task = await createTask.execute(
            title.trim(),
            typeof description === 'string' ? description : '',
            req.userId!,
        );
        res.status(201).json({ data: task });
    } catch {
        res.status(500).json({ error: 'Error al crear tarea' });
    }
});

// Actualizar una tarea existente
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, completed } = req.body as Record<string, unknown>;

    const updates: UpdateTaskDto = {};

    if (title !== undefined) {
        if (typeof title !== 'string' || title.trim() === '') {
            res.status(400).json({ error: 'El campo title debe ser texto no vacío' });
            return;
        }
        updates.title = title.trim();
    }

    if (description !== undefined) {
        if (typeof description !== 'string') {
            res.status(400).json({ error: 'El campo description debe ser texto' });
            return;
        }
        updates.description = description;
    }

    if (completed !== undefined) {
        if (typeof completed !== 'boolean') {
            res.status(400).json({ error: 'El campo completed debe ser booleano' });
            return;
        }
        updates.completed = completed;
    }

    try {
        const result = await updateTask.execute(id, req.userId!, updates);

        if (result.status === 'not_found') {
            res.status(404).json({ error: 'Tarea no encontrada' });
            return;
        }
        if (result.status === 'forbidden') {
            res.status(403).json({ error: 'No tienes permisos para modificar esta tarea' });
            return;
        }

        res.status(200).json({ data: result.task });
    } catch {
        res.status(500).json({ error: 'Error al actualizar tarea' });
    }
});

// Eliminar una tarea
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await deleteTask.execute(id, req.userId!);

        if (result.status === 'not_found') {
            res.status(404).json({ error: 'Tarea no encontrada' });
            return;
        }
        if (result.status === 'forbidden') {
            res.status(403).json({ error: 'No tienes permisos para eliminar esta tarea' });
            return;
        }

        res.status(204).send();
    } catch {
        res.status(500).json({ error: 'Error al eliminar tarea' });
    }
});

export default router;
