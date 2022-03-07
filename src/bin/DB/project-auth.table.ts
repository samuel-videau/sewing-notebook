import {executeQuery} from "./mysql";
import {ProjectAuth} from "../../schemas/types/ProjectAuth";
import {ERROR_UNAUTHORIZED} from "../utils/error-messages";

export async function insertProjectAuth(userId: string, projectId: string): Promise<void> {
  await executeQuery('INSERT INTO project_auth VALUES (' + projectId + ', ' + userId + ');');
}

export async function queryProjectAuth(userId: string, projectId: string): Promise<ProjectAuth> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return (await executeQuery('SELECT * FROM users WHERE userId = ' + userId + ' && projectId = ' + projectId + ';'))[0] as ProjectAuth;
}

export async function deleteUser(userId: string, projectId: string): Promise<void> {
  /* eslint-disable */
  const res = await executeQuery('DELETE FROM project_auth WHERE userId = ' + userId + ' && projectId = ' + projectId + ';');
  if (res.affectedRows === 0) throw(ERROR_UNAUTHORIZED);
  /* eslint-enable */
}
