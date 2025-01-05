import { ClientAccount } from '@/entities/my-clients'
import { ILinkedAccountsTable } from './types'

const formatterLinkedAccountsToLinkedAccountsTable = (
  accounts: ClientAccount[],
): ILinkedAccountsTable[] => {
  return accounts.map((account) => {
    return {
      id: account.id,
      player: {
        name: account.nick,
        id: account.playerId,
      },
      app: account.appName,
      club: {
        name: account.clubName,
        id: account.clubId,
      },
      status: Boolean(account.status),
    }
  })
}

export { formatterLinkedAccountsToLinkedAccountsTable }
