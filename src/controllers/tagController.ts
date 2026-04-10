import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as tagService from '../services/tagService';

const tagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#6366f1'),
});

export async function getAll(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await tagService.getTags(req.userId!));
  } catch (err) { next(err); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, color } = tagSchema.parse(req.body);
    res.status(201).json(await tagService.createTag(req.userId!, name, color));
  } catch (err) { next(err); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await tagService.deleteTag(req.params.id, req.userId!);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

export async function addToTodo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await tagService.addTagToTodo(req.params.id, req.params.tagId, req.userId!);
    res.json({ message: 'Tag added' });
  } catch (err) { next(err); }
}

export async function removeFromTodo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await tagService.removeTagFromTodo(req.params.id, req.params.tagId, req.userId!);
    res.json({ message: 'Tag removed' });
  } catch (err) { next(err); }
}
