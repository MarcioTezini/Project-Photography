export interface ClientExtract {
  userDocument: string
  userName: string
}

export interface PlayerExtract {
  playerId: number
  playerNick: string
}

export interface ClubExtract {
  clubId: number
  clubName: string
}

export interface ValueExtract {
  value: number
}

export interface DateExtract {
  date: string
}

export interface ExtractTable {
  id: number
  date: DateExtract
  client: ClientExtract
  player: PlayerExtract
  club: ClubExtract
  appName: string
  appId: number
  amount: number
  status: number
}
