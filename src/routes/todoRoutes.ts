import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import * as todo from '../controllers/todoController';

const router = Router();

router.use(authenticate);

router.get('/', todo.getAll);
router.post('/', todo.create);
router.get('/:id', todo.getOne);
router.put('/:id', todo.update);
router.delete('/:id', todo.remove);

export default router;
