import { currencyFormatter } from '@/bosons/formatters/currencyFormatter'
import Selector from '@/components/atoms/Select'
import Textfield from '@/components/atoms/Textfield'
import Dialog from '@/components/molecules/Dialog'
import { DialogButton } from '@/components/molecules/DialogButton'
import { IDeposit } from '@/entities/deposit'
import depositService from '@/services/deposit/deposit'
import { useMe } from '@/stores/Me'
import { UseTranslationsReturn } from '@/types/use-translations-return'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { QrCode } from '../QrCode'
import {
  IDataTablePagination,
  IDataTableSorting,
} from '@/components/molecules/DataTable/types'
import { MyWalletlist } from '@/services/wallet/wallet'
import { useMyWalletStore } from '@/stores/MyWallet'

interface DepositProps {
  onCancel?: () => void
  onLoadTransactions: (
    pagination: IDataTablePagination,
    currentSorting: IDataTableSorting,
  ) => Promise<MyWalletlist[]>
}

const formDepositDataSchema = (t: UseTranslationsReturn) =>
  z.object({
    depositWallet: z.string(),
    depositValue: z
      .string()
      .refine((val) => currencyFormatter.normalize(val) >= 1, {
        message: t('Panel.MyWallet.deposit.errors.minimumDeposit'),
      }),
  })

export type DepositDataSchema = z.infer<
  ReturnType<typeof formDepositDataSchema>
>

export const Deposit: React.FC<DepositProps> = ({
  onCancel,
  onLoadTransactions,
}) => {
  const t = useTranslations()
  const [openQrCode, setOpenQrCode] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<IDeposit>({} as IDeposit)
  const [loading, setLoading] = useState<boolean>(false)
  const { me } = useMe()
  const { currentSorting, currentPagination } = useMyWalletStore()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<DepositDataSchema>({
    resolver: zodResolver(formDepositDataSchema(t)),
    mode: 'onChange',
  })

  const depositWallet = watch('depositWallet')
  const depositValue = watch('depositValue')

  const handleGenerateQrCode = async () => {
    setLoading(true)
    try {
      if (!me.user) return
      const userParsed = me.user
      const depositCreated = await depositService.create({
        wallet: Number(depositWallet),
        document: userParsed.document,
        amount: currencyFormatter.normalize(depositValue),
      })
      setQrCodeData(depositCreated.data)
      setOpenQrCode(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form
        className="flex flex-col w-full max-w-[328px] mx-auto mt-xm"
        onSubmit={handleSubmit(() => handleGenerateQrCode())}
      >
        <div className="flex flex-col gap-y-s">
          <div className="flex items-center gap-xs">
            <span className="w-full max-w-fit text-BODY-S font-Regular text-grey-500">
              {t('Panel.MyWallet.deposit.title')}
            </span>
            <hr className="mt-1 border-t-1 border-grey-500 w-full" />
          </div>

          <Selector
            placeholder={t('Panel.MyWallet.deposit.wallet')}
            {...register('depositWallet')}
            value={depositWallet}
            onChange={(value) =>
              setValue('depositWallet', value, { shouldValidate: true })
            }
            options={me?.wallets?.map((wallet) => ({
              value: String(wallet.id),
              label: wallet.name,
            }))}
          />
          <div>
            <Textfield
              value={currencyFormatter.mask(depositValue)}
              placeholder={t('Panel.MyWallet.deposit.value')}
              inputMode="numeric"
              {...register('depositValue')}
              variant={errors.depositValue && 'error'}
              validationMessages={
                errors.depositValue?.message
                  ? [{ message: errors.depositValue?.message, isValid: false }]
                  : []
              }
            />
            {!errors.depositValue?.message && (
              <span className=" text-LABEL-L font-Medium text-grey-600 flex flex-col gap-xxs pt-xxs mt-xs">
                {t('Panel.MyWallet.deposit.errors.minimumDeposit')}
              </span>
            )}
          </div>
        </div>

        <DialogButton
          buttonName={t('Panel.MyWallet.deposit.generateQrCode')}
          primary={{
            variant: 'primary',
            type: 'submit',
            preDisabled: loading,
            disabled: !isValid,
            size: 'lg',
          }}
          secondary={{
            variant: 'text',
            onClick: onCancel,
            size: 'lg',
          }}
        />
      </form>

      <Dialog
        title="Depositar"
        open={openQrCode}
        onClose={() => {
          setOpenQrCode(false)
          onCancel?.()
          onLoadTransactions?.(currentPagination, currentSorting)
        }}
        position="aside"
        className="min-w-[532px] sm:min-w-full sm:h-[550px]"
      >
        <QrCode
          onCancel={() => {
            setOpenQrCode(false)
            onCancel?.()
            onLoadTransactions?.(currentPagination, currentSorting)
          }}
          qrCodeData={qrCodeData}
        />
      </Dialog>
    </>
  )
}
