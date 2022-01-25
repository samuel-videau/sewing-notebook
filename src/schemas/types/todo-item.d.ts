export interface TodoItem {
  id?: string
  name: string
  description?: string
  completed: boolean
  supplyRequired: {
    supplyRef: string
    quantity: number
  }[]
}
