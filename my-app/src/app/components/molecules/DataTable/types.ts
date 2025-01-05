import { ColumnDef, SortingState } from '@tanstack/react-table'

export type DataTableColumnDef<TData> = ColumnDef<TData> & {
  isVisibleOnMobile?: boolean
  priority?: number
}

export interface IDataTableSorting extends SortingState {}

export interface IDataTablePagination {
  pageIndex: number
  pageSize: number
}
