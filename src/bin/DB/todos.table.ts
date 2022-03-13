import {executeQuery} from "./mysql";
import {TodoItem} from "../../schemas/types/todo-item";
import {generateId} from "../utils/generate-id";
import {ERROR_TODO_NOT_FOUND} from "../utils/error-messages";

export async function queryAllTodosOfProject(projectId: string): Promise<TodoItem[]> {
  return await executeQuery('SELECT * FROM todos WHERE projectId = ?;', [projectId]) as TodoItem[];
}

export async function insertTodo(projectId: string, name: string, description: string, completed: boolean): Promise<string> {
  const id: string = generateId();
  await executeQuery('INSERT INTO todos VALUES (?, ?, ?, ?, ?);', [id, projectId, name, description, completed]);
  return id;
}

export async function editTodo(id: string, name: string, description: string): Promise<void> {
  /* eslint-disable */
  const res = await executeQuery('UPDATE todos SET name = ?, description = ? WHERE id = ?;', [name, description, id]);
  if (res.changedRows === 0) throw(ERROR_TODO_NOT_FOUND);
  /* eslint-enable */
}

export async function completeTodo(id: string): Promise<void> {
  /* eslint-disable */
  const res = await executeQuery('UPDATE todos SET completed = true WHERE id = ?;', [id]);
  if (res.changedRows === 0) throw(ERROR_TODO_NOT_FOUND);
  /* eslint-enable */
}

export async function queryTodo(id: string): Promise<TodoItem> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return (await executeQuery('SELECT * FROM todos WHERE id = ?;', [id]))[0] as TodoItem;
}

export async function deleteTodo(id: string): Promise<void> {
  /* eslint-disable */
  const res = await executeQuery('DELETE FROM todos WHERE id = ?;', [id]);
  if (res.affectedRows === 0) throw(ERROR_TODO_NOT_FOUND);
  /* eslint-enable */
}
