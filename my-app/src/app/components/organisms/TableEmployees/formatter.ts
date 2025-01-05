import { Employee } from '@/services/employees/employees'
import { EmployeesTable } from './type'
import { cpfFormatter } from '@/bosons/formatters/cpfFormatter'
import { phoneFormatter } from '@/bosons/formatters/phoneFormatter'

const formatterEmployeesToEmployeesTable = (
  employees: Employee[],
): EmployeesTable[] => {
  return employees.map((employee) => {
    return {
      id: employee.id,
      employeeInfo: {
        name: employee.name,
        document: cpfFormatter.mask(employee.document),
      },
      email: employee.email,
      status: employee.status,
      phone: phoneFormatter.mask(employee.phone),
      function: employee.permission,
    }
  })
}

export { formatterEmployeesToEmployeesTable }
