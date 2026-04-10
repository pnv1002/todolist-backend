import { pool } from '../db';
import { AppError } from '../utils/AppError';

export interface TodoInput {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  deadline?: string | null;
  amount?: number | null;
}

export async function getTodos(userId: string) {
  const result = await pool.query(
    'SELECT * FROM todos WHERE user_id = $1 ORDER BY status, position ASC',
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
  const { title, description = '', status = 'pending', priority = 'medium', deadline = null, amount = null } = data;

  // Gán position tiếp theo trong cột status tương ứng
  const posResult = await pool.query(
    'SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM todos WHERE user_id = $1 AND status = $2',
    [userId, status]
  );
  const position = posResult.rows[0].next_pos;

  const result = await pool.query(
    `INSERT INTO todos (user_id, title, description, status, priority, deadline, position, amount)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [userId, title, description, status, priority, deadline, position, amount]
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
  const amount = data.amount !== undefined ? data.amount : todo.amount;

  const result = await pool.query(
    `UPDATE todos
     SET title=$1, description=$2, status=$3, priority=$4, deadline=$5, amount=$6, updated_at=NOW()
     WHERE id=$7 AND user_id=$8
     RETURNING *`,
    [title, description, status, priority, deadline, amount, id, userId]
  );
  return result.rows[0];
}

export async function moveTodo(id: string, userId: string, newStatus: string, newPosition: number) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      'SELECT * FROM todos WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (rows.length === 0) throw new AppError(404, 'Todo not found');

    const todo = rows[0];
    const oldStatus = todo.status;
    const oldPosition = todo.position;

    if (oldStatus === newStatus) {
      // Cùng cột: dịch chuyển các todo ở giữa
      if (oldPosition < newPosition) {
        await client.query(
          `UPDATE todos SET position = position - 1
           WHERE user_id=$1 AND status=$2 AND position > $3 AND position <= $4 AND id != $5`,
          [userId, newStatus, oldPosition, newPosition, id]
        );
      } else if (oldPosition > newPosition) {
        await client.query(
          `UPDATE todos SET position = position + 1
           WHERE user_id=$1 AND status=$2 AND position >= $3 AND position < $4 AND id != $5`,
          [userId, newStatus, newPosition, oldPosition, id]
        );
      }
    } else {
      // Khác cột: thu hẹp cột cũ, mở rộng cột mới
      await client.query(
        `UPDATE todos SET position = position - 1
         WHERE user_id=$1 AND status=$2 AND position > $3`,
        [userId, oldStatus, oldPosition]
      );
      await client.query(
        `UPDATE todos SET position = position + 1
         WHERE user_id=$1 AND status=$2 AND position >= $3`,
        [userId, newStatus, newPosition]
      );
    }

    const result = await client.query(
      `UPDATE todos SET status=$1, position=$2, updated_at=NOW()
       WHERE id=$3 AND user_id=$4 RETURNING *`,
      [newStatus, newPosition, id, userId]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteTodo(id: string, userId: string) {
  const result = await pool.query(
    'DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  if (result.rows.length === 0) throw new AppError(404, 'Todo not found');
}
