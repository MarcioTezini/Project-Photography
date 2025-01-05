/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react'
import {
  FiChevronDown,
  FiChevronsDown,
  FiChevronsUp,
  FiChevronUp,
  FiLoader,
} from 'react-icons/fi'
import DataTable from '.'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { DataTableColumnDef, IDataTablePagination } from './types'

export interface IDataTable<T> {
  data: T[]
  columns: DataTableColumnDef<T>[]
  rowCount?: number
  initialPagination?: IDataTablePagination
  initialSorting?: SortingState
  manualSorting?: boolean
  enablePagination?: boolean
  className?: string
  onPaginationChange?: (
    pagination: IDataTablePagination,
    sorting: SortingState,
  ) => void
}

function Table<T>({
  data,
  columns,
  rowCount,
  manualSorting = false,
  initialSorting,
  initialPagination,
  enablePagination = true,
  className,
  onPaginationChange,
}: Readonly<IDataTable<T>>) {
  const [pagination, setPagination] = React.useState<PaginationState>(
    initialPagination || {
      pageIndex: 0,
      pageSize: 25,
    },
  )
  const [sorting, setSorting] = useState<SortingState>(initialSorting || [])
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [hiddenColumns, setHiddenColumns] = useState<DataTableColumnDef<T>[]>(
    [],
  )
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width
        const columnWidths = 150
        const maxColumns = Math.floor(width / columnWidths)
        const newHiddenColumns: DataTableColumnDef<T>[] = []

        if (columns.length > maxColumns) {
          const sortedColumns = [...columns].sort(
            (a, b) => (a.priority ?? 0) - (b.priority ?? 0),
          )

          for (let i = sortedColumns.length - 1; i >= maxColumns; i--) {
            const currentColumn = sortedColumns[i]
            if (!currentColumn.isVisibleOnMobile) {
              newHiddenColumns.push(currentColumn)
            }
          }
        }

        setHiddenColumns(newHiddenColumns)
      }
    })

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [columns])

  const { isLoading, isFetching } = useQuery({
    queryKey: ['data', pagination, sorting],
    queryFn: () => onPaginationChange?.(pagination, sorting),
    placeholderData: keepPreviousData,
  })

  const table = useReactTable({
    columns,
    data,
    rowCount,
    debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    manualPagination: true,
    manualSorting,
    enableSortingRemoval: false,
    state: {
      sorting,
      pagination,
      columnVisibility: hiddenColumns.reduce(
        (acc, obj) => {
          if (obj.id) acc[obj.id as string] = false
          return acc
        },
        {} as Record<string, boolean>,
      ),
    },
  })

  const handleRowClick = (rowId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }))
  }

  return (
    <>
      {isLoading || isFetching ? (
        <div className="flex justify-center items-center min-h-[80px]">
          <FiLoader className="animate-spin text-H3 text-grey-500" />
        </div>
      ) : (
        <div ref={containerRef} className="overflow-auto">
          <DataTable.Root>
            <DataTable.Header>
              {table.getHeaderGroups().map((headerGroup) => (
                <DataTable.Row key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort()
                    return (
                      <DataTable.Head
                        className={
                          canSort
                            ? 'cursor-pointer select-none'
                            : 'cursor-default'
                        }
                        onClick={header.column.getToggleSortingHandler()}
                        key={header.id}
                        colSpan={header.colSpan}
                      >
                        <div className="flex items-center gap-xxs">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {(canSort &&
                            {
                              asc: (
                                <FiChevronsUp
                                  size={12}
                                  className={`${header.column.getIsSorted() && 'text-fichasPay-main-400'}`}
                                />
                              ),
                              desc: (
                                <FiChevronsDown
                                  size={12}
                                  className={`${header.column.getIsSorted() && 'text-fichasPay-main-400'}`}
                                />
                              ),
                            }[
                              (header.column.getIsSorted() as string) || 'asc'
                            ]) ??
                            null}
                        </div>
                      </DataTable.Head>
                    )
                  })}
                  {hiddenColumns.length > 0 && (
                    <DataTable.Head key="head-mobile"></DataTable.Head>
                  )}
                </DataTable.Row>
              ))}
            </DataTable.Header>
            <DataTable.Body className={className}>
              {table.getRowModel().rows.map((row, rowIndex) => {
                const isEvenRow = rowIndex % 2 === 0
                return (
                  <React.Fragment key={row.id}>
                    <DataTable.Row
                      data-state={row.getIsSelected() && 'selected'}
                      className={`${isEvenRow ? 'bg-grey-400' : 'bg-grey-300'}`}
                      onClick={() => handleRowClick(row.id)}
                      key={row.id}
                    >
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <DataTable.Cell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </DataTable.Cell>
                        )
                      })}
                      {hiddenColumns.length > 0 && (
                        <DataTable.Cell key="accordion-mobile">
                          {expandedRows[row.id] ? (
                            <FiChevronUp size={14} className="text-grey-600" />
                          ) : (
                            <FiChevronDown
                              size={14}
                              className="text-grey-600"
                            />
                          )}
                        </DataTable.Cell>
                      )}
                    </DataTable.Row>
                    {expandedRows[row.id] && hiddenColumns.length > 0 && (
                      <DataTable.Row key={`${row.id}-expanded`}>
                        <DataTable.Cell
                          className={`w-full border-t-[0.5px] border-opacity-[0.5] border-grey-500 ${isEvenRow ? 'bg-grey-400' : 'bg-grey-300'}`}
                          colSpan={columns.length + 1}
                        >
                          {row.getAllCells().map((cell) => {
                            const currentColumn = cell.column.columnDef

                            return (
                              <div key={cell.id} className="mb-s">
                                {hiddenColumns.find(
                                  (col) =>
                                    'id' in col && col.id === currentColumn.id,
                                ) && (
                                  <span className="flex items-start text-grey-900 text-LABEL-L">
                                    <p className="font-Bold mr-s">
                                      {flexRender(
                                        cell.column.columnDef.header,
                                        table
                                          .getHeaderGroups()[0]
                                          .headers[0].getContext(),
                                      )}
                                      :
                                    </p>
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext(),
                                    )}
                                  </span>
                                )}
                              </div>
                            )
                          })}
                        </DataTable.Cell>
                      </DataTable.Row>
                    )}
                  </React.Fragment>
                )
              })}
            </DataTable.Body>
          </DataTable.Root>
          {enablePagination && (
            <DataTable.Footer>
              <DataTable.Pagination
                currentPage={table.getState().pagination.pageIndex + 1}
                totalPages={table.getPageCount()}
                itemsPerPage={table.getRowModel().rows.length}
                totalItemCount={table.getRowCount()}
                onNextPage={table.nextPage}
                onPreviousPage={table.previousPage}
                canNextPage={!table.getCanNextPage()}
                canPreviousPage={!table.getCanPreviousPage()}
                onPageChange={(page) => {
                  table.setPageIndex(page - 1)
                }}
              />
            </DataTable.Footer>
          )}
        </div>
      )}
    </>
  )
}

export default Table
