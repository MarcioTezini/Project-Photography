/* eslint-disable react-hooks/exhaustive-deps */
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

interface DataTablePaginationProps {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalItemCount: number
  onPageChange?: (page: number) => void
  onNextPage: () => void
  canNextPage: boolean
  canPreviousPage: boolean
  onPreviousPage: () => void
}

const DataTablePagination: React.FC<DataTablePaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItemCount,
  onPageChange,
  onNextPage,
  onPreviousPage,
  canNextPage,
  canPreviousPage,
}) => {
  const [inputValue, setInputValue] = useState(currentPage.toString())
  const [startItem, setStartItem] = useState<number>(1)
  const [endItem, setEndItem] = useState<number>(itemsPerPage)

  const isValidPage = (page: number, totalPages: number) => {
    return !isNaN(page) && page > 0 && page <= totalPages
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    setInputValue(newValue)

    const newPage = parseInt(newValue, 10)
    if (isValidPage(newPage, totalPages)) {
      onPageChange?.(newPage)
      updateDisplayedItems(newPage)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onNextPage()
      updateDisplayedItems(currentPage + 1)
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPreviousPage()
      updateDisplayedItems(currentPage - 1)
    }
  }

  const updateDisplayedItems = useCallback(
    (page: number) => {
      const start = (page - 1) * itemsPerPage + 1
      const end = Math.min(page * itemsPerPage, totalItemCount)
      setStartItem(start)
      setEndItem(end)
    },
    [totalItemCount],
  )

  useEffect(() => {
    setInputValue(currentPage.toString())
    updateDisplayedItems(currentPage)
  }, [currentPage, updateDisplayedItems])

  return (
    <nav
      className="flex items-center flex-wrap md:flex-row justify-between pt-4"
      aria-label="Table navigation"
    >
      <span className="text-BODY-XM text-grey-600">
        Mostrando{' '}
        <span className="text-BODY-XM font-Bold">
          {startItem} a {endItem} de {totalItemCount}
        </span>
      </span>
      <div className="flex flex-row items-center">
        <div className="flex flex-row items-center gap-[8px] mr-s">
          <input
            className="text-BODY-XM text-grey-600 font-Bold border border-grey-600 rounded-xs px-xs py-xs max-w-[47px] h-[33px] text-center"
            onChange={handleInputChange}
            maxLength={totalPages.toString().length}
            value={inputValue}
          />
          <span className="text-BODY-XM text-grey-600">de {totalPages}</span>
        </div>
        <div className="flex flex-row items-center gap-[10px]">
          <button
            onClick={handlePreviousPage}
            disabled={canPreviousPage}
            className="disabled:opacity-50"
          >
            <FiChevronLeft className="text-grey-600" />
          </button>

          <button
            onClick={handleNextPage}
            disabled={canNextPage}
            className="disabled:opacity-50"
          >
            <FiChevronRight className="text-grey-600" />
          </button>
        </div>
      </div>
    </nav>
  )
}

export default DataTablePagination
