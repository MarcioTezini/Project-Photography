import { cpfFormatter } from '@/bosons/formatters/cpfFormatter'
import { DashboardTable } from './type'
import { Transaction } from '@/services/transactions/transactions'

const formatterDashboardTable = (
  transactions: Transaction[],
): DashboardTable[] => {
  return transactions.map((transaction) => {
    return {
      id: transaction.id,
      dateTime: transaction.dateTime,
      user: {
        name: transaction.name,
        document: cpfFormatter.mask(transaction.document),
      },
      type: transaction.typeTransaction,
      value: transaction.value,
    }
  })
}

export { formatterDashboardTable }
