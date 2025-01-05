import { MyWalletlist } from '@/services/wallet/wallet'
import { MyWalletTable } from './type'

const formatterMyWalletToMyWalletTable = (
  wallets: MyWalletlist[],
): MyWalletTable[] => {
  return wallets.map((wallet) => {
    return {
      id: wallet.id,
      date: {
        requestdate: wallet.requestdate,
        executedate: wallet.executedate,
      },
      wallet: wallet.wallet,
      client: {
        document: wallet.document,
        clientName: wallet.clientName,
      },
      types: {
        type: wallet.type,
        operation: wallet.operation,
      },
      status: wallet.status,
      values: {
        value: wallet.value,
      },
    }
  })
}

export { formatterMyWalletToMyWalletTable }
