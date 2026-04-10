import { pool } from '../db';
import { AppError } from '../utils/AppError';

export async function getTags(userId: string) {
  const result = await pool.query(
    'SELECT * FROM tags WHERE user_id = $1 ORDER BY name ASC',
    [userId]
  );
  return result.rows;
}

export async function createTag(userId: string, name: string, color: string) {
  const result = await pool.query(
    `INSERT INTO tags (user_id, name, color) VALUES ($1, $2, $3) RETURNING *`,
    [userId, name, color]
  );
  return result.rows[0];
}

export async function deleteTag(id: string, userId: string) {
  const result = await pool.query(
    'DELETE FROM tags WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  if (result.rows.length === 0) throw new AppError(404, 'Tag not found');
}

export async function addTagToTodo(todoId: string, tagId: string, userId: string) {
  // Kiểm tra tag thuộc user
  const tag = await pool.query('SELECT id FROM tags WHERE id = $1 AND user_id = $2', [tagId, userId]);
  if (tag.rows.length === 0) throw new AppError(404, 'Tag not found');

  // Kiểm tra todo thuộc user
  const todo = await pool.query('SELECT id FROM todos WHERE id = $1 AND user_id = $2', [todoId, userId]);
  if (todo.rows.length === 0) throw new AppError(404, 'Todo not found');

  await pool.query(
    'INSERT INTO todo_tags (todo_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [todoId, tagId]
  );
}

export async function removeTagFromTodo(todoId: string, tagId: string, userId: string) {
  const todo = await pool.query('SELECT id FROM todos WHERE id = $1 AND user_id = $2', [todoId, userId]);
  if (todo.rows.length === 0) throw new AppError(404, 'Todo not found');

  await pool.query('DELETE FROM todo_tags WHERE todo_id = $1 AND tag_id = $2', [todoId, tagId]);
}

export async function getTagsByTodo(todoId: string) {
  const result = await pool.query(
    `SELECT t.* FROM tags t
     JOIN todo_tags tt ON tt.tag_id = t.id
     WHERE tt.todo_id = $1
     ORDER BY t.name ASC`,
    [todoId]
  );
  return result.rows;
}
