/* eslint-disable react-hooks/exhaustive-deps */
import { z } from 'zod'
import CustomDatePicker from '../Datepicker'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiAlertCircle, FiFilter } from 'react-icons/fi'
import { useEffect } from 'react'
import { DropdownButton } from '../DropdownButton'
import { useTranslations } from 'next-intl'
import { Client } from '@/stores/ClientStore'

type UseTranslationsProps = (
  key: string,
  values?: Record<string, string>,
) => string

type DashboardFilterProps = {
  onDateChange: (initialDate: string, finalDate: string) => void
  selectedClient: Client | null
  buttonText: string
}

const buttons = (
  t: UseTranslationsProps,
  handleDateRangeChange: (
    range: 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth',
  ) => void,
  resetForm: () => void,
  buttonText: string,
) => [
  {
    icon: <FiFilter size={12} />,
    text: buttonText,
    dropdownItems: [
      {
        text: t('yesterday'),
        onClick: () => {
          resetForm()
          handleDateRangeChange('yesterday')
        },
      },
      {
        text: t('thisWeek'),
        onClick: () => {
          resetForm()
          handleDateRangeChange('thisWeek')
        },
      },
      {
        text: t('lastWeek'),
        onClick: () => {
          resetForm()
          handleDateRangeChange('lastWeek')
        },
      },
      {
        text: t('thisMonth'),
        onClick: () => {
          resetForm()
          handleDateRangeChange('thisMonth')
        },
      },
    ],
  },
]

export default function DashboardFilter({
  onDateChange,
  selectedClient,
  buttonText,
}: DashboardFilterProps) {
  const t = useTranslations('Panel.Dashboard.Filter')

  const dashboardFilterSchema = z
    .object({
      initialDate: z.date({
        required_error: t('selectValidDateError'),
      }),
      finalDate: z.date({
        required_error: t('selectValidDateError'),
      }),
    })
    .refine((data) => data.finalDate >= data.initialDate, {
      path: ['finalDate'],
      message: t('selectValidDateError'),
    })

  type DashboardFilterSchema = z.infer<typeof dashboardFilterSchema>

  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setError,
    clearErrors,
    reset,
    setValue,
  } = useForm<DashboardFilterSchema>({
    defaultValues: { initialDate: new Date(), finalDate: new Date() },
    resolver: zodResolver(dashboardFilterSchema),
    mode: 'onChange',
  })

  const initialDate = watch('initialDate')
  const finalDate = watch('finalDate')

  async function handleDashboardFilter(data: DashboardFilterSchema) {
    const setInitialDateToStartOfDay = (date: Date) => {
      const newDate = new Date(date)
      newDate.setHours(0, 0, 0, 0)
      return newDate.toISOString().slice(0, 19).replace('T', ' ')
    }

    const setFinalDateToEndOfDay = (date: Date) => {
      const newDate = new Date(date)
      newDate.setHours(23, 59, 59, 999)
      return newDate.toISOString().slice(0, 19).replace('T', ' ')
    }

    const initialDate = setInitialDateToStartOfDay(data.initialDate)
    const finalDate = setFinalDateToEndOfDay(data.finalDate)

    onDateChange(initialDate, finalDate)
  }

  function handleDateRangeChange(
    range: 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth',
  ) {
    const now = new Date()
    const start = new Date()
    const end = new Date()

    // Calculando o offset UTC local
    const utcOffset = now.getTimezoneOffset() * 60000 // Offset em milissegundos

    switch (range) {
      case 'yesterday': {
        start.setUTCDate(now.getUTCDate() - 1)
        end.setUTCDate(now.getUTCDate() - 1)
        break
      }
      case 'thisWeek': {
        const dayOfWeek = now.getUTCDay()
        start.setUTCDate(now.getUTCDate() - dayOfWeek)
        break
      }
      case 'lastWeek': {
        const lastWeekStartDay = now.getUTCDate() - now.getUTCDay() - 7
        start.setUTCDate(lastWeekStartDay)
        end.setUTCDate(lastWeekStartDay + 6)
        break
      }
      case 'thisMonth': {
        start.setUTCDate(1)
        start.setUTCMonth(now.getUTCMonth())
        break
      }
      default:
        return
    }

    // Ajustando para o primeiro momento do dia (00:00:00.000)
    start.setUTCHours(0, 0, 0, 0)

    // Ajustando para o último momento do dia (23:59:59.999)
    end.setUTCHours(23, 59, 59, 999)

    // Ajustando as datas para considerar o UTC local
    const adjustedStart =
      utcOffset > 0
        ? new Date(start.getTime() + utcOffset) // UTC-: Adiciona o offset
        : new Date(start.getTime() - Math.abs(utcOffset)) // UTC+: Subtrai o offset

    const adjustedEnd =
      utcOffset > 0
        ? new Date(end.getTime() + utcOffset) // UTC-: Adiciona o offset
        : new Date(end.getTime() - Math.abs(utcOffset)) // UTC+: Subtrai o offset

    setValue('initialDate', adjustedStart)
    setValue('finalDate', adjustedEnd)

    // Considerando o UTC local: somar o offset se for UTC+, subtrair o offset se for UTC-
    onDateChange(
      adjustedStart.toISOString().slice(0, 19).replace('T', ' '),
      adjustedEnd.toISOString().slice(0, 19).replace('T', ' '),
    )
  }

  useEffect(() => {
    if (finalDate < initialDate) {
      setError('initialDate', {
        type: 'manual',
        message: t('selectValidDateError'),
      })
      setError('finalDate', {
        type: 'manual',
        message: t('selectValidDateError'),
      })
    } else {
      clearErrors()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalDate, initialDate])

  useEffect(() => {
    if (finalDate && initialDate && finalDate >= initialDate) {
      handleDashboardFilter({ initialDate, finalDate })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalDate, initialDate])

  const getStartOfDay = (date: Date) => {
    const start = new Date(date)
    const utcOffset = start.getTimezoneOffset() / 60
    const offsetHours = 0 + utcOffset
    start.setUTCHours(offsetHours, 0, 0, 0)
    setValue('initialDate', new Date())
    setValue('finalDate', new Date())
    return start.toISOString().slice(0, 19).replace('T', ' ')
  }

  const getEndOfDay = (date: Date) => {
    const end = new Date(date)
    const utcOffset = end.getTimezoneOffset() / 60
    const offsetHours = 23 + utcOffset
    end.setUTCHours(offsetHours, 59, 59, 999)
    return end.toISOString().slice(0, 19).replace('T', ' ')
  }

  useEffect(() => {
    const today = new Date()

    const initial = getStartOfDay(today)
    const final = getEndOfDay(today)

    onDateChange(initial, final)
  }, [selectedClient])

  return (
    <form
      onSubmit={handleSubmit(handleDashboardFilter)}
      className="flex justify-between items-center self-stretch"
    >
      <div className="flex flex-col items-start w-full">
        <div className="flex justify-center items-center gap-s w-full sm:flex-row">
          <div className="flex justify-start items-center gap-s w-full sm:justify-center">
            <Controller
              control={control}
              name="initialDate"
              render={({ field }) => (
                <CustomDatePicker
                  inputClassName="w-[138px] sm:w-full"
                  containerClassName="sm:w-full"
                  inputPlaceholder={t('initialDatePlaceholder')}
                  selected={field.value}
                  onChange={(date) => field.onChange(date)}
                  variant={errors.finalDate ? 'error' : undefined}
                />
              )}
            />
            <Controller
              control={control}
              name="finalDate"
              render={({ field }) => (
                <CustomDatePicker
                  inputClassName="w-[138px] sm:w-full"
                  containerClassName="sm:w-full"
                  inputPlaceholder={t('finalDatePlaceholder')}
                  selected={field.value}
                  onChange={(date) => field.onChange(date)}
                  variant={errors.finalDate ? 'error' : undefined}
                />
              )}
            />
          </div>
          <div className="ml-auto">
            <DropdownButton
              buttons={buttons(
                t,
                handleDateRangeChange,
                () => reset(),
                buttonText,
              )}
              position="left"
              buttonPadding="px-xs py-xxs"
            />
          </div>
        </div>
        <div className="flex gap-xxs pt-xxs ml-xs self-stretch">
          {errors.finalDate && (
            <>
              <FiAlertCircle className="w-[12px] h-[12px] text-notify-warning-darkest" />
              <span className="flex gap-xxs items-center text-LABEL-L font-Medium text-notify-warning-darkest">
                {errors.finalDate.message}
              </span>
            </>
          )}
        </div>
      </div>
    </form>
  )
}
