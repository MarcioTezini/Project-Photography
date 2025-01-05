import { cnpjFormatter } from '@/bosons/formatters/cnpjFormater'
import { phoneFormatter } from '@/bosons/formatters/phoneFormatter'
import { removeCurrencyWithPrefixMask } from '@/bosons/formatters/removeCurrencyWithPrefixMask'
import Button from '@/components/atoms/Button'
import Selector from '@/components/atoms/Select'
import Textfield from '@/components/atoms/Textfield'
import { showToast } from '@/components/atoms/Toast'
import { getBankList } from '@/services/banks/banks'
import { getUserInfo, registerWithdrawal } from '@/services/wallet/wallet'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiAlertCircle, FiArrowLeft } from 'react-icons/fi'
import { z } from 'zod'

interface FormWithDrawalMyWalletProps {
  setOpenAddAgentDialog: (open: boolean) => void
  onClose: () => void
  setOpenFormCarousel: (open: boolean) => void
  refreshData: () => void
}

const parseAmount = (value: string) => {
  const numericValue = value.replace(/\D/g, '')
  return parseFloat(numericValue) / 100
}

export default function FormWithDrawalMyWallet({
  onClose,
  setOpenFormCarousel,
  refreshData,
}: FormWithDrawalMyWalletProps) {
  const t = useTranslations()
  const formRegisterSchema = z
    .object({
      key: z
        .string()
        .optional()
        .refine(
          (key) =>
            !key ||
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
              key,
            ),
          {
            message: t(
              'Panel.MyWallet.tableColumns.TherandomPIXkeyisincorrect',
            ),
            path: ['key'],
          },
        ),
      amount: z
        .string()
        .min(1, t('Panel.MyWallet.tableColumns.Thevaluemustbeatleast')),
      email: z.string().optional(),
      documento: z.string().optional(),
      celular: z.string().optional(),
      keyOptions: z.string(),
      bankOptions: z.string().min(1, ''),
      clientDocument: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const amountValue = parseAmount(data.amount)
      if (amountValue < 1) {
        ctx.addIssue({
          path: ['amount'],
          message: t('Panel.MyWallet.tableColumns.Thevaluemustbeatleast'),
          code: z.ZodIssueCode.custom,
        })
        return false
      }

      if (data.keyOptions === '3' && !data.key) {
        ctx.addIssue({
          path: ['key'],
          message: 'Este campo é obrigatório',
          code: z.ZodIssueCode.custom,
        })
      }
    })

  type FormRegisterSchema = z.infer<typeof formRegisterSchema>

  const [keyOptions] = useState<{ value: string; label: string }[]>([
    { value: '0', label: t('Panel.MyWallet.formWithdrawal.Document') },
    { value: '2', label: t('Panel.MyWallet.formWithdrawal.Mobile') },
    { value: '1', label: t('Panel.MyWallet.formWithdrawal.Email') },
    { value: '3', label: t('Panel.MyWallet.formWithdrawal.RandomKey') },
  ])
  const [isBelowMinimum, setIsBelowMinimum] = useState(false)

  const [bankOptions] = useState<{ value: string; label: string }[]>([
    { value: '1', label: 'E2' },
  ])

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormRegisterSchema>({
    resolver: zodResolver(formRegisterSchema),
    mode: 'onChange',
    defaultValues: {
      amount: 'R$0,00',
    },
  })

  const keyValue = watch('key')
  const valueValue = watch('amount')
  const emailValue = watch('email')
  const documentoValue = watch('documento')
  const celularValue = watch('celular')
  const keyOptionsValue = watch('keyOptions')
  const bankOptionsValue = watch('bankOptions')
  const clientDocumentValue = watch('clientDocument')

  useEffect(() => {
    const fetchbankInfo = async () => {
      try {
        const response = await getBankList()
        setValue('bankOptions', String(response.client))
      } catch (error) {
        if (error instanceof Error) {
          showToast('error', `${error.message}`, 5000, 'bottom-left')
        }
      }
    }

    fetchbankInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await getUserInfo()
        setValue('clientDocument', String(response.data.detail.client.document))
        setValue(
          'documento',
          String(cnpjFormatter.mask(response.data.detail.client.document)),
        )
        setValue('email', response.data.detail.client.email || '')
        setValue(
          'celular',
          String(phoneFormatter.mask(response.data.detail.client.phone)),
        )
      } catch (error) {
        if (error instanceof Error) {
          showToast('error', `${error.message}`, 5000, 'bottom-left')
        }
      }
    }
    fetchUserInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {}, [keyOptionsValue, bankOptionsValue, valueValue])

  const handleFormUpdate = useCallback(
    async (data: FormRegisterSchema) => {
      try {
        let key = data.keyOptions === '3' ? data.key : ''
        if (data.keyOptions === '2') {
          key = data.celular
        } else if (data.keyOptions === '1') {
          key = data.email
        } else if (data.keyOptions === '0') {
          key = data.documento
        } else {
          key = data.key
        }
        await registerWithdrawal({
          wallet: String(data.bankOptions),
          document: String(data.clientDocument),
          type: String(data.keyOptions),
          key: String(key),
          amount: String(removeCurrencyWithPrefixMask(data.amount)),
        })
        showToast(
          'success',
          t('Successes.WithdrawalQueue'),
          5000,
          'bottom-left',
        )
        setOpenFormCarousel(false)
        onClose()
        refreshData()
      } catch (error) {
        if (error instanceof Error) {
          showToast(
            'error',
            `${t(`Errors.${error.message}`)}`,
            5000,
            'bottom-left',
          )
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshData],
  )
  function currencyFormatter(value: string): string {
    if (!value) return ''

    const numericValue = value.replace(/\D/g, '')
    if (numericValue === '') return ''

    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(numericValue) / 100)

    return formattedValue
  }

  useEffect(() => {
    setValue('amount', currencyFormatter(valueValue))
  }, [valueValue])

  return (
    <form
      onSubmit={handleSubmit(handleFormUpdate)}
      className="w-[328px] m-auto grid grid-cols-1 pt-xm px-s pb-m justify-center items-center gap-[13px] self-stretch"
    >
      <div className="flex items-center mb-xs">
        <span className="text-BODY-S font-Regular text-grey-500 mr-s">
          {t('Panel.MyWallet.formWithdrawal.WithdrawalInformation')}
        </span>
        <hr className="w-[48%] text-grey-500" />
      </div>
      <Selector
        placeholder={t('Panel.MyWallet.formWithdrawal.ChooseWallet')}
        options={bankOptions}
        value={bankOptionsValue}
        onChange={async (value) => {
          setValue('bankOptions', value)
        }}
      />

      <Selector
        placeholder={t('Panel.MyWallet.formWithdrawal.SelectKeyType')}
        options={keyOptions}
        value={keyOptionsValue}
        onChange={async (value) => {
          setValue('keyOptions', value)
        }}
      />
      {keyOptionsValue === '0' && (
        <Textfield
          value={documentoValue}
          placeholder={t('Panel.MyWallet.formWithdrawal.Document')}
          inputMode="numeric"
          type="text"
          {...register('documento')}
          disabled
        />
      )}

      {keyOptionsValue === '2' && (
        <Textfield
          value={celularValue}
          inputMode="tel"
          placeholder={t('Panel.MyWallet.formWithdrawal.Mobile')}
          type="text"
          {...register('celular')}
          disabled
        />
      )}

      {keyOptionsValue === '1' && (
        <Textfield
          value={emailValue}
          placeholder={t('Panel.MyWallet.formWithdrawal.Email')}
          type="text"
          {...register('email')}
          disabled
        />
      )}

      {keyOptionsValue === '3' && (
        <Textfield
          type="text"
          value={keyValue}
          placeholder={t('Panel.MyWallet.formWithdrawal.EnterKey')}
          {...register('key')}
          variant={errors.key ? 'error' : undefined}
        />
      )}
      <div className="hidden">
        <Textfield
          type="text"
          value={clientDocumentValue}
          placeholder={''}
          inputMode="numeric"
          {...register('clientDocument')}
          variant={errors.clientDocument ? 'error' : undefined}
        />
      </div>
      <div>
        <Textfield
          value={valueValue}
          placeholder={t('Panel.MyWallet.formWithdrawal.Amount')}
          type="text"
          inputMode="numeric"
          {...register('amount')}
          variant={errors.amount ? 'error' : undefined}
          onChange={(e) => {
            const formattedValue = currencyFormatter(e.target.value)
            setValue('amount', formattedValue)

            const numericValue = parseFloat(
              formattedValue.replace(/[^\d,]/g, '').replace(',', '.'),
            )

            setIsBelowMinimum(numericValue < 1)

            setValue('amount', e.target.value, { shouldValidate: true })
          }}
        />
        <span
          className={`text-LABEL-L flex gap-xxs mt-xxs font-Medium mr-s ${isBelowMinimum ? 'text-notify-warning-darkest' : 'text-grey-500'}`}
        >
          <FiAlertCircle />
          {t('Panel.MyWallet.formWithdrawal.MinimumAmount')}
        </span>
      </div>
      <div className="flex gap-xs">
        <Button
          preIcon={<FiArrowLeft width={20} height={20} />}
          type="button"
          size="lg"
          variant="text"
          hasShadow={false}
          width={109}
          onClick={(e) => {
            e.preventDefault()
            onClose()
          }}
        >
          {t('Panel.Whitelist.FormWhitelist.buttonBack')}
        </Button>
        <Button
          type="submit"
          size="lg"
          width={154}
          variant="primary"
          disabled={!isValid || isSubmitting}
        >
          {t('Panel.MyWallet.formWithdrawal.MakeaWithdrawal')}
        </Button>
      </div>
    </form>
  )
}
