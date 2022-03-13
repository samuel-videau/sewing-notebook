import {executeQuery} from "./mysql";
import {Supply} from "../../schemas/types/supply";
import {generateId} from "../utils/generate-id";
import {ERROR_SUPPLY_NOT_FOUND} from "../utils/error-messages";

export async function queryAllSupplies(): Promise<Supply[]> {
  return await executeQuery('SELECT * FROM supplies;') as Supply[];
}

export async function insertSupply(name: string, description: string, quantityLeft: number, type: string, color: string): Promise<string> {
  const id: string = generateId();
  await executeQuery('INSERT INTO supplies ' +
    'VALUES (?, ?, ?, ?, ?, ?);', [id, name, description, quantityLeft.toString(), type, color]);
  return id;
}

export async function editSupply(id: string, name: string, description: string, quantity: number, type: string, color: string): Promise<void> {
  /* eslint-disable */
  const res = await executeQuery('UPDATE supplies SET name = ?, description = ?, quantity = ?, type = ?, color = ? WHERE id = ?;', [name, description, quantity.toString(), type, color, id]);
  if (res.changedRows === 0) throw(ERROR_SUPPLY_NOT_FOUND);
  /* eslint-enable */
}

export async function querySupply(id: string): Promise<Supply> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return (await executeQuery('SELECT * FROM supplies WHERE id = ?;', [id]))[0] as Supply;
}

export async function deleteSupply(id: string): Promise<any> {
  /* eslint-disable */
  const res = await executeQuery('DELETE FROM supplies WHERE id = ?;', [id]);
  if (res.affectedRows === 0) throw(ERROR_SUPPLY_NOT_FOUND);
  /* eslint-enable */
}
