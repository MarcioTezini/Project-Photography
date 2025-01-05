import Button from '@/components/atoms/Button'
import Textfield from '@/components/atoms/Textfield'
import CustomDatePicker from '@/components/molecules/Datepicker'
import { useTranslations } from 'next-intl'
import React, { useEffect } from 'react'
import { FiAlertCircle, FiArrowLeft, FiFilter } from 'react-icons/fi'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { DropdownButton } from '@/components/molecules/DropdownButton'
import { cpfFormatter } from '@/bosons/formatters/cpfFormatter'
import { showToast } from '@/components/atoms/Toast'
import validateCPF from '@/utils/validateCPF'
import {
  IDataTablePagination,
  IDataTableSorting,
} from '@/components/molecules/DataTable/types'
import { useFormFilterStore } from '@/stores/FormFilterPropsStore'
import { FaArrowsRotate } from 'react-icons/fa6'

type UseTranslationsProps = (
  key: string,
  values?: Record<string, string>,
) => string

interface FormFilterProps {
  onClose: () => void
  loadClients: (filterData: {
    pagination: IDataTablePagination
    sorting: IDataTableSorting
    document: string
    name: string
    initialDate: string
    finalDate: string
  }) => void
  buttonText: string
}

const buttons = (
  t: UseTranslationsProps,
  handleDateRangeChange: (
    range: 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth',
  ) => void,
  buttonText: string,
) => [
  {
    icon: <FiFilter size={12} />,
    text: buttonText,
    dropdownItems: [
      {
        text: t('Panel.MyClients.Filter.yesterday'),
        onClick: () => {
          handleDateRangeChange('yesterday')
        },
      },
      {
        text: t('Panel.MyClients.Filter.thisWeek'),
        onClick: () => {
          handleDateRangeChange('thisWeek')
        },
      },
      {
        text: t('Panel.MyClients.Filter.lastWeek'),
        onClick: () => {
          handleDateRangeChange('lastWeek')
        },
      },
      {
        text: t('Panel.MyClients.Filter.thisMonth'),
        onClick: () => {
          handleDateRangeChange('thisMonth')
        },
      },
    ],
  },
]

export const FormFilterMyData: React.FC<FormFilterProps> = ({
  onClose,
  loadClients,
  buttonText,
}) => {
  const t = useTranslations()
  const { setFormData, resetFormData, formData } = useFormFilterStore()
  const formRegisterSchema = z
    .object({
      name: z
        .string()
        .optional()
        .transform((val) => val?.trim() ?? ''),
      document: z
        .string()
        .optional()
        .refine((val) => validateCPF(val ?? ''), t('Errors.invalidCpf')),
      initialDate: z.date().optional(),
      finalDate: z.date().optional(),
    })
    .refine(
      (data) => {
        const hasAtLeastOneField =
          data.name || data.document || data.initialDate || data.finalDate

        const hasBothDates =
          (!data.initialDate && !data.finalDate) ||
          (data.initialDate && data.finalDate)

        return hasAtLeastOneField && hasBothDates
      },
      {
        message: t('Panel.MyClients.Filter.msgError'),
        path: ['initialDate'],
      },
    )
    .refine((data) => {
      return (
        (data.finalDate?.getTime() ?? 0) >= (data.initialDate?.getTime() ?? 0)
      )
    })

  type FormRegisterSchema = z.infer<typeof formRegisterSchema>

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: { isValid, errors },
  } = useForm<FormRegisterSchema>({
    resolver: zodResolver(formRegisterSchema),
    mode: 'onChange',
  })

  const initialDate = watch('initialDate')
  const finalDate = watch('finalDate')
  const nameValue = watch('name')
  const documentValue = watch('document')

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

  async function handleDashboardFilter(data: FormRegisterSchema) {
    const initialDate = data.initialDate
      ? setInitialDateToStartOfDay(data.initialDate)
      : ''
    const finalDate = data.finalDate
      ? setFinalDateToEndOfDay(data.finalDate)
      : ''

    loadClients({
      pagination: { pageIndex: 0, pageSize: 25 },
      sorting: [{ id: '2', desc: false }],
      document: data.document ?? '',
      name: data.name ?? '',
      initialDate: initialDate !== '' ? initialDate : '',
      finalDate: finalDate !== '' ? finalDate : '',
    })

    setFormData(data)

    onClose()
    showToast(
      'success',
      t('Panel.MyClients.Filter.filterSuccess'),
      5000,
      'bottom-left',
    )
  }

  function handleDateRangeChange(
    range: 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth',
  ) {
    const now = new Date()
    const start = new Date()
    const end = new Date()

    const utcOffset = now.getTimezoneOffset() * 60000

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

    start.setUTCHours(0, 0, 0, 0)
    end.setUTCHours(23, 59, 59, 999)

    const adjustedStart =
      utcOffset > 0
        ? new Date(start.getTime() + utcOffset)
        : new Date(start.getTime() - Math.abs(utcOffset))

    const adjustedEnd =
      utcOffset > 0
        ? new Date(end.getTime() + utcOffset)
        : new Date(end.getTime() - Math.abs(utcOffset))

    setValue('initialDate', adjustedStart)
    setValue('finalDate', adjustedEnd)
    trigger()
  }

  useEffect(() => {
    if (
      finalDate &&
      initialDate &&
      finalDate < initialDate &&
      initialDate > finalDate
    ) {
      setError('initialDate', {
        type: 'manual',
        message: t('Panel.MyClients.Filter.selectValidDateError'),
      })
      setError('finalDate', {
        type: 'manual',
        message: t('Panel.MyClients.Filter.selectValidDateError'),
      })
    } else {
      clearErrors()
    }
  }, [finalDate, initialDate])

  useEffect(() => {
    setFormData(formData, setValue)
  }, [setFormData, formData, setValue])

  const handleClearFilters = () => {
    resetFormData()
    reset()
  }

  return (
    <form
      className="w-[328px] m-auto flex flex-col gap-xs mt-xm"
      onSubmit={handleSubmit(handleDashboardFilter)}
    >
      <div className="flex justify-end">
        <Button
          type="button"
          addIcon={<FaArrowsRotate width={30} height={30} />}
          onClick={handleClearFilters}
          variant="text"
        >
          {t('Panel.MyClients.clearFilter')}
        </Button>
      </div>
      <div className="flex flex-col gap-xs">
        <Textfield
          numericOnly
          {...register('document')}
          name="document"
          inputMode="numeric"
          value={cpfFormatter.mask(documentValue)}
          onChange={(e) => {
            const rawValue = e.target.value.replace(/[.-]/g, '')
            if (rawValue.length <= 11) {
              setValue('document', rawValue, { shouldValidate: true })
            }
          }}
          placeholder="CPF"
          variant={errors.document ? 'error' : undefined}
          validationMessages={
            errors.document?.message
              ? [{ message: errors.document.message }]
              : []
          }
        />
        <Textfield
          type="string"
          value={nameValue}
          {...register('name')}
          name="name"
          placeholder={t('Panel.MyClients.name')}
        />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center mb-xs">
          <span className="text-BODY-S font-Regular text-grey-500 mr-xs">
            {t('Panel.MyClients.date')}
          </span>
          <hr className="w-[215px] text-grey-500" />
        </div>
        <div className="flex justify-center  items-center gap-s w-full sm:flex-row">
          <div className="flex justify-start items-center gap-s w-full sm:justify-center">
            <Controller
              control={control}
              name="initialDate"
              render={({ field }) => (
                <CustomDatePicker
                  inputClassName="w-[126px] sm:w-full"
                  containerClassName="sm:w-full"
                  inputPlaceholder={t('Panel.MyClients.initialDatePlaceholder')}
                  selected={field.value}
                  onChange={(date) => field.onChange(date)}
                  variant={errors.initialDate ? 'error' : undefined}
                />
              )}
            />
            <Controller
              control={control}
              name="finalDate"
              render={({ field }) => (
                <CustomDatePicker
                  inputClassName="w-[126px] sm:w-full"
                  containerClassName="sm:w-full"
                  inputPlaceholder={t('Panel.MyClients.finalDatePlaceholder')}
                  selected={field.value}
                  onChange={(date) => field.onChange(date)}
                  variant={errors.finalDate ? 'error' : undefined}
                />
              )}
            />
          </div>
          <div className="ml-auto">
            <DropdownButton
              buttons={buttons(t, handleDateRangeChange, buttonText)}
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
        <div className="flex gap-xxs pt-xxs ml-xs self-stretch">
          {errors.initialDate && (
            <>
              <FiAlertCircle className="w-[12px] h-[12px] text-notify-warning-darkest" />
              <span className="flex gap-xxs items-center text-LABEL-L font-Medium text-notify-warning-darkest">
                {errors.initialDate.message}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-s justify-center mt-xm">
        <Button
          preIcon={<FiArrowLeft width={20} height={20} />}
          type="button"
          size="lg"
          variant="text"
          hasShadow={false}
          width={110}
          onClick={onClose}
        >
          {t('Panel.Whitelist.FormWhitelist.buttonBack')}
        </Button>
        <Button
          type="submit"
          size="lg"
          width={109}
          variant="primary"
          addIcon={<FiFilter />}
          disabled={!isValid}
        >
          {t('Panel.MyClients.filter')}
        </Button>
      </div>
    </form>
  )
}
