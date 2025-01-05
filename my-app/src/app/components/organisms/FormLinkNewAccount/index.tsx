import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/atoms/Button'
import { FiArrowLeft, FiArrowRight, FiCheckSquare } from 'react-icons/fi'
import Textfield from '@/components/atoms/Textfield'
import { useTranslations } from 'next-intl'
import Selector from '@/components/atoms/Select'
import CardsList from '@/components/atoms/CardsList'
import {
  ClubData,
  confirmPlayerLink,
  getLinkNewAccountClubs,
  updatePlayerLink,
} from '@/services/clubs/clubs'
import { showToast } from '@/components/atoms/Toast'
import { useMe } from '@/stores/Me'
import { currencyFormatter } from '@/bosons/formatters/currencyFormatter'
import { removeCurrencyWithPrefixMask } from '@/bosons/formatters/removeCurrencyWithPrefixMask'
import {
  Application,
  getApplications,
} from '@/services/applications/applications'

interface FormAccountProps {
  setOpenFormLogin: (open: boolean) => void
  onClose: () => void
  refreshData: () => void
}

export function FormAccounts({ onClose }: FormAccountProps) {
  const t = useTranslations()
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [apps, setApps] = useState<Application[]>([])
  const [clubs, setClubs] = useState<ClubData[]>([])
  const [selectOptionClub, setSelectOptionClub] = useState<
    { value: string; label: React.ReactNode }[]
  >([])
  const [showSelect, setShowSelect] = useState(true)
  const [step, setStep] = useState(1)
  const me = useMe()
  const customerId = me.me.customer

  const selectOptionApp = apps.map((app) => ({
    label: app.name,
    value: app.id.toString(),
  }))

  const formAccountSchema = z
    .object({
      selectOption: z.string().optional(),
      selectApp: z
        .string()
        .min(1, t('Panel.ApproveWithdrawal.PleasefillintheClubIDfield')),
      idPlayer: z
        .string()
        .min(1, t('Panel.ApproveWithdrawal.PleasefillinthePlayerIDfield')),
      clubId: z.string().optional(),
      money: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (step === 2) {
        const balanceValue = data.money
          ? removeCurrencyWithPrefixMask(data.money)
          : ''
        const numericBalanceValue = Number(balanceValue)

        if (!balanceValue || numericBalanceValue <= 0) {
          ctx.addIssue({
            path: ['money'],
            message: t('Home.DialogWithdrawal.ValueZero'),
            code: z.ZodIssueCode.custom,
          })
        }
      }
      if (customerId === 1) {
        const idclub = data.clubId
        if (!idclub) {
          ctx.addIssue({
            path: ['clubId'],
            message: t('Panel.ApproveWithdrawal.PleasefillintheClubIDfield'),
            code: z.ZodIssueCode.custom,
          })
        }
      }
    })
    .refine(
      (data) => {
        if (customerId === 1) {
          return data.clubId && !data.selectOption
        } else {
          return data.selectOption && !data.clubId
        }
      },
      {
        message: t('Panel.ApproveWithdrawal.PleasefillintheClubIDfield'),
        path: ['clubId', 'selectOption'],
      },
    )

  type FormRegisterAccountSchema = z.infer<typeof formAccountSchema>

  const handleResetClub = () => {
    resetField('selectOption')
    setSelectedOption(null)
    setShowSelect(true)
  }

  const [successLinkNewAccount, setSuccessLinkNewAccount] =
    useState<boolean>(false)
  const [confirmMoney, setConfirmMoney] = useState<boolean>(false)

  const {
    register,
    watch,
    setValue,
    setError,
    resetField,
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormRegisterAccountSchema>({
    resolver: zodResolver(formAccountSchema),
    mode: 'onChange',
  })

  const selectValueApp = watch('selectApp')
  const selectValue = watch('selectOption')
  const idPlayerValue = watch('idPlayer')
  const clubIdValue = watch('clubId')
  const moneyValue = watch('money')

  useEffect(() => {
    const fetchLinkNewAccountInfo = async () => {
      try {
        const appsResponse = await getApplications()
        setApps(appsResponse.data)
        const clubsResponse = await getLinkNewAccountClubs()
        setClubs(clubsResponse.data)
      } catch (error) {
        if (error instanceof Error) {
          showToast('error', `${error.message}`, 5000, 'bottom-left')
        }
      }
    }
    fetchLinkNewAccountInfo()
  }, [setValue])

  useEffect(() => {
    if (selectValueApp) {
      const filteredClubs = clubs.filter(
        (club) => String(club.app) === selectValueApp,
      )
      setSelectOptionClub(
        filteredClubs.map((club) => ({
          value: String(club.slotID),
          label: (
            <CardsList
              clubs={[
                {
                  id: club.slotID,
                  clubName: club.name,
                  imageUrl: club.logo,
                  onIconClick: () => handleResetClub(),
                },
              ]}
              showClubId={false}
              showCloseIcon={true}
            />
          ),
        })),
      )
    } else {
      setSelectOptionClub([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectValueApp, clubs])

  const handleSelectChange = (value: string) => {
    setSelectedOption(value)
    setValue('selectOption', value)
    setShowSelect(false)
  }

  const handleReset = () => {
    setConfirmMoney(false)
    setSuccessLinkNewAccount(false)
    resetField('idPlayer')
    resetField('clubId')
    resetField('selectApp')
    resetField('money')
  }

  const handleFormLinkNewAccount = async (data: FormRegisterAccountSchema) => {
    try {
      const initialResponse = await updatePlayerLink({
        appid: data.selectApp,
        clubid: customerId === 1 ? Number(data.clubId) : Number(selectValue),
        player: Number(data.idPlayer),
      })

      if (initialResponse.step === 1) {
        setSuccessLinkNewAccount(true)
      } else if (initialResponse.step === 2) {
        setStep(2)
        setConfirmMoney(true)
      } else if (initialResponse.step === 4) {
        showToast(
          'error',
          t('Panel.ApproveWithdrawal.limitAttempt'),
          5000,
          'bottom-left',
        )
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Invalid poker link validation') {
          showToast(
            'error',
            t('Home.linkedAccounts.invalidPokerLinkValidation'),
            5000,
            'bottom-left',
          )
        } else if (error.message === 'Club player limit exceeded') {
          showToast(
            'warning',
            t('Home.linkedAccounts.limitExceeded'),
            5000,
            'bottom-left',
          )
        } else if (error.message === 'Club is not ready') {
          showToast(
            'error',
            t('Home.linkedAccounts.invalidClub'),
            5000,
            'bottom-left',
          )
        } else {
          showToast(
            'error',
            t('Home.linkedAccounts.invalidPokerLinkValidation'),
            5000,
            'bottom-left',
          )
        }
      }
    }
  }

  const handleFormConfirmValue = async (data: FormRegisterAccountSchema) => {
    try {
      const confirmResponse = await confirmPlayerLink({
        amount: currencyFormatter.normalize(data.money),
        appid: Number(selectValueApp),
        clubid: customerId === 1 ? Number(data.clubId) : Number(selectValue),
        player: Number(data.idPlayer),
      })
      if (confirmResponse.step === 3) {
        setConfirmMoney(false)
        setSuccessLinkNewAccount(true)
      } else if (confirmResponse.step === 4) {
        showToast(
          'error',
          t('Panel.ApproveWithdrawal.limitAttempt'),
          5000,
          'bottom-left',
        )
      }
    } catch (error) {
      if (error instanceof Error) {
        setError('money', {
          type: 'manual',
          message: t('Home.linkedAccounts.Valorinformadodiferentedoenviado'),
        })
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormLinkNewAccount)}
      className="grid grid-cols-1 justify-center items-center gap-s self-stretch max-w-[328px] m-auto"
    >
      {!confirmMoney ? (
        !successLinkNewAccount ? (
          <div>
            <div className="text-center flex flex-col mb-m mt-xm">
              <span className="text-grey-300 text-BODY-XM mb-s font-Bold">
                {t(
                  'Panel.ApproveWithdrawal.DoyoualreadyhaveanaccountwiththeSupremaapps',
                )}
              </span>
              <span
                style={{ letterSpacing: '-0.6px' }}
                className="text-grey-300 font-Regular text-BODY-XM"
              >
                {t(
                  'Panel.ApproveWithdrawal.LinkyourIDinoursystemtomakewithdrawalsanddeposits',
                )}
              </span>
            </div>
            <div className="flex flex-col gap-s">
              <Controller
                name="selectApp"
                control={control}
                render={({ field, fieldState }) => (
                  <Selector
                    isDarkMode
                    placeholder={t('Panel.ApproveWithdrawal.SelecttheApp')}
                    value={selectValueApp}
                    onChange={(value) => {
                      field.onChange(value)
                      handleResetClub()
                    }}
                    options={selectOptionApp}
                    variant={fieldState.error ? 'default' : undefined}
                  />
                )}
              />
              {customerId === 1 ? (
                <Textfield
                  value={clubIdValue}
                  placeholder={t('Panel.ApproveWithdrawal.IdClub')}
                  type="number"
                  inputMode="numeric"
                  {...register('clubId')}
                  isDarkMode
                  variant={errors.clubId ? 'error' : undefined}
                  validationMessages={
                    errors.clubId?.message
                      ? [
                          {
                            message: t(
                              'Panel.ApproveWithdrawal.PleasefillintheClubIDfield',
                            ),
                          },
                        ]
                      : []
                  }
                  numericOnly
                />
              ) : showSelect ? (
                <Controller
                  name="selectOption"
                  control={control}
                  render={({ field }) => (
                    <Selector
                      placeholder={t('Panel.ApproveWithdrawal.SelecttheClub')}
                      isDarkMode
                      isDarkModeCard
                      value={selectValue || ''}
                      onChange={(value) => {
                        field.onChange(value)
                        handleSelectChange(value)
                      }}
                      options={selectOptionClub}
                      variant={errors.selectOption ? 'default' : undefined}
                    />
                  )}
                />
              ) : (
                <div>
                  {
                    selectOptionClub.find(
                      (option) => option.value === selectedOption,
                    )?.label
                  }
                </div>
              )}
              <Textfield
                value={idPlayerValue}
                placeholder={t('Panel.ApproveWithdrawal.YourPlayerID')}
                type="number"
                inputMode="numeric"
                {...register('idPlayer')}
                isDarkMode
                variant={errors.idPlayer ? 'error' : undefined}
                validationMessages={
                  errors.idPlayer?.message
                    ? [{ message: errors.idPlayer.message }]
                    : []
                }
                numericOnly
              />
            </div>
            <div className="flex items-center gap-s justify-center pb-s mt-xm">
              <Button
                preIcon={<FiArrowLeft width={20} height={20} />}
                type="button"
                size="lg"
                variant="text"
                width={110}
                onClick={(e) => {
                  e.preventDefault()
                  onClose()
                }}
                isBrandButton
              >
                {t('Panel.Account.FormAccount.buttonBack')}
              </Button>
              <Button
                type="submit"
                size="lg"
                variant="primary"
                width={160}
                disabled={!isValid || isSubmitting}
                onClick={() => handleFormLinkNewAccount}
                isBrandButton
              >
                {t('Panel.ApproveWithdrawal.LinkAccount')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="m-auto flex flex-col items-center mt-xm">
            <FiCheckSquare size={80} className="text-notify-success-normal" />
            <span className="text-H6 text-grey-300 font-Bold mt-xm">
              {t('Panel.ApproveWithdrawal.Accountsuccessfullylinked')}
            </span>
            <span className="text-H6 text-notify-success-normal font-Bold mb-xm">
              {t('Panel.ApproveWithdrawal.success')}
            </span>
            <span className="text-grey-300 text-BODY-S font-Regular text-center max-w-[250px] mb-xm">
              {t(
                'Panel.ApproveWithdrawal.Nowjustmakeyourdepositandgetyourchips',
              )}
            </span>
            <div className="mb-s">
              <Button
                addIcon={<FiArrowRight width={20} height={20} />}
                type="submit"
                size="lg"
                variant="primary"
                width={160}
                isBrandButton
                onClick={(e) => {
                  e.preventDefault()
                  onClose()
                }}
              >
                {t('Panel.ApproveWithdrawal.Depositnow')}
              </Button>
            </div>
            <div>
              <button
                type="button"
                onClick={handleSubmit(handleReset)}
                className="text-fichasPay-main-400 text-BODY-XM font-Bold"
              >
                {t('Panel.ApproveWithdrawal.Linkanotheraccount')}
              </button>
            </div>
          </div>
        )
      ) : (
        <div>
          <div className="text-center flex flex-col mb-m mt-xm">
            <span className="text-grey-300 text-BODY-XM mb-s font-Bold">
              {t('Panel.ApproveWithdrawal.textAmout1')}
            </span>
            <span
              style={{ letterSpacing: '-0.6px' }}
              className="text-grey-300 font-Regular text-BODY-XM"
            >
              {t('Panel.ApproveWithdrawal.textAmout')}
            </span>
          </div>
          <div>
            <Textfield
              value={currencyFormatter.mask(moneyValue)}
              placeholder={t('Panel.ApproveWithdrawal.value')}
              inputMode="numeric"
              {...register('money')}
              isDarkMode
              variant={errors.money ? 'error' : undefined}
              validationMessages={
                errors.money?.message ? [{ message: errors.money.message }] : []
              }
            />
          </div>
          <div className="flex items-center gap-s justify-center pb-s mt-xm">
            <Button
              preIcon={<FiArrowLeft width={20} height={20} />}
              type="button"
              size="lg"
              variant="text"
              width={110}
              onClick={(e) => {
                e.preventDefault()
                onClose()
              }}
              isBrandButton
            >
              {t('Panel.Account.FormAccount.buttonBack')}
            </Button>
            <Button
              size="lg"
              type="button"
              variant="primary"
              width={160}
              disabled={!isValid || isSubmitting}
              onClick={handleSubmit(handleFormConfirmValue)}
              isBrandButton
            >
              {t('Home.headerMenu.Confirmar')}
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}

export default FormAccounts
