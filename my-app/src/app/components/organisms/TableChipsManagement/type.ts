export interface ClientChips {
  userdocument: string
  username: string
}

export interface PlayerChips {
  playerid: number
  playernick: string
}

export interface ClubChips {
  clubid: number
  clubname: string
}

export interface ValueChips {
  value: number
}

export interface DateChip {
  date: string
}

export interface ChipsTable {
  id: number
  date: DateChip
  client: ClientChips
  player: PlayerChips
  club: ClubChips
  appname: string
  appid: number
  value: number
  status: number
  username: string
}
