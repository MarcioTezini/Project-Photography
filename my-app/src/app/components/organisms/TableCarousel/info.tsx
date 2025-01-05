import { DataTableColumnDef } from '@/components/molecules/DataTable/types'
import { CarouselTable } from './type'
import { TableEditButton } from '@/components/atoms/TableEditButton'
import { TableWarningButton } from '@/components/atoms/TableWarningButton'
import Switch from '@/components/atoms/Switch'
import { showToast } from '@/components/atoms/Toast'
import { updateCarousel } from '@/services/carousel/carousel'
type UseTranslationsReturn = (
  key: string,
  values?: Record<string, string>,
) => string

const renderLabel = (value: string | null | undefined) => (
  <div className="sm:max-w-[150px] overflow-hidden text-ellipsis text-LABEL-L font-Medium text-grey-800">
    {value ? value.toString() : ''}
  </div>
)

const renderInfo = (
  value: number | null | undefined,
  t: UseTranslationsReturn,
) => {
  let colorSuccess = ''
  let displayText = ''

  if (value === 1) {
    colorSuccess = 'bg-notify-success-dark'
    displayText = t('Panel.Carousel.viewsType.0')
  } else if (value === 2) {
    colorSuccess = 'bg-notify-warning-dark'
    displayText = t('Panel.Carousel.viewsType.1')
  } else {
    colorSuccess = 'bg-notify-info-dark'
    displayText = t('Panel.Carousel.viewsType.2')
  }

  return (
    <label className="text-LABEL-L font-Medium text-grey-800 flex items-center">
      <div className={`rounded-xxl ${colorSuccess} w-xs h-xs mr-xs`}></div>
      {displayText}
    </label>
  )
}

const RenderSwitch = ({
  value,
  id,
  onSwitchChange,
  t,
}: {
  value: string | number
  id: number
  onSwitchChange: () => void
  t: UseTranslationsReturn
}) => {
  const toChecked = (val: string | number): boolean => {
    return val === 1 || val === '1'
  }

  const isChecked = toChecked(value)

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked
    const newValue = checked ? 1 : 0
    try {
      await updateCarousel({ id, published: newValue })
      showToast(
        'success',
        t(
          `Panel.Carousel.Successes.${
            newValue
              ? 'bannerActivatedSuccessfully'
              : 'bannerDeactivatedSuccessfully'
          }`,
        ),
        5000,
        'bottom-left',
      )
      onSwitchChange()
    } catch (error) {
      console.error('Error updating AutoApproved:', error)
    }
  }

  return <Switch checked={isChecked} onChange={handleChange} />
}

export const getColumns = (
  t: UseTranslationsReturn,
  onSwitchChange: () => void,
  isMobile: boolean,
  setIsMobile: (isMobile: boolean) => void,
  setOpenRemoveCarouselDialog: (open: boolean) => void,
  setOpenUpdateCarouselDialog: (open: boolean) => void,
  setSelectedCarouselId: (id: number) => void,
): DataTableColumnDef<CarouselTable>[] => {
  return [
    {
      id: '1',
      accessorKey: 'name',
      header: t('Panel.Carousel.tableColumns.0'),
      cell: (info) => renderLabel(info.getValue() as string),
      sortDescFirst: false,
    },
    {
      id: '2',
      accessorKey: 'interval',
      header: t('Panel.Carousel.tableColumns.1'),
      cell: (info) => renderLabel(info.getValue() as string),
      sortDescFirst: false,
    },
    {
      id: '3',
      accessorKey: 'show',
      header: t('Panel.Carousel.tableColumns.2'),
      cell: (info) => renderInfo(info.getValue() as number, t),
      sortDescFirst: false,
    },
    {
      id: '5',
      accessorKey: 'sorder',
      header: t('Panel.Carousel.tableColumns.3'),
      cell: (info) => renderLabel(info.getValue() as string),
      sortDescFirst: false,
    },
    {
      id: '4',
      accessorKey: 'published',
      sortDescFirst: false,
      header: t('Panel.Carousel.tableColumns.4'),
      cell: (info) => (
        <RenderSwitch
          value={info.getValue() as number}
          id={info.row.original.id as number}
          onSwitchChange={onSwitchChange}
          t={t}
        />
      ),
    },
    {
      id: 'actions',
      accessorKey: 'actions',
      isVisibleOnMobile: true,
      header: t('Panel.Carousel.tableColumns.5'),
      cell: (info) => {
        const id = info.row.original.id
        return (
          <div className="flex gap-xs">
            <TableEditButton
              name=""
              onClick={() => {
                setSelectedCarouselId(id)
                setIsMobile(isMobile)
                setOpenUpdateCarouselDialog(true)
              }}
            />
            <TableWarningButton
              name=""
              onClick={() => {
                setSelectedCarouselId(id)
                setOpenRemoveCarouselDialog(true)
              }}
            />
          </div>
        )
      },
    },
  ]
}

const columnsInfo = {
  getColumns,
}

export default columnsInfo
