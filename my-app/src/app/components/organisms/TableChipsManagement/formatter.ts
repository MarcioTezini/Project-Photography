import { ChipsTable } from './type'
import { ChipsList } from '@/services/chips/chips'

const formatterChipsToChipsTable = (chips: ChipsList[]): ChipsTable[] => {
  return chips.map((chip) => {
    return {
      id: chip.id,
      date: {
        date: chip.reqdate,
      },
      appid: chip.appid,
      appname: chip.appname,
      client: {
        username: chip.username,
        userdocument: chip.userdocument,
      },
      player: {
        playerid: chip.playerid,
        playernick: chip.playernick,
      },
      club: {
        clubid: chip.clubid,
        clubname: chip.clubname,
      },
      value: chip.value,
      status: chip.status,
      username: chip.username,
      bankname: chip.bankname,
    }
  })
}

export { formatterChipsToChipsTable }
