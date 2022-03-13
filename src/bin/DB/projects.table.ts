import {executeQuery} from "./mysql";
import {Project} from "../../schemas/types/project";
import {generateId} from "../utils/generate-id";
import {ERROR_PROJECT_NOT_FOUND} from "../utils/error-messages";

export async function queryAllProjects(): Promise<Project[]> {
  return await executeQuery('SELECT * FROM projects;') as Project[];
}

export async function insertProject(name: string, description: string): Promise<string> {
    const id: string = generateId();
    await executeQuery('INSERT INTO projects VALUES (' + id + ', ?, ?);', [name, description]);
    return id;
}

export async function editProject(id: string, name: string, description: string): Promise<void> {
  /* eslint-disable */
  const res = await executeQuery('UPDATE projects SET name = ?, description = ? WHERE id = ?;', [name, description, id]);
  if (res.changedRows === 0) throw(ERROR_PROJECT_NOT_FOUND);
  /* eslint-enable */
}

export async function queryProject(id: string): Promise<Project> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return (await executeQuery('SELECT * FROM projects WHERE id = ' + id + ';'))[0] as Project;
}

export async function deleteProject(id: string): Promise<void> {
  /* eslint-disable */
  const res = await executeQuery('DELETE FROM projects WHERE id = ' + id + ';');
  if (res.affectedRows === 0) throw(ERROR_PROJECT_NOT_FOUND);
  /* eslint-enable */
}
