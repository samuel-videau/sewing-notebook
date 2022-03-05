import {TodoItem} from "./todo-item";

export interface Project {
  id?: string;
  name: string
  description: string
  todo?: TodoItem[]
}
