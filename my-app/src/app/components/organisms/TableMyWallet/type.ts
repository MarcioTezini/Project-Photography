export interface Client {
  document: string
  clientName: string
}

export interface DateWallet {
  requestdate: string
  executedate: string
}
export interface ValueWallet {
  value: number
}

export interface TypesWallet {
  type: string
  operation: string
}
export interface MyWalletTable {
  id: number
  wallet: string
  status: number
}
