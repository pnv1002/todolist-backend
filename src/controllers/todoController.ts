import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as todoService from '../services/todoService';

const todoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  deadline: z.string().nullable().optional(),
});

export async function getAll(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const todos = await todoService.getTodos(req.userId!);
    res.json(todos);
  } catch (err) { next(err); }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const todo = await todoService.getTodoById(req.params.id, req.userId!);
    res.json(todo);
  } catch (err) { next(err); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = todoSchema.parse(req.body);
    const todo = await todoService.createTodo(req.userId!, data);
    res.status(201).json(todo);
  } catch (err) { next(err); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = todoSchema.partial().parse(req.body);
    const todo = await todoService.updateTodo(req.params.id, req.userId!, data);
    res.json(todo);
  } catch (err) { next(err); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await todoService.deleteTodo(req.params.id, req.userId!);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}
