import { MyClient } from '@/entities/my-clients'
import { MyClientTable } from './type'
import { cpfFormatter } from '@/bosons/formatters/cpfFormatter'
import { phoneFormatter } from '@/bosons/formatters/phoneFormatter'
import { dateFormatterNoTime } from '@/bosons/dateFormatterNoTime'

const formatterMyClientsToMyClientsTable = (
  clients: MyClient[],
): MyClientTable[] => {
  return clients.map((client) => {
    return {
      id: client.id,
      client: {
        name: client.name,
        documentNumber: cpfFormatter.mask(client.document),
        phone: phoneFormatter.mask(client.phone),
      },
      registered: dateFormatterNoTime.mask(client.registered),
      links: Number(client.activeCount),
      depositMin:
        client.depositmin !== 0
          ? client.depositmin.toFixed(2).toString()
          : 'Padrão',
      withdrawMax:
        client.withdrawmax !== 0
          ? client.withdrawmax.toFixed(2).toString()
          : 'Padrão',
      generalSettings: {
        deposits: client.deposit === 1,
        withdrawals: client.withdraw === 1,
        automaticWithdrawals: client.autoapproved === 1,
      },
      ignoreWl: {
        poker: client.IgnoreWhitelistSuprema === 1,
        cacheta: client.IgnoreWhitelistCacheta === 1,
      },
    }
  })
}

export { formatterMyClientsToMyClientsTable }
