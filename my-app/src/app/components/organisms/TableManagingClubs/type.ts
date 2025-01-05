export interface LogoClub {
  logo: string
}

export interface Club {
  name: string
  slotID: number
}

export interface ManigingClubsTable {
  id: number
  logo: LogoClub
  app: number
  appName: number
  club: Club
  operatorID: number
  agentID: number
  default: number
}
