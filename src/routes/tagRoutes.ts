import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import * as tag from '../controllers/tagController';

const router = Router();

router.use(authenticate);

router.get('/', tag.getAll);
router.post('/', tag.create);
router.delete('/:id', tag.remove);

// Gắn / gỡ tag vào todo
router.post('/todo/:id/:tagId', tag.addToTodo);
router.delete('/todo/:id/:tagId', tag.removeFromTodo);

export default router;
