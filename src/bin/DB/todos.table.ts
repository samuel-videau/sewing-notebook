import {executeQuery} from "./mysql";
import {TodoItem} from "../../schemas/types/todo-item";
import {generateId} from "../utils/generate-id";

export async function queryAllTodosOfProject(projectId: string): Promise<TodoItem[]> {
  return await executeQuery('SELECT * FROM todos WHERE projectId = ' + projectId + ';') as TodoItem[];
}

export async function insertTodo(projectId: string, name: string, description: string, completed: boolean): Promise<string> {
  const id: string = generateId();
  await executeQuery('INSERT INTO todos VALUES (' + id + ', ' + projectId + ', \'' + name + '\', \'' + description + '\', ' + completed.toString() + ');');
  return id;
}

export async function editTodo(id: string, name: string, description: string): Promise<void> {
  await executeQuery('UPDATE todos SET name = \'' + name + '\', description = \'' + description + '\' WHERE id = ' + id + ';');
}

export async function completeTodo(id: string): Promise<void> {
  await executeQuery('UPDATE todos SET completed = true WHERE id = ' + id + ';');
}

export async function queryTodo(id: string): Promise<TodoItem> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return (await executeQuery('SELECT * FROM todos WHERE id = ' + id + ';'))[0] as TodoItem;
}

export async function deleteTodo(id: string): Promise<void> {
  await executeQuery('DELETE FROM todos WHERE id = ' + id + ';');
}
