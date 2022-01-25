import {TodoItem} from "./todo-item";

export interface Project {
  name: string
  description?: string
  todo?: TodoItem[]
}
