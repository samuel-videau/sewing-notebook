import {executeQuery} from "./mysql";
import {Supply} from "../../schemas/types/supply";
import {generateId} from "../utils/generate-id";

export async function queryAllSupplies(): Promise<Supply[]> {
  return await executeQuery('SELECT * FROM supplies;') as Supply[];
}

export async function insertSupply(name: string, description: string, quantityLeft: number, type: string, color: string): Promise<string> {
  const id: string = generateId();
  await executeQuery('INSERT INTO supplies ' +
    'VALUES (' + id + ', \'' + name + '\', \'' + description + '\', \'' + quantityLeft.toString() + '\', \'' + type + '\', \'' + color + '\');');
  return id;
}

export async function editSupply(id: string, name: string, description: string, quantity: number, type: string, color: string): Promise<void> {
  await executeQuery('UPDATE supplies SET ' +
    'name = \'' + name + '\', description = \'' + description + '\', quantity = \'' + quantity.toString() + '\', ' +
    'type = \'' + type + '\', color = \'' + color + '\' WHERE id = ' + id + ';');
}

export async function querySupply(id: string): Promise<Supply> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return (await executeQuery('SELECT * FROM supplies WHERE id = ' + id + ';'))[0] as Supply;
}

export async function deleteSupply(id: string): Promise<any> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await executeQuery('DELETE FROM supplies WHERE id = ' + id + ';');
}
