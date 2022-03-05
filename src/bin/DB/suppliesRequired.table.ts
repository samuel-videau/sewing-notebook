import {executeQuery} from "./mysql";
import {generateId} from "../utils/generate-id";
import {SupplyRequired} from "../../schemas/types/supplyRequired";

export async function queryAllSuppliesRequiredOfTodo(todoId: string): Promise<SupplyRequired[]> {
  return await executeQuery('SELECT * FROM supplies_required WHERE todoId = ' + todoId + ';') as SupplyRequired[];
}

export async function insertSupplyRequired(todoId: string, supplyId: string, quantity: number): Promise<string> {
  const id: string = generateId();
  await executeQuery('INSERT INTO supplies_required ' +
    'VALUES (' + id + ', ' + todoId + ', \'' + supplyId + '\', \'' + quantity.toString() + '\');');
  return id;
}

export async function editSupplyRequired(id: number, quantity: number): Promise<void> {
  await executeQuery('UPDATE supplies_required SET quantity = \'' + quantity.toString() + '\' WHERE id = ' + id.toString() + ';');
}

export async function querySupplyRequired(id: string): Promise<SupplyRequired> {
  return await executeQuery('SELECT * FROM supplies_required WHERE id = ' + id + ';') as SupplyRequired;
}

export async function deleteSupplyRequired(id: number): Promise<void> {
  await executeQuery('DELETE FROM supplies_required WHERE id = ' + id.toString() + ';');
}
