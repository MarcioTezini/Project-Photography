/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { FiAlertCircle, FiSettings } from 'react-icons/fi'
import PanelTemplate from '../PanelTemplate'
import Divider from '@/components/atoms/Divider'
import { z } from 'zod'
import Textfield from '@/components/atoms/Textfield'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { showToast } from '@/components/atoms/Toast'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { Tooltip } from '@/components/atoms/Tooltip'
import Checkbox from '@/components/atoms/Checkbox'
import { useEffect, useMemo, useState, useRef } from 'react'
import Button from '@/components/atoms/Button'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'
import { saveMaxwithdrawPerDay } from '@/services/customer/customer'
import { currencyWithPrefixMask } from '@/bosons/formatters/currencyWithPrefixFormatter'
import { removeCurrencyWithPrefixMask } from '@/bosons/formatters/removeCurrencyWithPrefixMask'
import { getFinancialConfig } from '@/services/financial/financial'
import { useClientStore } from '@/stores/ClientStore'
import { useDebounce } from '@/hooks/useDebounce'

const formFinancialAdjustmentsSchema = z.object({
  maximumWithdrawal: z.string().optional(),
  automaticWithdrawals: z.boolean().optional(),
})

export default function FinancialAdjustmentsTemplate() {
  type FormFinancialAdjustmentsSchema = z.infer<
    typeof formFinancialAdjustmentsSchema
  >

  const t = useTranslations()

  const { setOnSubmit, setHasUnsavedChanges } = useSaveChangesDialogStore()
  const { selectedClient } = useClientStore()

  const [financialConfig, setFinancialConfig] = useState<{
    defaultmaxwithdrawperday: number
    newcoswithdrawapprove: number
  } | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormFinancialAdjustmentsSchema>({
    resolver: zodResolver(formFinancialAdjustmentsSchema),
    mode: 'onChange',
  })

  const fetchFinancialConfig = async () => {
    try {
      const response = await getFinancialConfig()
      setFinancialConfig(response.data)
      reset({
        maximumWithdrawal: currencyWithPrefixMask(
          String(response.data.defaultmaxwithdrawperday),
          true,
        ),
        automaticWithdrawals: !!response.data.newcoswithdrawapprove,
      })
    } catch (error) {
      showToast(
        'error',
        t('Errors.failedToLoadFinancialConfig'),
        5000,
        'bottom-left',
      )
    }
  }

  const debouncedFetchFinancialConfig = useDebounce(fetchFinancialConfig, 500)

  const isFirstRender = useRef(true)

  useEffect(() => {
    reset()
    fetchFinancialConfig().then(() => {
      setTimeout(() => {
        isFirstRender.current = false
      }, 1000)
    })
  }, [])

  useEffect(() => {
    if (!isFirstRender.current) {
      debouncedFetchFinancialConfig()
    }
  }, [selectedClient])

  const maximumWithdrawal = watch('maximumWithdrawal')
  const automaticWithdrawals = watch('automaticWithdrawals')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'maximumWithdrawal',
  ) => {
    const inputValue = e.target.value.replace(/[^\d.,]/g, '')

    const formattedValue = currencyWithPrefixMask(inputValue)

    setValue(field, formattedValue, { shouldValidate: true })
  }

  async function handleFormFinancialAdjustments(
    data: FormFinancialAdjustmentsSchema,
  ) {
    try {
      const formattedMaxWithdrawal = removeCurrencyWithPrefixMask(
        data.maximumWithdrawal as string,
      )

      await saveMaxwithdrawPerDay(
        formattedMaxWithdrawal,
        Number(data.automaticWithdrawals),
      )

      await fetchFinancialConfig()

      showToast(
        'success',
        t('Panel.FinancialAdjustments.toast.successMessage'),
        5000,
        'bottom-left',
      )
    } catch (error) {
      if (error instanceof Error) {
        showToast(
          'error',
          `${t(`Errors.${error.message}`)}`,
          5000,
          'bottom-left',
        )
      } else {
        showToast('error', t('Errors.loginFailed'), 5000, 'bottom-left')
      }
    }
  }

  const initialValues = useMemo(
    () => ({
      maximumWithdrawal: currencyWithPrefixMask(
        String(
          financialConfig?.defaultmaxwithdrawperday ||
            currencyWithPrefixMask('0'),
        ),
        true,
      ),
      automaticWithdrawals: Boolean(financialConfig?.newcoswithdrawapprove),
    }),
    [financialConfig],
  )

  const currentValues = useMemo(
    () => ({
      maximumWithdrawal,
      automaticWithdrawals,
    }),
    [maximumWithdrawal, automaticWithdrawals],
  )

  const isFinancialAdjustmentsDataDifferent = (
    obj1: FormFinancialAdjustmentsSchema,
    obj2: FormFinancialAdjustmentsSchema,
  ): boolean => {
    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)])

    for (const key of allKeys) {
      if (
        obj1[key as keyof FormFinancialAdjustmentsSchema] !==
        obj2[key as keyof FormFinancialAdjustmentsSchema]
      ) {
        return true
      }
    }
    return false
  }

  const wasChanged = isFinancialAdjustmentsDataDifferent(
    initialValues,
    currentValues,
  )

  useEffect(() => {
    if (wasChanged === true) {
      setHasUnsavedChanges(true)
      setOnSubmit(() => {
        handleSubmit(handleFormFinancialAdjustments)()
      })
    } else {
      setHasUnsavedChanges(false)
    }
  }, [wasChanged, handleSubmit])

  return (
    <PanelTemplate
      title={t('Panel.FinancialAdjustments.panelTitle')}
      icon={<FiSettings className="h-m w-m" />}
      headerContent={<></>}
    >
      <form
        onSubmit={handleSubmit(handleFormFinancialAdjustments)}
        className="flex flex-col py-xm px-s items-start gap-xm self-stretch rounded-sm bg-grey-300 shadow-DShadow-Special-X"
      >
        <div className="flex items-center self-stretch">
          <h1 className="text-grey-900 text-H6 font-Regular">
            {t('Panel.FinancialAdjustments.title')}
          </h1>
        </div>
        <Divider />
        <div className="grid grid-cols-2 sm:grid-cols-1 items-center gap-xm self-stretch">
          <Textfield
            value={maximumWithdrawal}
            placeholder={t(
              'Panel.FinancialAdjustments.maximumDailyWithdrawalPlaceholder',
            )}
            type="text"
            inputMode="numeric"
            {...register('maximumWithdrawal')}
            onChange={(e) => handleChange(e, 'maximumWithdrawal')}
            variant={errors.maximumWithdrawal && 'error'}
            validationMessages={
              errors.maximumWithdrawal?.message
                ? [{ message: errors.maximumWithdrawal.message }]
                : []
            }
          />
          <div className="flex items-center gap-xs">
            <Checkbox
              {...register('automaticWithdrawals')}
              checked={automaticWithdrawals}
            />
            <label className="text-grey-900 text-BODY-XM font-Medium">
              {t('Panel.FinancialAdjustments.automaticWithdrawalsLabel')}
            </label>
            <TooltipPrimitive.Provider>
              <Tooltip
                content={
                  <p>
                    <strong>
                      {t(
                        'Panel.FinancialAdjustments.automaticWithdrawalsLabel',
                      )}
                    </strong>
                    <br />
                    <br />
                    {t(
                      'Panel.FinancialAdjustments.tooltip.automaticWithdrawalsInfo',
                    )}
                    <br />
                    <br />
                    {t(
                      'Panel.FinancialAdjustments.tooltip.automaticWithdrawalsSecondInfo',
                    )}
                  </p>
                }
                side="bottom"
                defaultOpen={false}
                contentMarginLeft="100px"
              >
                <FiAlertCircle
                  size={22}
                  className="w-6 h-6 text-notify-info-normal cursor-pointer"
                />
              </Tooltip>
            </TooltipPrimitive.Provider>
          </div>
        </div>
        <div className="flex flex-col items-end gap-xs self-stretch">
          <Button
            type="submit"
            width={140}
            preDisabled={
              !wasChanged ||
              maximumWithdrawal === '' ||
              isSubmitting ||
              !isValid
            }
          >
            {t('Panel.FinancialAdjustments.saveChangesButtonText')}
          </Button>
        </div>
      </form>
    </PanelTemplate>
  )
}
