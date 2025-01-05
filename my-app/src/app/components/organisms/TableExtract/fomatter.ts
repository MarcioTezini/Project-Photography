import { ExtractList } from '@/services/extract/extract'
import { ExtractTable } from './type'

const formatterExtractToExtractTable = (
  extracts: ExtractList[],
): ExtractTable[] => {
  return extracts.map((extract) => {
    return {
      id: extract.id,
      date: {
        date: extract.date,
      },
      appId: extract.appId,
      appName: extract.appName,
      client: {
        userName: extract.userName,
        userDocument: extract.userDocument,
      },
      type: extract.amount > 0 ? 'deposit' : 'withdraw',
      player: {
        playerId: extract.playerId,
        playerNick: extract.playerNick,
      },
      club: {
        clubId: extract.clubId,
        clubName: extract.clubName,
      },
      amount: extract.amount,
      status: extract.status,
    }
  })
}

export { formatterExtractToExtractTable }
