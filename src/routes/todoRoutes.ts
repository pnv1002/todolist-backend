import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';
import * as todo from '../controllers/todoController';

const router = Router();

router.use(authenticate);

router.get('/', todo.getAll);
router.post('/', todo.create);
router.get('/:id', todo.getOne);
router.put('/:id', todo.update);
router.patch('/:id/move', todo.move);
router.delete('/:id', todo.remove);

router.get('/:id/attachments', todo.getAttachments);
router.post('/:id/attachments', upload.single('file'), todo.uploadAttachment);
router.delete('/:id/attachments/:attachmentId', todo.deleteAttachment);

export default router;
