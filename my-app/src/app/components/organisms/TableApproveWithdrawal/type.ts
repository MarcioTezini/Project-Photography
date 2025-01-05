export interface Player {
  playerNick: string
  playerId: number
}

export interface ApproveWithdrawalId {
  id: number
  appName: string
  playerNick: string
  players: Player
}

export interface ValueApprove {
  amount: number
}

export interface DateApproveWithdrawal {
  date: string
}

export interface User {
  userName: string
  userDocument: string
}

export interface Club {
  clubName: string
  clubId: number
}
