export interface IClientCell {
  name: string
  documentNumber: string
  phone: string
}

export interface IGeneralSettingsCell {
  deposits: boolean
  withdrawals: boolean
  automaticWithdrawals: boolean
}

export interface IIgnoreWlCell {
  poker: boolean
  cacheta: boolean
}

export interface MyClientTable {
  id: number
  client: IClientCell
  links: number
  registered: string
  depositMin: string
  withdrawMax: string
  generalSettings: IGeneralSettingsCell
  ignoreWl: IIgnoreWlCell
}
