import {executeQuery} from "./mysql";
import {Project} from "../../schemas/types/project";
import {generateId} from "../utils/generate-id";

export async function queryAllProjects(): Promise<Project[]> {
  return await executeQuery('SELECT * FROM projects;') as Project[];
}

export async function insertProject(name: string, description: string): Promise<string> {
    const id: string = generateId();
    await executeQuery('INSERT INTO projects VALUES (' + id + ', \'' + name + '\', \'' + description + '\');');
    return id;
}

export async function editProject(id: string, name: string, description: string): Promise<void> {
  await executeQuery('UPDATE projects SET name = \'' + name + '\', description = \'' + description + '\' WHERE id = ' + id + ';');
}

export async function queryProject(id: string): Promise<Project> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return (await executeQuery('SELECT * FROM projects WHERE id = ' + id + ';'))[0] as Project;
}

export async function deleteProject(id: string): Promise<any> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await executeQuery('DELETE FROM projects WHERE id = ' + id + ';');
}
