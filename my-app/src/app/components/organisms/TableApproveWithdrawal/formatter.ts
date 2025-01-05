import { ApproveWithdrawal } from '@/services/withdrawal/withdrawal'
import { ApproveWithdrawalId } from './type'

const formatterApproveWithdrawalTable = (
  approveW: ApproveWithdrawal[],
): ApproveWithdrawalId[] => {
  return approveW.map((approve) => {
    return {
      id: approve.id,
      appName: approve.appName,
      playerNick: approve.playerNick,
      amounts: {
        amount: approve.amount,
      },
      dates: {
        date: approve.date,
      },
      clubs: {
        clubId: approve.clubId,
        clubName: approve.clubName,
      },
      users: {
        userDocument: approve.userDocument,
        userName: approve.userName,
      },
      players: {
        playerNick: approve.playerNick,
        playerId: approve.playerId,
      },
    }
  })
}

export { formatterApproveWithdrawalTable }
