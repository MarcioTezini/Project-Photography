import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/atoms/Button'
import {
  FiArrowLeft,
  FiArrowRight,
  FiAlertTriangle,
  FiLoader,
} from 'react-icons/fi'
import Selector from '@/components/atoms/Select'
import CardsList from '@/components/atoms/CardsList'
import { showToast } from '@/components/atoms/Toast'
import {
  getLinkInfoById,
  getUserLinks,
  LinkInfoData,
  UserLink,
} from '@/services/user/user'
import Stepper from '@/components/molecules/Stepper'
import Textfield from '@/components/atoms/Textfield'
import { useHomeLoginDialogStore } from '@/stores/HomeLoginStore'
import useDepositDialogStore from '@/stores/DepositDialogStore'
import { currencyFormatter } from '@/bosons/formatters/currencyFormatter'
import {
  DepositQrCodeResponseData,
  generateDepositQrCode,
} from '@/services/transactions/transactions'
import { DepositQrCode } from '@/components/molecules/DepositQrCode'
import Dialog from '@/components/molecules/Dialog'
import { getNotice } from '@/services/notice/notice'
import { useNoticeStore } from '@/stores/NoticeStore'

export function FormDepositDialog() {
  const t = useTranslations('Home.FormDepositDialog.steps')
  const tDialog = useTranslations('Home.FormDepositDialog')

  const formAccountSchema = z
    .object({
      selectOption: z.string().min(1, t('errors.selectAccount')),
      balance: z
        .string()
        .min(1, t('errors.enterAmount'))
        .optional()
        .refine((val) => val !== '0,00', {
          message: t('errors.enterAmount'),
        }),
    })
    .refine(
      (data) => {
        if (data.balance === undefined && step === 2) {
          return false
        }
        return true
      },
      {
        message: t('errors.enterAmount'),
        path: ['balance'],
      },
    )

  type FormRegisterAccountSchema = z.infer<typeof formAccountSchema>

  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [qrCodeData, setQrCodeData] = useState<DepositQrCodeResponseData>(
    {} as DepositQrCodeResponseData,
  )
  const {
    handleCloseDialog,
    isDepositConfirmed,
    isQrCodeExpired,
    isErrorVariant,
    isDepositError,
    setQrCodeExpired,
    setDepositError,
    setErrorVariant,
    setDepositConfirmed,
    openDepositDialog,
  } = useDepositDialogStore()

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
  const [links, setLinks] = useState<UserLink[]>([])
  const [showSelect, setShowSelect] = useState(true)
  const [successLink, setSuccessLink] = useState<boolean>(false)
  const [step, setStep] = useState(1)
  const numberOfSteps = 3
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingLinkInfo, setIsLoadingLinkInfo] = useState(false)
  const [linkInfo, setLinkInfo] = useState<LinkInfoData>()
  const [cardListError, setCardListError] = useState(false)
  const [errorCode, setErrorCode] = useState(0)
  const [minimunValue, setMinimunValue] = useState(null)
  const [maximumValue, setMaximumValue] = useState(null)
  const [valueError, setValueError] = useState(false)

  const {
    watch,
    setValue,
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormRegisterAccountSchema>({
    resolver: zodResolver(formAccountSchema),
    mode: 'onChange',
  })

  const selectValue = watch('selectOption')
  const balance = watch('balance')

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

  const handleGenerateQrCode = async (data: FormRegisterAccountSchema) => {
    try {
      const { selectOption, balance } = data
      const depositCreated = await generateDepositQrCode({
        linkID: parseInt(selectOption, 10),
        amount: currencyFormatter.normalize(balance),
      })

      setQrCodeData(depositCreated)
      handleNextStep()
    } catch (error) {
      if (error instanceof Error) {
        let errorResponse

        try {
          errorResponse = JSON.parse(error.message)
        } catch (e) {
          errorResponse = { message: error.message }
        }

        if (errorResponse.codeText) {
          if (errorResponse.codeText === 'transactionMaximumValue') {
            setMaximumValue(errorResponse.value)
            setValueError(true)
          } else if (errorResponse.codeText === 'transactionMinimalValue') {
            setMinimunValue(errorResponse.value)
            setValueError(true)
          }
        } else {
          switch (error.message) {
            case 'transactionUserDeposit':
              setErrorVariant(2)
              setErrorCode(1023)
              setDepositError(true)
              break
            case 'transactionClientBlocked':
              setErrorVariant(2)
              setErrorCode(11196)
              setDepositError(true)
              break
            case 'transactionPlayerBlackList':
              setErrorVariant(2)
              setErrorCode(1013)
              setDepositError(true)
              break
            case 'transactionWallet':
              setErrorVariant(1)
              setErrorCode(1002)
              setDepositError(true)
              break
            case 'transactionInvalidData':
              setErrorVariant(1)
              setErrorCode(1001)
              setDepositError(true)
              break
            case 'Failed to generate deposit QR code':
              setStep(3)
              setDepositError(true)
              break
            default:
              showToast(
                'error',
                `${t(`errors.${error.message}`)}`,
                5000,
                'bottom-left',
              )
              setCardListError(true)
              break
          }
        }
      } else {
        setStep(3)
        setDepositError(true)
      }
    }
  }

  useEffect(() => {
    const fetchLink = async () => {
      setIsLoading(true)
      try {
        const response = await getUserLinks()

        if (response?.success && Array.isArray(response.data)) {
          const filteredLinkData = response.data.filter(
            (link) => link.verified === 1,
          )

          setLinks(filteredLinkData)
          setSuccessLink(filteredLinkData.length > 0)
        } else {
          setSuccessLink(false)
          setLinks([])
        }
      } catch (error) {
        setSuccessLink(false)
        setLinks([])
        showToast('error', t('qrCode.errorUnknown'), 5000, 'bottom-left')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLink()
    checkE2Instability()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue])

  const handleSelectChange = (value: string) => {
    setSelectedOption(value)
    setValue('selectOption', value)
    setShowSelect(false)
  }

  const handleNextStep = async () => {
    if (step === 1) {
      setIsLoadingLinkInfo(true)
      try {
        // Chama o serviço getChips com os parâmetros necessários
        const response = await getLinkInfoById({
          id: Number(selectedOption),
        })

        setLinkInfo(response.data)

        // Se a resposta for bem-sucedida, avança para o próximo passo
        setIsLoadingLinkInfo(false)
        setStep(2)
      } catch (error) {
        setIsLoadingLinkInfo(false)
        console.error('Erro ao obter Chips:', error)
        showToast('error', t('qrCode.errorUnknown'), 5000, 'bottom-left')
      }
    } else if (step < numberOfSteps + 1) {
      setIsLoadingLinkInfo(false)
      setStep(step + 1)
    }
  }

  const resetDialog = () => {
    setStep(1)
    reset()
    setQrCodeExpired(false)
    setDepositError(false)
    setDepositConfirmed(false)
    setQrCodeData({} as DepositQrCodeResponseData)
    setShowSelect(true)
    setCardListError(false)
    setErrorCode(0)
    setErrorVariant(0)
    setValueError(false)
    setMaximumValue(null)
    setMinimunValue(null)
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
    resetDialog()
    handleCloseDialog()
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
        onCloseClick={() => {
          resetDialog()
        }}
      />
    ),
  }))

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <div className="text-center flex flex-col mb-m mt-xm">
              <span className="text-grey-300 text-BODY-XM mb-s font-Bold">
                {t('chooseLinkedAccount')}
              </span>
            </div>
            <div className="flex flex-col gap-s">
              {showSelect ? (
                <Controller
                  name="selectOption"
                  control={control}
                  render={({ field }) => (
                    <Selector
                      placeholder={t('buttons.selectAccount')}
                      isDarkMode
                      isDarkModeCard
                      value={selectValue || ''}
                      onChange={(value) => {
                        field.onChange(value)
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
      case 2:
        // eslint-disable-next-line no-case-declarations
        const selectedLink = links.find(
          (link) => String(link.id) === selectedOption,
        )

        return (
          <>
            {isDepositError ? (
              <div className="flex flex-col">
                {isErrorVariant === 1 && (
                  <div className="text-center flex flex-col mt-s gap-s">
                    <h1 className="text-notify-warning-normal text-center text-BODY-M font-Bold">
                      ERROR: {errorCode}
                    </h1>
                    <h1 className="text-grey-300 text-H6 font-Bold text-center self-stretch">
                      {t('errors.errorVariant1.title')}
                    </h1>
                    <p className="text-grey-300 text-BODY-S font-Regular text-center">
                      {t('errors.errorVariant2.description')}
                    </p>
                  </div>
                )}
                {isErrorVariant === 2 && (
                  <div className="text-center flex flex-col mt-s gap-s">
                    <h1 className="text-notify-warning-normal text-center text-BODY-M font-Bold">
                      ERROR: {errorCode}
                    </h1>
                    <h1 className="text-grey-300 text-H6 font-Bold text-center self-stretch">
                      {t('errors.errorVariant2.title')}
                    </h1>
                    <p className="text-grey-300 text-BODY-S font-Regular text-center">
                      {t('errors.errorVariant2.description')}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="text-center flex flex-col mb-m mt-xm">
                  <span className="text-grey-300 text-BODY-XM mb-s font-Bold">
                    {t('confirmData')}
                  </span>
                </div>
                {selectedLink && (
                  <CardsList
                    clubs={[
                      {
                        id: selectedLink.playerID.toString(),
                        playerName: selectedLink.playerName,
                        imageUrl: linkInfo?.picture,
                        clubName: selectedLink.clubName,
                        appName: selectedLink.app,
                        balance: currencyFormatter.mask(
                          linkInfo?.clubCoin
                            .toFixed(2)
                            .toString()
                            .replace('.', ',') || undefined,
                        ),
                      },
                    ]}
                    variant={cardListError ? 'error' : undefined}
                    showClubId={false}
                    showCloseIcon={true}
                    onCloseClick={() => {
                      resetDialog()
                    }}
                    payInfo
                    validationMessages={
                      cardListError
                        ? [{ message: t('errors.cardListError') }]
                        : []
                    }
                  />
                )}
                <div className="flex justify-between items-center my-m">
                  <p className="text-BODY-XM text-grey-400">
                    {t('depositAmount')}
                  </p>
                  <div className="w-[205px]">
                    <Textfield
                      value={balance}
                      isDarkMode
                      placeholder={t('buttons.deposit')}
                      type="text"
                      inputMode="numeric"
                      {...register('balance')}
                      variant={
                        errors.balance || valueError ? 'error' : undefined
                      }
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
                                      : undefined
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
            )}
          </>
        )
      case 3:
        return (
          <>
            {isDepositError ? (
              <div className="flex flex-col">
                {isErrorVariant === 0 ? (
                  <div className="text-center flex flex-col mt-xm gap-xs">
                    <div className="text-center flex flex-col gap-0">
                      <h1 className="text-grey-300 text-H6 font-Bold text-center self-stretch">
                        {t('qrCode.errorTitle')}{' '}
                      </h1>
                      <h1 className="text-notify-warning-normal text-H6 font-Bold text-center self-stretch">
                        {t('qrCode.Unexpected')}
                      </h1>
                    </div>

                    <p className="text-grey-300 text-center self-stretch text-BODY-S font-Bold">
                      {t('qrCode.errorMessage')}
                    </p>
                    <p className="text-grey-300 text-BODY-S font-Regular text-center">
                      {t('qrCode.errorInstructions')}
                    </p>
                  </div>
                ) : (
                  isErrorVariant === 3 && (
                    <div className="text-center flex flex-col mt-xm gap-s">
                      <div className="text-center flex flex-col gap-0">
                        <h1 className="text-grey-300 text-H6 font-Bold text-center self-stretch">
                          {t('qrCode.errorTitleVariant3')}
                        </h1>
                        <h1 className="text-notify-warning-normal text-H6 font-Bold text-center self-stretch">
                          {t('qrCode.DepositVariant3')}
                        </h1>
                      </div>
                      <p className="text-grey-300 text-center self-stretch text-BODY-S font-Bold">
                        {t('qrCode.errorMessageVariant3')}
                      </p>
                      <p className="text-grey-300 text-BODY-S font-Regular text-center">
                        {t('qrCode.errorInstructionsVariant3')}
                      </p>
                    </div>
                  )
                )}
              </div>
            ) : isQrCodeExpired ? (
              <div className="flex flex-col">
                <div className="text-center flex flex-col mb-m mt-xm gap-xs">
                  <h1 className="text-grey-300 text-H6 font-Bold text-center self-stretch">
                    {t('qrCode.expiredTitle')}
                  </h1>
                  <p className="text-grey-300 text-center self-stretch text-BODY-S font-Bold">
                    {t('qrCode.expiredMessage')}
                  </p>
                  <p className="text-grey-300 text-BODY-S font-Regular text-center">
                    {t('qrCode.expiredInstructions')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="text-center flex flex-col mb-m mt-xm gap-xs">
                  <h1 className="text-grey-300 text-H6 font-Bold text-center self-stretch">
                    {t('qrCode.successTitle')}
                  </h1>
                  <p className="text-grey-300 text-BODY-S font-Regular text-center">
                    {t('qrCode.successInstructions')}
                  </p>
                  <span className="text-grey-300 text-center text-H6 font-Bold">
                    {balance}
                  </span>
                </div>
                <DepositQrCode
                  qrCodeData={qrCodeData}
                  handleNextStep={handleNextStep}
                />
              </div>
            )}
          </>
        )
      case 4:
        return (
          <>
            {isDepositConfirmed && (
              <div className="text-center flex flex-col mb-m mt-xm gap-xs">
                <h1 className="text-grey-300 text-H6 font-Bold text-center self-stretch">
                  {t('confirmedTitle')}
                </h1>
                <p className="text-grey-300 text-BODY-S font-Regular text-center">
                  {t('confirmedMessage')}
                </p>
                <p className="text-grey-300 text-center self-stretch text-BODY-S font-Bold">
                  {t('contactInstructions')}
                </p>
              </div>
            )}
          </>
        )
      default:
        return null
    }
  }

  return (
    <Dialog
      title={tDialog('title')}
      open={openDepositDialog}
      className="w-[530px] sm:!h-auto sm:!rounded-b-none"
      onClose={() => {
        resetDialog()
        handleCloseDialog()
      }}
      isDarkMode
      position="aside"
    >
      <form
        onSubmit={handleSubmit(handleGenerateQrCode)}
        className="grid grid-cols-1 justify-center items-center gap-s self-stretch max-w-[328px] m-auto sm:mb-xm"
      >
        {isLoading || isLoadingLinkInfo ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <FiLoader className="animate-spin text-H3 text-grey-500" />
          </div>
        ) : !successLink ? (
          <div className="flex flex-col items-center justify-center mt-xxm gap-m">
            <div className="mb-4">
              <FiAlertTriangle className="text-notify-alert-normal w-[80px] h-[80px]" />
            </div>
            <p className="text-H6 text-grey-300 font-Bold text-center mb-2">
              {t('noLinkedAccount.noAccountMessage')}
            </p>
            <p className="text-center text-BODY-S text-grey-300 mb-4">
              {t('noLinkedAccount.infoMessage')}
            </p>
            <p className="text-fichasPay-main-400 text-center text-BODY-S font-Bold">
              {t('noLinkedAccount.linkAccountPrompt')}
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
                {t('buttons.back')}
              </Button>
              <Button
                type="button"
                size="lg"
                width={110}
                isBrandButton
                onClick={handleLinkedAccount}
              >
                {t('buttons.linkAccount')}
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
                  resetDialog()
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
              variant={
                isDepositError || cardListError
                  ? 'error'
                  : isQrCodeExpired
                    ? 'alert'
                    : 'success'
              }
            />
            {renderStepContent()}
            {(step !== 3 || isDepositError || isQrCodeExpired) && (
              <div className="flex items-center gap-s justify-center pb-s mt-xm">
                {step !== 4 && !isDepositError && !isQrCodeExpired && (
                  <Button
                    preIcon={<FiArrowLeft width={20} height={20} />}
                    type="button"
                    size="lg"
                    variant="text"
                    width={110}
                    onClick={(e) => {
                      e.preventDefault()
                      if (step === 1) {
                        resetDialog()
                        handleCloseDialog()
                      } else {
                        resetDialog()
                      }
                    }}
                    isBrandButton
                  >
                    {t('buttons.back')}
                  </Button>
                )}
                <Button
                  addIcon={
                    !isDepositError ? (
                      <FiArrowRight width={20} height={20} />
                    ) : undefined
                  }
                  type={step === 2 ? 'submit' : 'button'}
                  size="lg"
                  width={110}
                  disabled={
                    (!isValid ||
                      isSubmitting ||
                      isLoadingLinkInfo ||
                      cardListError ||
                      valueError) &&
                    !isDepositError &&
                    !isQrCodeExpired &&
                    !isDepositConfirmed
                  }
                  isBrandButton
                  onClick={async () => {
                    if (step === 1 && isValid) {
                      handleNextStep()
                    }
                    if (step === 4 || isQrCodeExpired || isDepositError) {
                      resetDialog()
                    }
                  }}
                >
                  {isDepositError || isQrCodeExpired
                    ? t('buttons.tryAgain')
                    : step < numberOfSteps
                      ? t('buttons.next')
                      : t('buttons.newDeposit')}
                </Button>
              </div>
            )}
          </div>
        )}
      </form>
    </Dialog>
  )
}

export default FormDepositDialog
