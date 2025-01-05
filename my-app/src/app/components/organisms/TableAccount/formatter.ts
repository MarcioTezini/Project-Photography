import { Account } from '@/services/account/account'
import { AccountTable } from './type'

const formatterAccountTable = (accounts: Account[]): AccountTable[] => {
  return accounts.map((account) => {
    return {
      id: account.id,
      customerID: account.customerID,
      client: account.client,
      name: account.name,
      status: account.status,
    }
  })
}

export { formatterAccountTable }
