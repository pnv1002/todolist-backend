import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as todoService from '../services/todoService';
import * as attachmentService from '../services/attachmentService';

const todoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  deadline: z.string().nullable().optional(),
  amount: z.number().nonnegative().nullable().optional(),
});

const moveSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'done']),
  position: z.number().int().min(0),
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

export async function move(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { status, position } = moveSchema.parse(req.body);
    const todo = await todoService.moveTodo(req.params.id, req.userId!, status, position);
    res.json(todo);
  } catch (err) { next(err); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await todoService.deleteTodo(req.params.id, req.userId!);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

export async function uploadAttachment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new Error('No file uploaded');
    const attachment = await attachmentService.createAttachment(req.params.id, req.userId!, req.file);
    res.status(201).json(attachment);
  } catch (err) { next(err); }
}

export async function getAttachments(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const attachments = await attachmentService.getAttachments(req.params.id, req.userId!);
    res.json(attachments);
  } catch (err) { next(err); }
}

export async function deleteAttachment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await attachmentService.deleteAttachment(req.params.attachmentId, req.userId!);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}
