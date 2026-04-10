import path from 'path';
import fs from 'fs';
import { pool } from '../db';
import { AppError } from '../utils/AppError';

export async function createAttachment(
  todoId: string,
  userId: string,
  file: Express.Multer.File
) {
  const result = await pool.query(
    `INSERT INTO todo_attachments (todo_id, user_id, original_name, stored_name, mime_type, size_bytes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [todoId, userId, file.originalname, file.filename, file.mimetype, file.size]
  );
  return result.rows[0];
}

export async function getAttachments(todoId: string, userId: string) {
  const result = await pool.query(
    'SELECT * FROM todo_attachments WHERE todo_id = $1 AND user_id = $2 ORDER BY created_at ASC',
    [todoId, userId]
  );
  return result.rows;
}

export async function deleteAttachment(id: string, userId: string) {
  const { rows } = await pool.query(
    'SELECT * FROM todo_attachments WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  if (rows.length === 0) throw new AppError(404, 'Attachment not found');

  const filePath = path.resolve(process.cwd(), 'uploads', rows[0].stored_name);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await pool.query('DELETE FROM todo_attachments WHERE id = $1', [id]);
}
