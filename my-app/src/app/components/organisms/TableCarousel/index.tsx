import Table, { IDataTable } from '@/components/molecules/DataTable/Table'
import { useTranslations } from 'next-intl'
import React from 'react'
import info from './info'
import { CarouselList } from '@/services/carousel/carousel'
import { formatterCarouselListToTable } from './formatter'

interface TableCarouselProps extends Omit<IDataTable<CarouselList>, 'columns'> {
  reloadData: () => void
  isMobile?: boolean
  setIsMobile: (isMobile: boolean) => void
  setOpenRemoveCarouselDialog: (open: boolean) => void
  setOpenUpdateCarouselDialog: (open: boolean) => void
  setSelectedCarouselId: (id: number) => void
}

export const TableCarousel: React.FC<TableCarouselProps> = (props) => {
  const t = useTranslations()
  const { getColumns } = info

  return (
    <Table
      {...props}
      data={formatterCarouselListToTable(props.data)}
      columns={getColumns(
        t,
        props.reloadData,
        props.isMobile ?? false,
        props.setIsMobile,
        props.setOpenRemoveCarouselDialog,
        props.setOpenUpdateCarouselDialog,
        props.setSelectedCarouselId,
      )}
    />
  )
}
