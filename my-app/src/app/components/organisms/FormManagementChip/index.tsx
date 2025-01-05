import { currencyFormatter } from '@/bosons/formatters/currencyFormatter'
import { currencyWithPrefixMask } from '@/bosons/formatters/currencyWithPrefixFormatter'
import Button from '@/components/atoms/Button'
import GroupRadio from '@/components/atoms/Radio'
import Selector from '@/components/atoms/Select'
import Textfield from '@/components/atoms/Textfield'
import { showToast } from '@/components/atoms/Toast'
import { getBankList } from '@/services/banks/banks'
import { getChips, putChips } from '@/services/chips/chips'
import { getClubs } from '@/services/clubs/clubs'
import { useMe } from '@/stores/Me'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FiArrowLeft, FiUser } from 'react-icons/fi'
import { z } from 'zod'
import Image from 'next/image'

interface FormManagementChipProps {
  onClose: () => void
  refreshData: () => void
}

interface Data {
  name: string
  id: number
}

export const FormManagementChip = ({
  onClose,
  refreshData,
}: FormManagementChipProps) => {
  const t = useTranslations('Panel.managementChips')
  const formManagementChipSchema = z
    .object({
      app: z.string().min(1, { message: t('Requiredfield') }),
      club: z.string().min(1, { message: t('Requiredfield') }),
      accountOptions: z.string().min(1, { message: t('Requiredfield') }),
      id: z.string().min(1, { message: t('Requiredfield') }),
      radio: z.string().min(1, { message: t('Requiredfield') }),
      amount: z.string().min(1, { message: t('Requiredfield') }),
    })
    .refine((data) => {
      const amount = parseFloat(data.amount.replace(/\D/g, '')) || 0

      if (data.radio === t('WithdrawChips')) {
        return amount < 0 ? false : `R$ -${amount.toFixed(2).replace('.', ',')}`
      } else if (data.radio === 'Adicionar Fichas') {
        return `R$ ${amount.toFixed(2).replace('.', ',')}`
      }

      if (amount <= 0.1) {
        return false
      }

      return true
    })

  type FormManagementChipSchema = z.infer<typeof formManagementChipSchema>
  const [nextButton, setNextButton] = useState(false)
  const [responseAccount, setResponseAccount] = useState<{ data: Data }>()
  const [club, setClub] = useState('')
  const [clubID, setClubID] = useState('')
  const [app, setApp] = useState('')
  const [clubData, setClubData] = useState<{ label: string; value: string }[]>(
    [],
  )
  const [nickname, setNickname] = useState('')
  const [balance, setBalance] = useState('')
  const [id, setId] = useState('')
  const [account, setAccount] = useState('')
  const [amountCheck, setAmountCheck] = useState('')
  const [logo, setLogo] = useState('')
  const [textAmount, setTextAmount] = useState('')
  const [fichasTransaction, setFichasTransaction] = useState('')
  const me = useMe()
  const meApps = me?.me.apps

  const optionsApps = meApps.map((app) => ({
    label: app.name,
    value: app.id.toString(),
  }))

  const accountOptions = responseAccount?.data
    ? Object.entries(responseAccount.data).map((acc) => ({
        label: (acc[1] as { name: string }).name,
        value: (acc[1] as { id: string }).id.toString(),
      }))
    : []
  const {
    watch,
    setError,
    control,
    setValue,
    register,
    handleSubmit,
    formState: { isValid, errors, isSubmitting },
  } = useForm<FormManagementChipSchema>({
    resolver: zodResolver(formManagementChipSchema),
    mode: 'onChange',
  })

  useEffect(() => {
    const fetchbankInfo = async () => {
      try {
        const response = await getBankList()
        setResponseAccount({ data: response.data as unknown as Data })
      } catch (error) {
        if (error instanceof Error) {
          showToast('error', `${error.message}`, 5000, 'bottom-left')
        }
      }
    }

    fetchbankInfo()
  }, [])

  const handleButtonClick = async (data: FormManagementChipSchema) => {
    try {
      let amountParams: number | undefined
      if (data.radio === t('WithdrawChips')) {
        setTextAmount(t('Withdrawn'))
        setFichasTransaction(t('WithdrawChips'))
        amountParams = currencyFormatter.normalize(
          data.amount.replace(/[^\d,.-]/g, ''),
        )
      } else if (data.radio === t('AddChips')) {
        setTextAmount(t('deposit'))
        setFichasTransaction(t('AddChips'))
        amountParams = currencyFormatter.normalize(
          data.amount.replace(/[^\d,.-]/g, ''),
        )
      }
      const response = await getChips({
        clubID: data.club,
        playerID: data.id,
        app: data.app,
        value: String(amountParams),
        bank: data.accountOptions,
      })
      if (response.success === true) {
        setNextButton(true)
        setApp(response.data.app)
        setClub(response.data.nameClub.toString())
        setClubID(response.data.club.toString())
        setNickname(response.data.name)
        setBalance(response.data.coin.toString())
        setId(response.data.id.toString())
        setAccount(response.data.conta.toString())
        setLogo(response.data.picture)
        setAmountCheck(String(amountParams))
      } else if (response.message === 'Invalid player check') {
        setError('id', {
          type: 'manual',
          message: t('idPlayerMsg'),
        })
      }
    } catch (error) {
      setError('id', {
        type: 'manual',
        message: t('idPlayerMsg'),
      })
    }
  }

  const handleButtonClickNext = async (data: FormManagementChipSchema) => {
    try {
      const response = await putChips({
        value:
          data.radio === t('WithdrawChips')
            ? -Math.abs(Number(amountCheck))
            : Number(amountCheck),
        bank: Number(account),
        playerID: Number(id),
        clubID: Number(data.club),
        app: Number(data.app),
        playerName: nickname,
      })

      if (response.success === true) {
        let msgSuccess: string | undefined
        if (data.radio === t('WithdrawChips')) {
          msgSuccess = t('Chipssuccessfullywithdrawn!')
        } else if (data.radio === t('AddChips')) {
          msgSuccess = t('Chipssuccessfullyadded!')
        }
        refreshData()
        onClose()
        showToast('success', `${msgSuccess}`, 5000, 'bottom-left')
      } else {
        showToast('error', `${response.message}`, 5000, 'bottom-left')
      }
    } catch (error) {
      showToast('error', `${error}`, 5000, 'bottom-left')
    }
  }

  const appValue = watch('app')
  const clubValue = watch('club')
  const amountValue = watch('amount')
  const accountValue = watch('accountOptions')
  const idValue = watch('id')

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const { data } = await getClubs(Number(appValue))
        const clubOptions = data.map((club) => ({
          label: club.name,
          value: club.slotID.toString(),
        }))
        setClubData(clubOptions)
      } catch (error) {
        showToast('error', `${error}`, 5000, 'bottom-left')
      }
    }
    if (appValue !== undefined && appValue !== null) {
      fetchClubs()
    }
  }, [appValue])

  return (
    <form
      className="flex flex-col w-full max-w-[328px] mx-auto mt-xm mb-m"
      onSubmit={handleSubmit(handleButtonClick)}
    >
      {nextButton === false && (
        <div>
          <div className="flex flex-col gap-xxs mb-m">
            <div className="flex items-center gap-xxs">
              <span className="w-full max-w-fit text-BODY-S font-Regular text-grey-500">
                {t('information')}
              </span>
              <hr className="mt-1 border-t-1 border-grey-500 w-full" />
            </div>
            <Controller
              name="app"
              control={control}
              render={({ field, fieldState }) => (
                <Selector
                  placeholder={t('SelectApp')}
                  options={optionsApps}
                  onChange={(value) => {
                    field.onChange(value)
                    setValue('club', '') // Reseta o select de club para o estado inicial
                  }}
                  value={appValue}
                  variant={fieldState.error ? 'default' : undefined}
                  validationMessages={
                    errors.app?.message ? [{ message: errors.app.message }] : []
                  }
                />
              )}
            />
            <Controller
              name="club"
              control={control}
              render={({ field }) => (
                <Selector
                  variant="default"
                  placeholder={t('SelectClub')}
                  options={clubData || undefined}
                  onChange={(value) => field.onChange(value)}
                  value={clubValue}
                  validationMessages={
                    errors.club?.message
                      ? [{ message: errors.club.message }]
                      : []
                  }
                />
              )}
            />
            <Textfield
              value={idValue}
              placeholder={t('PlayerID')}
              type="number"
              inputMode="numeric"
              {...register('id')}
              variant={errors.id && 'error'}
              validationMessages={
                errors.id?.message
                  ? [{ message: errors.id?.message, isValid: false }]
                  : []
              }
              numericOnly
            />
            <div className="flex flex-col gap-y-xs mt-s">
              <div className="flex items-center gap-xs">
                <span className="w-full max-w-fit text-BODY-S font-Regular text-grey-500">
                  {t('OperationType')}
                </span>
                <hr className="mt-1 border-t-1 border-grey-500 w-full" />
              </div>
              <GroupRadio
                selected={watch('radio')}
                onChange={(newValue) => setValue('radio', newValue)}
                numberOfRadios={2}
                labels={[t('AddChips'), t('WithdrawChips')]}
              />
            </div>
            <div className="flex items-center gap-xs">
              <span className="w-full max-w-fit text-BODY-S font-Regular text-grey-500">
                {t('Amount')}
              </span>
              <hr className="mt-1 border-t-1 border-grey-500 w-full" />
            </div>
            <Controller
              name="accountOptions"
              control={control}
              render={({ field }) => (
                <Selector
                  variant="default"
                  placeholder={t('SelectAccount')}
                  options={accountOptions}
                  onChange={(label) => {
                    field.onChange(label)
                  }}
                  value={accountValue}
                  placeholderColorVariant="default"
                  validationMessages={
                    errors.accountOptions?.message
                      ? [{ message: errors.accountOptions.message }]
                      : []
                  }
                />
              )}
            />
            <Textfield
              value={currencyWithPrefixMask(amountValue)}
              placeholder={t('Amount')}
              {...register('amount')}
              numericOnly
              inputMode="numeric"
              variant={errors.amount && 'error'}
              validationMessages={
                errors.amount?.message
                  ? [{ message: errors.amount?.message, isValid: false }]
                  : []
              }
            />
          </div>
          <div className="flex items-center gap-s justify-center pb-m mb-l">
            <Button
              preIcon={<FiArrowLeft width={20} height={20} />}
              type="button"
              size="lg"
              variant="text"
              hasShadow={false}
              width={110}
              onClick={(e) => {
                e.preventDefault()
                onClose()
              }}
            >
              {t('buttonBack')}
            </Button>
            <Button
              type="submit"
              size="lg"
              width={169}
              variant="primary"
              disabled={!isValid || isSubmitting}
            >
              {t('next')}
            </Button>
          </div>
        </div>
      )}
      {nextButton === true && (
        <div className="flex flex-col justify-center items-center">
          <div className="flex flex-row gap-xm">
            <div className="flex justify-center">
              <div className="flex justify-end cursor-not-allowed relative">
                <div className="bg-grey-500 w-[80px] h-[80px] rounded-xxl flex items-center justify-center">
                  {logo ? (
                    <Image
                      className="rounded-xxl"
                      src={logo}
                      alt="Logo"
                      width={80}
                      height={80}
                    />
                  ) : (
                    <FiUser className="h-[80] w-[80px] text-grey-700" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-xxs">
              <p className="text-BODY-XM font-Bold">
                App:
                <span className="font-Regular ml-xxs">{app}</span>
              </p>
              <p className="text-BODY-XM font-Bold">
                {t('club')}:
                <span className="font-Regular ml-xxs">
                  {club} ({clubID})
                </span>
              </p>
              <p className="text-BODY-XM font-Bold">
                ID:
                <span className="font-Regular ml-xxs">{id}</span>
              </p>
              <p className="text-BODY-XM font-Bold">
                {t('nickName')}:
                <span className="font-Regular ml-xxs">{nickname}</span>
              </p>
              <p className="text-BODY-XM font-Bold">
                {t('Currentbalance')}:
                <span className="font-Regular ml-xxs">
                  {currencyFormatter.mask(
                    Number(balance).toFixed(2).replace('.', ','),
                  )}
                </span>
              </p>
              <p className="text-BODY-XM font-Bold">
                {t('account')}:
                <span className="font-Regular ml-xxs">{account}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-row gap-xs mt-xm mb-xm">
            <p className="text-BODY-XM flex items-center text-grey-900">
              {t('Amounttobe')} {textAmount}:
            </p>
            <p className="bg-grey-400 rounded-bl-[10px] w-[160px] h-[43px] flex items-center justify-center font-Semibold">
              {currencyFormatter.mask(
                Number(amountCheck).toFixed(2).replace('.', ','),
              )}
            </p>
          </div>
          <div className="flex items-center gap-s justify-center pb-m">
            <Button
              preIcon={<FiArrowLeft width={20} height={20} />}
              type="button"
              size="lg"
              variant="text"
              hasShadow={false}
              width={110}
              onClick={() => {
                setNextButton(false)
              }}
            >
              {t('buttonBack')}
            </Button>
            <Button
              type="button"
              size="lg"
              width={169}
              variant="primary"
              disabled={false}
              onClick={handleSubmit(handleButtonClickNext)}
              preDisabled={isSubmitting}
            >
              {fichasTransaction}
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}
