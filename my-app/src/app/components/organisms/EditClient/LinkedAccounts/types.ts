export interface IPlayerCell {
  name: string
  id: number
}

export interface IClubCell {
  name: string
  id: number
}

export interface ILinkedAccountsTable {
  id: number
  player: IPlayerCell
  club: IClubCell
  app: string
  status: boolean
}
