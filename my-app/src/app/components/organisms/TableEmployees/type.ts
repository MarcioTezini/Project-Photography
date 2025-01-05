export interface EmployeesTable {
  id: number
  employeeInfo: {
    name: string
    document: string
  }
  phone: string
  email: string
  status: number
  function: number
}

export interface IEmployeeCell {
  name: string
  document: string
}
