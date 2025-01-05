export interface ITransactionUser {
  name: string
  document: string
}

export interface DashboardTable {
  id: number
  dateTime: string
  user: ITransactionUser
  type: string
  value: number
}
