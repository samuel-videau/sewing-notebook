import {SupplyRequired} from "./supplyRequired";

export interface TodoItem {
  id?: string,
  projectId?: string,
  name: string,
  description: string,
  completed: boolean,
  suppliesRequired?: SupplyRequired[]
}
