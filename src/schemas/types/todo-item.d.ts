export interface TodoItem {
  name: string
  description?: string
  completed: boolean
  supplyRequired: {
    supplyRef: unknown
    quantity: number
  }[]
}
