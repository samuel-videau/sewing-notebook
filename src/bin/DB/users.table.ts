import {executeQuery} from "./mysql";
import {Project} from "../../schemas/types/project";
import {generateId} from "../utils/generate-id";
import {ERROR_USER_NOT_FOUND} from "../utils/error-messages";
import {User} from "../../schemas/types/user";

export async function queryAllProjects(): Promise<Project[]> {
  return await executeQuery('SELECT * FROM projects;') as Project[];
}

export async function insertUser(email: string, password: string): Promise<string> {
    const id: string = generateId();
    await executeQuery('INSERT INTO users VALUES (' + id + ', \'' + email + '\', \'' + password + '\');');
    return id;
}

export async function queryUser(email: string, password: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const user: User = (await executeQuery('SELECT * FROM users WHERE email = \'' + email + '\' && password = \'' + password + '\';'))[0] as User;
  if (!user) throw (ERROR_USER_NOT_FOUND);
  else return user.id ? user.id : '';
}

export async function deleteUser(id: string): Promise<void> {
  /* eslint-disable */
  const res = await executeQuery('DELETE FROM users WHERE id = ' + id + ';');
  if (res.affectedRows === 0) throw(ERROR_USER_NOT_FOUND);
  /* eslint-enable */
}
