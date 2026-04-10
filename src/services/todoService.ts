import { pool } from '../db';
import { AppError } from '../utils/AppError';

export interface TodoInput {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  deadline?: string | null;
}

export async function getTodos(userId: string) {
  const result = await pool.query(
    'SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

export async function getTodoById(id: string, userId: string) {
  const result = await pool.query(
    'SELECT * FROM todos WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  if (result.rows.length === 0) throw new AppError(404, 'Todo not found');
  return result.rows[0];
}

export async function createTodo(userId: string, data: TodoInput) {
  const { title, description = '', status = 'pending', priority = 'medium', deadline = null } = data;
  const result = await pool.query(
    `INSERT INTO todos (user_id, title, description, status, priority, deadline)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, title, description, status, priority, deadline]
  );
  return result.rows[0];
}

export async function updateTodo(id: string, userId: string, data: Partial<TodoInput>) {
  const todo = await getTodoById(id, userId);
  const title = data.title ?? todo.title;
  const description = data.description ?? todo.description;
  const status = data.status ?? todo.status;
  const priority = data.priority ?? todo.priority;
  const deadline = data.deadline !== undefined ? data.deadline : todo.deadline;

  const result = await pool.query(
    `UPDATE todos
     SET title=$1, description=$2, status=$3, priority=$4, deadline=$5, updated_at=NOW()
     WHERE id=$6 AND user_id=$7
     RETURNING *`,
    [title, description, status, priority, deadline, id, userId]
  );
  return result.rows[0];
}

export async function deleteTodo(id: string, userId: string) {
  const result = await pool.query(
    'DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  if (result.rows.length === 0) throw new AppError(404, 'Todo not found');
}
