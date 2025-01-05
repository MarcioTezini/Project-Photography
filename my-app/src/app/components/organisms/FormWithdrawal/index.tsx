import React, { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/atoms/Button'
import {
  FiArrowLeft,
  FiArrowRight,
  FiAlertTriangle,
  FiLoader,
} from 'react-icons/fi'
import { useTranslations } from 'next-intl'
import Selector from '@/components/atoms/Select'
import CardsList from '@/components/atoms/CardsList'
import { showToast } from '@/components/atoms/Toast'
import {
  getUserLinks,
  UserLink,
  getUserLinksCoin,
  UserLinkCoin,
} from '@/services/user/user'
import Stepper from '@/components/molecules/Stepper'
import Textfield from '@/components/atoms/Textfield'
import { useHomeLoginDialogStore } from '@/stores/HomeLoginStore'
import useWithdrawalDialogStore from '@/stores/WithdrawalDialogStore'
import { getUserInfo } from '@/services/wallet/wallet'
import { phoneFormatter } from '@/bosons/formatters/phoneFormatter'
import Image from 'next/image'
import {
  submitWithdrawalRequest,
  WithdrawRequest,
} from '@/services/withdrawal/withdrawal'
import { currencyFormatter } from '@/bosons/formatters/currencyFormatter'
import { cpfFormatter } from '@/bosons/formatters/cpfFormatter'
import { useNoticeStore } from '@/stores/NoticeStore'
import { getNotice } from '@/services/notice/notice'

export function FormWithdrawal() {
  type ErrorVariant = 0 | 1 | 2 | 3 | 4 | 5 | 6
  const t = useTranslations()
  const [step, setStep] = useState(1)
  const numberOfSteps = 3
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { handleCloseDialog } = useWithdrawalDialogStore()

  const {
    hasE2Instability,
    setE2Instability,
    clearE2Instability,
    e2InstabilityInfo,
  } = useNoticeStore((state) => ({
    hasE2Instability: state.hasE2Instability,
    setE2Instability: state.setE2Instability,
    clearE2Instability: state.clearE2Instability,
    e2InstabilityInfo: state.e2InstabilityInfo,
  }))

  const { setOpenLoginDialog } = useHomeLoginDialogStore()
  const [isKeyOptionSelected, setIsKeyOptionSelected] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<
    'success' | 'error' | null
  >(null)
  const hasFetched = useRef(false)

  const [links, setLinks] = useState<UserLink[]>([])
  const [keyOptions] = useState<{ value: string; label: string }[]>([
    { value: '0', label: t('Home.DialogWithdrawal.Document') },
    { value: '2', label: t('Home.DialogWithdrawal.Mobile') },
    { value: '1', label: t('Home.DialogWithdrawal.Email') },
    { value: '3', label: t('Panel.MyWallet.formWithdrawal.RandomKey') },
  ])
  const [selectedClub, setSelectedClub] = useState<UserLinkCoin | null>(null)
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false)
  const [showSelect, setShowSelect] = useState(true)
  const [successLink, setSuccessLink] = useState<boolean>(false)
  const [isWithdrawalError, setIsWhithdrawalError] = useState<boolean>(false)
  const [errorVariant, setErrorVariant] = useState<ErrorVariant>(0)
  const [errorCode, setErrorCode] = useState(0)
  const [minimunValue, setMinimunValue] = useState(null)
  const [maximumValue, setMaximumValue] = useState(null)
  const [valueError, setValueError] = useState(false)
  const [cardListError, setCardListError] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)

  const formAccountSchema = z
    .object({
      selectOption: z
        .string()
        .min(1, t('Home.DialogWithdrawal.PleaseSelectAClub')),
      balance: z.string().optional(),
      key: z.string().optional(),
      amount: z.string().optional(),
      email: z.string().optional(),
      documento: z.string().optional(),
      celular: z.string().optional(),
      keyOptions: z.string().optional(),
      clientDocument: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (step === 2) {
        const balanceValue = data.balance
          ? currencyFormatter.normalize(data.balance)
          : ''
        const numericBalanceValue = Number(balanceValue)

        if (!balanceValue || numericBalanceValue <= 0) {
          ctx.addIssue({
            path: ['balance'],
            message: t('Home.DialogWithdrawal.ValueZero'),
            code: z.ZodIssueCode.custom,
          })
        } else {
          const availableBalance = selectedClub?.clubCoin
            ? Number(selectedClub.clubCoin)
            : null

          if (
            availableBalance === null ||
            availableBalance <= 0 ||
            numericBalanceValue > availableBalance
          ) {
            ctx.addIssue({
              path: ['balance'],
              message: t('Home.DialogWithdrawal.BalanceUnavailable'),
              code: z.ZodIssueCode.custom,
            })
          }
        }
      }

      if (step === 3) {
        if (!data.keyOptions || data.keyOptions.trim() === '') {
          ctx.addIssue({
            path: ['keyOptions'],
            message: t('Home.DialogWithdrawal.keyOptions'),
            code: z.ZodIssueCode.custom,
          })
        } else if (data.keyOptions === '3') {
          const key = data.key
          if (
            !key ||
            !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
              key,
            )
          ) {
            ctx.addIssue({
              path: ['key'],
              message: t('Home.DialogWithdrawal.TherandomPIXkeyisincorrect'),
              code: z.ZodIssueCode.custom,
            })
          }
        }
      }
    })

  type FormRegisterAccountSchema = z.infer<typeof formAccountSchema>

  const {
    watch,
    setValue,
    register,
    control,
    reset,
    resetField,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormRegisterAccountSchema>({
    resolver: zodResolver(formAccountSchema),
    mode: 'onChange',
    defaultValues: {
      selectOption: '',
      balance: '',
      key: '',
      amount: '',
      email: '',
      documento: '',
      celular: '',
      keyOptions: '',
      clientDocument: '',
    },
  })

  const balanceValue = watch('balance')
  const keyOptionsValue = watch('keyOptions')
  const documentoValue = watch('documento')
  const emailValue = watch('email')
  const celularValue = watch('celular')
  const keyValue = watch('key')

  async function checkE2Instability() {
    try {
      const notices = await getNotice('E2', 'instable')
      const e2Notice = notices.find((notice) => notice.status === 1) // Verifica se há status ativo para E2

      if (e2Notice) {
        setE2Instability(true, e2Notice)
      } else {
        clearE2Instability()
      }
    } catch (error) {
      console.error('Error fetching E2 instability data:', error)
      clearE2Instability()
    }
  }

  useEffect(() => {
    const fetchLink = async () => {
      setIsLoading(true)
      try {
        const response = await getUserLinks()

        if (response?.success && Array.isArray(response.data)) {
          const filteredClubData = response.data.filter(
            (club) => club.verified === 1,
          )
          setLinks(filteredClubData)
          setSuccessLink(filteredClubData.length > 0)
        } else {
          setSuccessLink(false)
          setLinks([])
        }
      } catch (error) {
        setSuccessLink(false)
        setLinks([])
        if (error instanceof Error) {
          showToast('error', `Error: ${error.message}`, 5000, 'bottom-left')
        } else {
          showToast('error', 'Unknown error occurred', 5000, 'bottom-left')
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (!hasFetched.current) {
      fetchLink()
      checkE2Instability()
      hasFetched.current = true
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setIsLoading(true)
        const response = await getUserInfo()
        setIsLoading(false)
        setValue('clientDocument', String(response.data.user.document))
        setValue(
          'documento',
          String(cpfFormatter.mask(response.data.user.document)),
        )
        setValue('email', response.data.user.email || '')
        setValue(
          'celular',
          String(phoneFormatter.mask(response.data.user.phone)),
        )
      } catch (error) {
        if (error instanceof Error) {
          showToast('error', `${error.message}`, 5000, 'bottom-left')
        }
      }
    }

    if (keyOptionsValue) {
      fetchUserInfo()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyOptionsValue])

  const handleSelectChange = (value: string) => {
    setSelectedOption(value)
    setValue('selectOption', value)
    setShowSelect(false)
  }

  const handleNextStep = () => {
    setStep((prevStep) => {
      if (prevStep + 1 === 2) {
        setIsLoading(true)
      }
      return prevStep + 1
    })
  }

  useEffect(() => {
    if (step === 2 && selectedClub) {
      setIsLoading(false)
    }
  }, [step, selectedClub])

  const handlePreviousStep = () => {
    if (step > 1) {
      resetField('selectOption')
      setSubmissionStatus(null)
      setSelectedOption(null)
      setShowSelect(false)
      setTimeout(() => setShowSelect(true), 0)
      setStep(step - 1)
    }
  }

  const handleWithdrawal = async (): Promise<'success' | 'error'> => {
    const data: WithdrawRequest = {
      linkID: Number(selectedClub?.id) || 0,
      type: Number(keyOptionsValue),
      key: keyOptionsValue === '3' ? keyValue : '',
      amount: (
        currencyFormatter.normalize(String(balanceValue)) ?? ''
      ).toString(),
    }

    try {
      await submitWithdrawalRequest(data)
      return 'success'
    } catch (error) {
      if (error instanceof Error) {
        let errorResponse: {
          codeText?: string
          value?: null
          message?: string
        } = {}

        try {
          errorResponse = JSON.parse(error.message)
        } catch (e) {
          errorResponse.message = error.message
        }

        const codeToHandle = errorResponse.codeText || error.message
        const value = errorResponse.value

        switch (codeToHandle) {
          case 'transactionMaximumValue':
            setErrorVariant(0)
            setIsWhithdrawalError(true)
            setMaximumValue(value || null)
            setErrorCode(1019)
            break
          case 'transactionMinimalValue':
            setErrorVariant(0)
            setIsWhithdrawalError(true)
            setMinimunValue(value || null)
            setErrorCode(1020)
            break
          case 'transactionDataValidation':
            setErrorVariant(2)
            setIsWhithdrawalError(true)
            setErrorCode(1005)
            break
          case 'transactionClientBlocked':
            setErrorVariant(2)
            setErrorCode(11196)
            setIsWhithdrawalError(true)
            break
          case 'transactionPlayerBlackList':
            setErrorVariant(2)
            setErrorCode(1013)
            setIsWhithdrawalError(true)
            break
          case 'transactionPlayerCheck':
            setErrorVariant(3)
            setErrorCode(1003)
            setIsWhithdrawalError(true)
            break
          case 'transactionUpdatePlayer':
            setErrorVariant(3)
            setErrorCode(1012)
            setIsWhithdrawalError(true)
            break
          case 'transactionPlayerWithdraw':
            setErrorVariant(3)
            setErrorCode(1017)
            setIsWhithdrawalError(true)
            break
          case 'withdrawalLimitExceeded':
            setErrorVariant(4)
            setErrorCode(1018)
            setIsWhithdrawalError(true)
            break
          case 'transactionDocWithdraw':
            setErrorVariant(1)
            setErrorCode(1027)
            setIsWhithdrawalError(true)
            break
          case 'transactionLinkAccount':
            setErrorVariant(5)
            setErrorCode(1001)
            setIsWhithdrawalError(true)
            break
          case 'transactionAgentCheck':
            setErrorVariant(5)
            setErrorCode(1011)
            setIsWhithdrawalError(true)
            break
          case 'transactionAgentWithdraw':
            setErrorVariant(5)
            setErrorCode(1014)
            setIsWhithdrawalError(true)
            break
          case 'transactionAgentNotFound':
            setErrorVariant(5)
            setErrorCode(1015)
            setIsWhithdrawalError(true)
            break
          case 'transactionSAgentNotFound':
            setErrorVariant(5)
            setErrorCode(1016)
            setIsWhithdrawalError(true)
            break
          case 'transactionWithdraw':
            setErrorVariant(6)
            setErrorCode(1009)
            setIsWhithdrawalError(true)
            break
          case 'transactionWithdrawQueue':
            setErrorVariant(6)
            setErrorCode(1098)
            setIsWhithdrawalError(true)
            break
          case 'transactionWithdrawFunds':
            setErrorVariant(6)
            setErrorCode(1021)
            setIsWhithdrawalError(true)
            break
          default:
            break
        }

        setSubmissionStatus('error')
      } else {
        setStep(3)
        setIsWhithdrawalError(true)
        setSubmissionStatus('error')
      }
    } finally {
      setIsSubmittingLocal(false)
    }

    return 'error'
  }

  const resetAllFields = () => {
    reset({
      keyOptions: '',
      documento: '',
      celular: '',
      email: '',
      key: '',
    })
    setSelectedOption(null)
    setShowSelect(false)
    setIsKeyOptionSelected(false)
    setCardListError(false)
    setErrorCode(0)
    setErrorVariant(0)
    setValueError(false)
    setMaximumValue(null)
    setMinimunValue(null)
    setSelectedClub(null)
    setIsWhithdrawalError(false)

    setTimeout(() => setShowSelect(true), 0)

    setSubmissionStatus(null)
    setStep(1)
  }

  const handleSubmit = async (
    e?:
      | React.MouseEvent<HTMLButtonElement>
      | React.KeyboardEvent<HTMLFormElement>,
  ) => {
    e?.preventDefault()

    if (submissionStatus === 'success' || submissionStatus === 'error') {
      setStep(1)
      resetAllFields()
    } else if (step === 3 && submissionStatus === null) {
      setIsLoading(true)
      const result = await handleWithdrawal()
      setSubmissionStatus(result)
      setIsLoading(false)
      if (result === 'success') {
        handleNextStep()
      }
    } else if (step === 1) {
      setIsLoading(true)
      try {
        const response = await getUserLinksCoin(Number(selectedOption))

        if (response && response.success && response.data) {
          const clubData = response.data
          setSelectedClub(clubData)
          handleNextStep()
        }
      } catch (error) {
        if (error instanceof Error) {
          let errorResponse: { codeText?: string; message?: string } = {}

          try {
            errorResponse = JSON.parse(error.message)
          } catch (e) {
            errorResponse.message = error.message
          }

          const codeToHandle = errorResponse.codeText || error.message

          switch (codeToHandle) {
            case 'userAccessDenied':
              setErrorVariant(2)
              setErrorCode(1018)
              setIsWhithdrawalError(true)
              setIsLoading(false)
              setNameError(codeToHandle)
              break
            case 'userDataValidation':
              setErrorVariant(2)
              setErrorCode(1019)
              setIsWhithdrawalError(true)
              setIsLoading(false)
              setNameError(codeToHandle)
              break
            default:
              break
          }

          setSubmissionStatus('error')
        } else {
          setStep(3)
          setIsWhithdrawalError(true)
          setSubmissionStatus('error')
        }
      }
    } else {
      handleNextStep()
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'balance',
  ) => {
    const inputValue = e.target.value
    const formattedValue = currencyFormatter.mask(inputValue)
    setValue(field, formattedValue, { shouldValidate: true })
  }

  const handleLinkedAccount = () => {
    setOpenLoginDialog(true)
    handleCloseDialog()
  }

  const handleKeyOptionChange = (value: string) => {
    setValue('keyOptions', value)
    setIsKeyOptionSelected(!!value)
  }

  const selectOption = links.map((link) => ({
    value: String(link.id),
    label: (
      <CardsList
        clubs={[
          {
            id: link.playerID.toString(),
            playerName: link.playerName,
            imageUrl: link.logo,
            clubName: link.clubName,
            appName: link.app,
          },
        ]}
        showClubId={false}
        showCloseIcon={true}
      />
    ),
  }))

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1: {
        return (
          <div>
            <div className="text-center flex flex-col mb-m mt-xm">
              <span className="text-grey-300 text-BODY-XM mb-s font-Bold">
                {t('Home.DialogWithdrawal.LinkedAccount')}
              </span>
            </div>
            <div className="flex flex-col gap-s">
              {showSelect ? (
                <Controller
                  name="selectOption"
                  control={control}
                  render={({ field }) => (
                    <Selector
                      placeholder={t('Home.DialogWithdrawal.SelecttheClub')}
                      isDarkMode
                      isDarkModeCard
                      value={field.value || ''}
                      onChange={(value) => {
                        field.onChange(value)
                        setSelectedOption(value)
                        handleSelectChange(value)
                      }}
                      options={selectOption}
                      variant={errors.selectOption ? 'default' : undefined}
                    />
                  )}
                />
              ) : (
                <div>
                  {
                    selectOption.find(
                      (option) => option.value === selectedOption,
                    )?.label
                  }
                </div>
              )}
            </div>
          </div>
        )
      }
      case 2: {
        if (isWithdrawalError) {
          return (
            <div className="flex flex-col">
              {errorVariant === 2 && (
                <div className="text-center flex flex-col mt-s gap-s">
                  <h1 className="text-notify-warning-normal text-center text-BODY-M font-Bold">
                    ERROR: {errorCode}
                  </h1>
                  <h1 className="text-grey-300 text-H6 font-Bold text-center self-stretch">
                    {errorCode === 1018
                      ? t('Home.DialogWithdrawal.errors.userAccessDenied')
                      : t('Home.DialogWithdrawal.errors.userDataValidation')}
                  </h1>
                  <p className="text-grey-300 text-BODY-S font-Regular text-center">
                    {t(
                      'Home.DialogWithdrawal.errors.errorVariant2.description',
                    )}
                  </p>
                </div>
              )}
            </div>
          )
        }

        return (
          <div>
            <div className="text-center flex flex-col mb-m mt-xm">
              <span className="text-grey-300 text-BODY-XM mb-s font-Bold">
                {t('Home.DialogWithdrawal.ConfirmYourDetails')}
              </span>
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[300px]">
                <FiLoader className="animate-spin text-H3 text-grey-500" />
              </div>
            ) : selectedClub ? (
              <CardsList
                clubs={[
                  {
                    id: selectedClub?.playerID?.toString(),
                    playerName: selectedClub?.nick,
                    imageUrl: selectedClub?.picture,
                    clubName: selectedClub?.clubName,
                    appName: selectedClub?.app,
                    balance:
                      currencyFormatter.mask(
                        Number(selectedClub?.clubCoin)
                          .toFixed(2)
                          .toString()
                          .replace('.', ','),
                      ) || undefined,
                  },
                ]}
                showClubId={false}
                variant={cardListError ? 'error' : undefined}
                payInfo
                validationMessages={
                  cardListError
                    ? [
                        {
                          message: t(
                            'Home.DialogWithdrawal.errors.cardListError',
                          ),
                        },
                      ]
                    : []
                }
              />
            ) : null}

            <div className="flex justify-between items-center my-m">
              <p className="text-BODY-XM text-grey-400">
                {t('Home.DialogWithdrawal.Withdrawal')}:
              </p>
              <div className="w-[205px]">
                <Textfield
                  value={balanceValue}
                  isDarkMode
                  placeholder={t('Home.DialogWithdrawal.Saque')}
                  inputMode="numeric"
                  {...register('balance')}
                  variant={errors.balance || valueError ? 'error' : undefined}
                  onChange={(e) => {
                    handleChange(e, 'balance')
                    setValueError(false)
                    setMaximumValue(null)
                    setMinimunValue(null)
                  }}
                  validationMessages={
                    valueError
                      ? [
                          {
                            message: `${minimunValue !== null ? t('errors.minValue') : maximumValue !== null ? t('errors.maxValue') : undefined} ${
                              minimunValue !== null
                                ? currencyFormatter.mask(
                                    Number(minimunValue)
                                      .toFixed(2)
                                      .toString()
                                      .replace('.', ','),
                                  )
                                : maximumValue !== null
                                  ? currencyFormatter.mask(
                                      Number(maximumValue)
                                        .toFixed(2)
                                        .toString()
                                        .replace('.', ','),
                                    )
                                  : ''
                            }`,
                          },
                        ]
                      : errors.balance?.message
                        ? [{ message: errors.balance.message }]
                        : []
                  }
                />
              </div>
            </div>
          </div>
        )
      }
      case 3: {
        return (
          <>
            {submissionStatus === null ? (
              <div>
                <div className="text-center flex flex-col mb-m mt-xm">
                  <span className="text-grey-300 text-BODY-XM mb-m font-Bold">
                    {t('Home.DialogWithdrawal.ConfirmTheAmount')}
                  </span>
                  <div>
                    <p className="text-BODY-S text-grey-300">
                      {t('Home.DialogWithdrawal.Withdrawal')}:
                    </p>
                    <p className="text-H6 text-grey-300 font-Bold my-xs">
                      {balanceValue}
                    </p>
                  </div>
                  <div className="flex flex-col gap-s mt-xm">
                    <Selector
                      placeholder={t('Home.DialogWithdrawal.SelectKeyType')}
                      options={keyOptions}
                      value={keyOptionsValue ?? ''}
                      onChange={handleKeyOptionChange}
                      isDarkMode
                    />
                    {keyOptionsValue === '0' && (
                      <Textfield
                        value={cpfFormatter.mask(documentoValue)}
                        placeholder={t('Home.DialogWithdrawal.Document')}
                        type="text"
                        inputMode="numeric"
                        {...register('documento')}
                        disabled
                        isDarkMode
                      />
                    )}

                    {keyOptionsValue === '2' && (
                      <Textfield
                        value={celularValue}
                        placeholder={t('Home.DialogWithdrawal.Mobile')}
                        type="text"
                        inputMode="tel"
                        {...register('celular')}
                        isDarkMode
                        disabled
                      />
                    )}

                    {keyOptionsValue === '1' && (
                      <Textfield
                        value={emailValue}
                        placeholder={t('Home.DialogWithdrawal.Email')}
                        type="text"
                        {...register('email')}
                        isDarkMode
                        disabled
                      />
                    )}

                    {keyOptionsValue === '3' && (
                      <Textfield
                        type="text"
                        value={keyValue}
                        placeholder={t('Home.DialogWithdrawal.EnterKey')}
                        {...register('key')}
                        isDarkMode
                        variant={errors.key ? 'error' : undefined}
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : isWithdrawalError ? (
              <div className="flex flex-col">
                {errorVariant === 0 && (
                  <div className="text-center flex flex-col mt-s gap-s">
                    <h1 className="text-notify-warning-normal text-center text-BODY-M font-Bold">
                      ERROR: {errorCode}
                    </h1>
                    <h1 className="text-grey-300 text-H6 font-Bold text-center self-stretch">
                      {t('Home.DialogWithdrawal.errors.errorVariant2.title')}
                    </h1>
                    <div className="text-center">
                      {errorCode === 1020 && (
                        <>
                          <p className="text-grey-300 text-BODY-L font-Regular text-center self-stretch">
                            {t('Home.DialogWithdrawal.errors.minValue')}
                          </p>
                          {minimunValue !== null && (
                            <p className="text-grey-300 text-H6 font-Bold text-center self-stretch">
                              {currencyFormatter.mask(
                                Number(minimunValue)
                                  .toFixed(2)
                                  .toString()
                                  .replace('.', ','),
                              )}
                            </p>
                          )}
                        </>
                      )}
                      {errorCode === 1019 && (
                        <>
                          <p className="text-grey-300 text-BODY-L font-Regular text-center self-stretch">
                            {t('Home.DialogWithdrawal.errors.maxValue')}
                          </p>
                          {maximumValue !== null && (
                            <p className="text-grey-300 text-H6 font-Bold text-center self-stretch">
                              {currencyFormatter.mask(
                                Number(maximumValue)
                                  .toFixed(2)
                                  .toString()
                                  .replace('.', ','),
                              )}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    <p className="text-grey-300 text-BODY-S font-Regular text-center">
                      {t(
                        'Home.DialogWithdrawal.errors.errorVariant3.description',
                      )}
                    </p>
                  </div>
                )}
                {errorVariant === 1 && (
                  <div className="text-center flex flex-col mt-s gap-s">
                    <h1 className="text-notify-warning-normal text-center text-BODY-M font-Bold">
                      ERROR: {errorCode}
                    </h1>
                    <h1 className="text-grey-300 text-H6 font-Bold text-center self-stretch">
                      {t('Home.DialogWithdrawal.errors.errorVariant1.title')}
                    </h1>
                    <p className="text-grey-300 text-BODY-S font-Regular text-center">
                      {t(
                        'Home.DialogWithdrawal.errors.errorVariant1.description',
                      )}
                    </p>
                  </div>
                )}
                {errorVariant === 2 && (
                  <div className="text-center flex flex-col mt-s gap-s">
                    <h1 className="text-notify-warning-normal text-center text-BODY-M font-Bold">
                      ERROR:{' '}
                      {errorCode === 1005
                        ? t(
                            'Home.DialogWithdrawal.errors.transactionDataValidation',
                          )
                        : errorCode}
                    </h1>
                    <h1 className="text-grey-300 text-H6 font-Bold text-center self-stretch">
                      {t('Home.DialogWithdrawal.errors.errorVariant2.title')}
                    </h1>
                    <p className="text-grey-300 text-BODY-S font-Regular text-center">
                      {t(
                        'Home.DialogWithdrawal.errors.errorVariant2.description',
                      )}
                    </p>
                  </div>
                )}
                {errorVariant === 3 && (
                  <div className="text-center flex flex-col mt-s gap-s">
                    <h1 className="text-notify-warning-normal text-center text-BODY-M font-Bold">
                      ERROR: {errorCode}
                    </h1>
                    <h1 className="text-grey-300 text-H6 font-Bold text-center self-stretch">
                      {t('Home.DialogWithdrawal.errors.errorVariant3.title')}
                    </h1>
                    <p className="text-grey-300 text-BODY-S font-Regular text-center">
                      {t(
                        'Home.DialogWithdrawal.errors.errorVariant3.description',
                      )}
                    </p>
                  </div>
                )}
                {errorVariant === 4 && (
                  <div className="text-center flex flex-col mt-s gap-s">
                    <h1 className="text-notify-warning-normal text-center text-BODY-M font-Bold">
                      ERROR: {errorCode}
                    </h1>
                    <h1 className="text-grey-300 text-H6 font-Bold text-center self-stretch">
                      {t('Home.DialogWithdrawal.errors.errorVariant4.title')}
                    </h1>
                    <p className="text-grey-300 text-BODY-S font-Regular text-center">
                      {t(
                        'Home.DialogWithdrawal.errors.errorVariant4.description',
                      )}
                    </p>
                  </div>
                )}
                {errorVariant === 5 && (
                  <div className="flex flex-col gap-s my-s text-center">
                    <div>
                      <h1 className="text-notify-warning-normal text-center mb-s text-BODY-M font-Bold">
                        ERROR: {errorCode}
                      </h1>
                      <p className="text-H6 font-Bold text-grey-300">
                        {t('Home.DialogWithdrawal.AnErrorOccurred')}
                      </p>
                      <p className="text-H6 font-Bold text-notify-warning-normal">
                        {t('Home.DialogWithdrawal.Error')}
                      </p>
                    </div>
                    <div>
                      <p className="text-BODY-S font-Bold text-grey-300">
                        {(() => {
                          const errorMessages: { [key: number]: string } = {
                            1011: t(
                              'Home.DialogWithdrawal.errors.errorVariant5.title',
                            ),
                            1014: t(
                              'Home.DialogWithdrawal.errors.errorVariant5.title',
                            ),
                            1015: t(
                              'Home.DialogWithdrawal.errors.errorVariant5.title',
                            ),
                            1016: t(
                              'Home.DialogWithdrawal.errors.errorVariant7.title',
                            ),
                            1001: t(
                              'Home.DialogWithdrawal.errors.errorVariant6.title',
                            ),
                          }

                          return errorMessages[errorCode]
                        })()}
                      </p>
                    </div>

                    <div>
                      <p className="text-BODY-S font-Regular text-grey-300">
                        {t('Home.DialogWithdrawal.FewMoments')}
                      </p>
                    </div>
                  </div>
                )}
                {errorVariant === 6 && (
                  <div className="flex flex-col gap-s my-s text-center">
                    <div>
                      <h1 className="text-notify-warning-normal text-center mb-s text-BODY-M font-Bold">
                        ERROR: {errorCode}
                      </h1>
                      <p className="text-H6 font-Bold text-grey-300">
                        {t('Home.DialogWithdrawal.AnErrorOccurred')}
                      </p>
                      <p className="text-H6 font-Bold text-notify-warning-normal">
                        {t('Home.DialogWithdrawal.Error')}
                      </p>
                    </div>
                    <div>
                      <p className="text-BODY-S font-Bold text-grey-300">
                        {t('Home.DialogWithdrawal.RegisterYourRequest')}
                      </p>
                    </div>
                    <div>
                      <p className="text-BODY-S font-Regular text-grey-300">
                        {t('Home.DialogWithdrawal.FewMoments')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </>
        )
      }
      case 4: {
        const selectedValue =
          keyOptionsValue === '0'
            ? documentoValue
            : keyOptionsValue === '1'
              ? emailValue
              : keyOptionsValue === '2'
                ? celularValue
                : keyOptionsValue === '3'
                  ? keyValue
                  : ''
        return (
          <>
            {submissionStatus === 'success' ? (
              <div className="flex flex-col gap-s my-s text-center items-center">
                <div>
                  <p className="text-H6 font-Bold text-grey-300">
                    {t('Home.DialogWithdrawal.RequestReceivedWith')}
                  </p>
                  <p className="text-H6 font-Bold text-notify-success-normal">
                    {t('Home.DialogWithdrawal.Success')}
                  </p>
                </div>
                <div className="border border-grey-300 rounded-sm px-[32px] py-[16px] w-[225px]">
                  <p className="text-H6 font-Bold text-grey-300">
                    {balanceValue}
                  </p>
                  <p className="text-BODY-S font-Regular text-grey-300">
                    {t('Home.DialogWithdrawal.Pix')} {selectedValue}
                  </p>
                </div>
                <div>
                  <p className="text-BODY-S font-Regular text-grey-300">
                    {t('Home.DialogWithdrawal.RequestIsBeing')}{' '}
                  </p>
                </div>
                <div>
                  <p className="text-BODY-S font-Bold text-grey-300">
                    {t('Home.DialogWithdrawal.ContactYourClub')}
                  </p>
                </div>
              </div>
            ) : null}
          </>
        )
      }
      default:
        return null
    }
  }

  return (
    <form
      className="grid grid-cols-1 justify-center items-center gap-s self-stretch max-w-[328px] m-auto"
      onKeyDown={handleKeyDown}
    >
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <FiLoader className="animate-spin text-H3 text-grey-500" />
        </div>
      ) : !successLink ? (
        <div className="flex flex-col items-center justify-center mt-xxm gap-m">
          <div className="mb-4">
            <FiAlertTriangle className="text-notify-alert-normal w-[80px] h-[80px]" />
          </div>
          <p className="text-H6 text-grey-300 font-Bold text-center mb-2">
            {t('Home.DialogWithdrawal.YouStill')}{' '}
            <span className="text-notify-alert-normal">
              {t('Home.DialogWithdrawal.DoesNotHave')}{' '}
            </span>
            {t('Home.DialogWithdrawal.LinkedAccountStep')}
          </p>
          <p className="text-center text-BODY-S text-grey-300 mb-4">
            {t('Home.DialogWithdrawal.OneLinkedAccount')}
          </p>
          <p className="text-fichasPay-main-400 text-center text-BODY-S font-Bold">
            {t('Home.DialogWithdrawal.DoYouWantToLink')}
          </p>
          <div className="flex items-center gap-s justify-center pb-s mt-xm">
            <Button
              preIcon={<FiArrowLeft width={20} height={20} />}
              type="button"
              size="lg"
              variant="text"
              width={110}
              onClick={() => {
                handleCloseDialog()
              }}
              isBrandButton
            >
              {t('Panel.Account.FormAccount.buttonBack')}
            </Button>
            <Button
              type="button"
              size="lg"
              width={110}
              isBrandButton
              onClick={handleLinkedAccount}
            >
              {t('Home.DialogWithdrawal.LinkAccount')}
            </Button>
          </div>
        </div>
      ) : hasE2Instability ? (
        <div className="flex flex-col items-center justify-center mt-xl gap-xm">
          <FiAlertTriangle className="text-notify-alert-normal w-[80px] h-[80px]" />
          <p className="text-H6 text-grey-300 font-Bold text-center mb-2">
            Aviso{' '}
            <span className="text-notify-alert-normal text-H6 font-Bold">
              importante!
            </span>
          </p>
          <div className="flex flex-col items-start gap-xs self-stretch">
            <p className="self-stretch text-center text-grey-300 text-BODY-S font-Regular">
              {e2InstabilityInfo?.subTitle}
            </p>
            <p className="self-stretch text-center text-grey-300 text-BODY-XM font-Bold">
              {e2InstabilityInfo?.body}
            </p>
          </div>
          <div className="flex flex-col items-center gap-s">
            <Button
              type="button"
              size="lg"
              width={110}
              isBrandButton
              onClick={() => clearE2Instability()}
            >
              Continuar mesmo assim
            </Button>
            <Button
              preIcon={<FiArrowLeft width={20} height={20} />}
              type="button"
              size="lg"
              variant="text"
              width={110}
              onClick={(e) => {
                e.preventDefault()
                resetAllFields()
                handleCloseDialog()
              }}
              isBrandButton
            >
              Voltar
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <Stepper
            step={step}
            numberOfSteps={numberOfSteps}
            variant={submissionStatus === 'error' ? 'error' : 'success'}
          />
          {renderStepContent()}
          <div className="flex items-center gap-s justify-center pb-s mt-xm">
            <div className="flex items-center gap-s">
              {step !== 3 && step !== 4 && (
                <Button
                  preIcon={<FiArrowLeft width={20} height={20} />}
                  type="button"
                  size="lg"
                  variant="text"
                  width={110}
                  onClick={(e) => {
                    e.preventDefault()
                    if (step === 1) {
                      handleCloseDialog()
                    } else {
                      setErrorCode(0)
                      handlePreviousStep()
                    }
                  }}
                  isBrandButton
                >
                  {t('Home.DialogWithdrawal.buttonBack')}
                </Button>
              )}
              {!(
                (errorCode === 1018 && nameError === 'userAccessDenied') ||
                (errorCode === 1019 && nameError === 'userDataValidation')
              ) && (
                <Button
                  addIcon={<FiArrowRight width={20} height={20} />}
                  type="button"
                  size="lg"
                  width={110}
                  disabled={
                    !isValid ||
                    isSubmitting ||
                    isSubmittingLocal ||
                    (step === 3 && !isKeyOptionSelected)
                  }
                  isBrandButton
                  onClick={handleSubmit}
                >
                  {step < numberOfSteps
                    ? t('Home.DialogWithdrawal.ButtonNext')
                    : step === 4 && submissionStatus === 'success'
                      ? t('Home.DialogWithdrawal.ButtonNewWithdrawal')
                      : step === 3 && submissionStatus === 'error'
                        ? t('Home.DialogWithdrawal.ButtonTryAgain')
                        : t('Home.DialogWithdrawal.ButtonWithdrawal')}
                </Button>
              )}
            </div>
          </div>

          {step === 3 && !isWithdrawalError && (
            <div className="flex justify-center mt-xm">
              <Image src="/images/pix.svg" width={92} height={32} alt="pix" />
            </div>
          )}
        </div>
      )}
    </form>
  )
}
export default FormWithdrawal
