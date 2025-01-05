import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/atoms/Button'
import { FiAlertCircle, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi'
import Textfield from '@/components/atoms/Textfield'
import Selector from '@/components/atoms/Select'
import Switch from '@/components/atoms/Switch'
import { showToast } from '@/components/atoms/Toast'
import validatePhone from '@/utils/validatePhone'
import { getApplications } from '@/services/applications/applications'
import {
  getAgentsInfoInWhitelist,
  getPayment,
  updateAutoWhitelist,
} from '@/services/agent/agent'
import { useTranslations } from 'next-intl'
import { Tooltip } from '@/components/atoms/Tooltip'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import Dialog from '@/components/molecules/Dialog'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'
import { phoneFormatter } from '@/bosons/formatters/phoneFormatter'

interface FormWhitelistProps {
  onClose: () => void
  setOpenAddAgentDialog: (open: boolean) => void
  id: number | null
  refreshData: () => void
}

const useFetchOptions = (
  id: number | null,
  setApplicationOptions: (options: { value: string; label: string }[]) => void,
  setPaymentOptions: (options: { value: string; label: string }[]) => void,
  setSelectedOptionApp: (option: string) => void,
  setSelectedOptionPay: (option: string) => void,
) => {
  const t = useTranslations()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [applicationsResponse, paymentsResponse] = await Promise.all([
          getApplications(),
          getPayment(),
        ])

        const applicationOptions = applicationsResponse.data.map((app) => ({
          value: app.id.toString(),
          label: app.name,
        }))
        const paymentOptions = paymentsResponse.data.map((payment) => ({
          value: payment.id.toString(),
          label: payment.name,
        }))

        setApplicationOptions(applicationOptions)
        setPaymentOptions(paymentOptions)

        if (id !== null) {
          const agentResponse = await getAgentsInfoInWhitelist(id)
          const agentData = agentResponse.data[0]
          setSelectedOptionApp(agentData.app.toString())
          setSelectedOptionPay(agentData.settlement.toString())
        }
      } catch (error) {
        if (error instanceof Error) {
          showToast('error', `${error.message}`, 5000, 'bottom-left')
        }
      }
    }

    fetchData()
  }, [
    id,
    setApplicationOptions,
    setPaymentOptions,
    setSelectedOptionApp,
    setSelectedOptionPay,
    t,
  ])
}

export function FormWhitelistUpdate({
  onClose,
  id,
  setOpenAddAgentDialog,
  refreshData,
}: FormWhitelistProps) {
  const t = useTranslations()
  const [selectedOptionPay, setSelectedOptionPay] = useState<string>('')
  const [selectedOptionApp, setSelectedOptionApp] = useState<string>('')
  const [isChanged, setIsChanged] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false)
  const { setOnSubmit, setHasUnsavedChanges } = useSaveChangesDialogStore()
  const [paymentOptions, setPaymentOptions] = useState<
    { value: string; label: string }[]
  >([])
  const [applicationOptions, setApplicationOptions] = useState<
    { value: string; label: string }[]
  >([])
  const [allowSub, setAllowSub] = useState<boolean>(false)
  const [autoApproved, setAutoApproved] = useState<boolean>(false)
  const [initialValues, setInitialValues] = useState({
    phoneNumber: '',
    selectedOptionPay: '',
    allowsub: '',
    autoapproved: '',
  })

  const formGetSchema = z.object({
    id: z.string().optional(),
    agentId: z.string().optional(),
    nickname: z.string().optional(),
    phoneNumber: z
      .string()
      .refine((val) => validatePhone(val), t('Errors.invalidPhone'))
      .optional(),
    clubid: z.string().optional(),
    app: z.string().optional(),
    allowsub: z.string().optional(),
    autoapproved: z.string().optional(),
    settlement: z.string().optional(),
  })

  type FormGetSchema = z.infer<typeof formGetSchema>

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormGetSchema>({
    resolver: zodResolver(formGetSchema),
    mode: 'onChange',
  })

  const phoneNumber = watch('phoneNumber')
  const allowsub = watch('allowsub')
  const autoapproved = watch('autoapproved')

  useFetchOptions(
    id,
    setApplicationOptions,
    setPaymentOptions,
    setSelectedOptionApp,
    setSelectedOptionPay,
  )

  useEffect(() => {
    const fetchAgentInfo = async () => {
      if (id !== null) {
        try {
          const response = await getAgentsInfoInWhitelist(id)
          const agentData = response.data[0]

          const formattedPhone = phoneFormatter.mask(agentData.phone)
          const allowsubValue = agentData.allowsub.toString()
          const autoapprovedValue = agentData.autoapproved.toString()

          setValue('agentId', agentData.agentID.toString())
          setValue('nickname', agentData.alias)
          setValue('phoneNumber', formattedPhone)
          setValue('clubid', agentData.clubID.toString())
          setSelectedOptionApp(agentData.app.toString())
          setSelectedOptionPay(agentData.settlement.toString())
          setAllowSub(agentData.allowsub === 1)
          setAutoApproved(agentData.autoapproved === 1)
          setValue('allowsub', allowsubValue)
          setValue('autoapproved', autoapprovedValue)
          setHasUnsavedChanges(false)

          setInitialValues({
            phoneNumber: formattedPhone,
            selectedOptionPay: agentData.settlement.toString(),
            allowsub: allowsubValue,
            autoapproved: autoapprovedValue,
          })
        } catch (error) {
          if (error instanceof Error) {
            showToast('error', `${error.message}`, 5000, 'bottom-left')
          }
        }
      }
    }

    fetchAgentInfo()
  }, [id, setValue])

  useEffect(() => {
    const currentValues = {
      phoneNumber,
      selectedOptionPay,
      allowsub,
      autoapproved,
    }

    setIsChanged(
      JSON.stringify(initialValues) !== JSON.stringify(currentValues),
    )
  }, [phoneNumber, selectedOptionPay, allowsub, autoapproved, initialValues])

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value.replace(/\D/g, '').slice(0, 11)
    const formatted = phoneFormatter.mask(input)
    setValue('phoneNumber', formatted, { shouldValidate: true })
  }

  const handleChangeApp = (value: string) => {
    setSelectedOptionApp(value)
    setValue('app', value)
  }

  const handleAllowSubChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked
    setAllowSub(isChecked)
    setValue('allowsub', isChecked ? '1' : '0')
  }

  const handleAutoApprovedChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const isChecked = event.target.checked
    setAutoApproved(isChecked)
    setValue('autoapproved', isChecked ? '1' : '0')
  }

  const handleUpdateDialog = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setOpenUpdateDialog(true)
  }

  const handleCloseUpdateDialog = () => {
    setOpenUpdateDialog(false)
  }

  useEffect(() => {}, [openUpdateDialog])

  const allowSubParams = allowSub ? 1 : 0
  const autoApprovedParams = autoApproved ? 1 : 0

  const handleFormUpdate = useCallback(
    async (data: FormGetSchema) => {
      try {
        await updateAutoWhitelist({
          id: Number(id),
          agentPhone: data.phoneNumber
            ? phoneFormatter.mask(data.phoneNumber)
            : '',
          allowSub: allowSubParams,
          autoApproved: autoApprovedParams,
          settlement: parseInt(selectedOptionPay, 10),
        })
        showToast(
          'success',
          t('Panel.Whitelist.FormWhitelist.agentUpdate'),
          5000,
          'bottom-left',
        )
        refreshData()
        setHasUnsavedChanges(false)
        setOpenAddAgentDialog(false)
        onClose()
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
    [id, allowSubParams, autoApprovedParams, selectedOptionPay, t, refreshData],
  )

  const updateForm = useCallback(async () => {
    if (formRef.current) {
      if (isChanged) {
        await handleSubmit(handleFormUpdate)()
        onClose()
      } else {
        onClose()
      }
    }
  }, [handleSubmit, handleFormUpdate, isChanged])

  useEffect(() => {
    if (isChanged) {
      setHasUnsavedChanges(true)
      setOnSubmit(() => handleSubmit(updateForm)())
    } else {
      setHasUnsavedChanges(false)
    }
  }, [isChanged, handleSubmit, isValid])

  // useEffect(() => {
  //   const saveWithoutChanges = async () => {
  //     await handleCloseUpdateDialog()
  //     onClose()
  //   }

  //   setSaveWithoutChanges(saveWithoutChanges)

  //   return () => {
  //     setSaveWithoutChanges(() => Promise.resolve())
  //   }
  // }, [setSaveWithoutChanges])

  return (
    <>
      <form
        ref={formRef}
        onSubmit={handleSubmit(handleFormUpdate)}
        className="grid grid-cols-1 pt-xm px-s pb-m justify-center items-center gap-s self-stretch"
      >
        <div className="z-20">
          <Selector
            placeholder="App"
            variant="default"
            iconColorVariant="info"
            value={selectedOptionApp}
            onChange={handleChangeApp}
            options={applicationOptions}
            disabled
          />
        </div>
        <Textfield
          value={watch('clubid')}
          placeholder={t('Panel.Whitelist.FormWhitelist.clubIdPlaceholder')}
          type="text"
          maxLength={19}
          disabled
          numericOnly
          inputMode="numeric"
          {...register('clubid')}
          variant={errors.clubid ? 'error' : undefined}
          validationMessages={
            errors.clubid?.message ? [{ message: errors.clubid.message }] : []
          }
        />
        <Textfield
          value={watch('agentId')}
          placeholder={t('Panel.Whitelist.FormWhitelist.agentPlaceholder')}
          type="text"
          maxLength={19}
          disabled
          numericOnly
          inputMode="numeric"
          {...register('agentId')}
          variant={errors.agentId ? 'error' : undefined}
          validationMessages={
            errors.agentId?.message ? [{ message: errors.agentId.message }] : []
          }
        />
        <Textfield
          value={watch('nickname')}
          placeholder={t('Panel.Whitelist.FormWhitelist.nickNamePlaceholder')}
          type="text"
          maxLength={19}
          disabled
          numericOnly
          {...register('nickname')}
          variant={errors.nickname ? 'error' : undefined}
          validationMessages={
            errors.nickname?.message
              ? [{ message: errors.nickname.message }]
              : []
          }
        />
        <Textfield
          value={watch('phoneNumber')}
          placeholder={t('Panel.Whitelist.FormWhitelist.phonePlaceholder')}
          type="text"
          inputMode="tel"
          {...register('phoneNumber')}
          onChange={handlePhoneChange}
          variant={errors.phoneNumber ? 'error' : undefined}
          validationMessages={
            errors.phoneNumber?.message
              ? [{ message: errors.phoneNumber.message }]
              : []
          }
        />
        <div>
          <Selector
            placeholder=""
            variant="default"
            iconColorVariant="info"
            value={selectedOptionPay}
            onChange={(value) => setSelectedOptionPay(value)}
            options={paymentOptions}
          />
        </div>
        <div className="my-xm flex flex-col gap-m">
          <div className="flex items-center justify-between min-w-full border-b border-grey-600 py-xs">
            <div className="flex items-center gap-xs">
              <p className="text-BODY-XM text-grey-700">
                {t('Panel.Whitelist.FormWhitelist.allowSubagents')}
              </p>
              <TooltipPrimitive.Provider>
                <Tooltip
                  content={
                    <p>
                      {t('Panel.Whitelist.FormWhitelist.informationSubagents')}
                    </p>
                  }
                  defaultOpen={false}
                  contentMarginLeft="100px"
                >
                  <FiAlertCircle className="w-6 h-6 text-grey-600 cursor-pointer" />
                </Tooltip>
              </TooltipPrimitive.Provider>
            </div>
            <Switch
              checked={allowSub}
              onChange={handleAllowSubChange}
              id="allowSub"
            />
          </div>
          <div className="flex items-center justify-between min-w-full border-b border-grey-600 py-xs">
            <div className="flex items-center gap-xs">
              <p className="text-BODY-XM text-grey-700">
                {t('Panel.Whitelist.FormWhitelist.allowAutomaticWithdrawals')}
              </p>
              <TooltipPrimitive.Provider>
                <Tooltip
                  content={
                    <div className="flex flex-col gap-xs">
                      <p>
                        {t(
                          'Panel.Whitelist.FormWhitelist.informationWithdrawalsOne',
                        )}
                      </p>
                      <p>
                        <strong className="text-grey-900">
                          {t(
                            'Panel.Whitelist.FormWhitelist.informationWithdrawalsTwoObs',
                          )}
                        </strong>{' '}
                        {t(
                          'Panel.Whitelist.FormWhitelist.informationWithdrawalsTwo',
                        )}
                      </p>
                    </div>
                  }
                  defaultOpen={false}
                  contentMarginLeft="100px"
                >
                  <FiAlertCircle className="w-6 h-6 text-grey-600 cursor-pointer" />
                </Tooltip>
              </TooltipPrimitive.Provider>
            </div>
            <Switch
              checked={autoApproved}
              onChange={handleAutoApprovedChange}
              id="autoApproved"
            />
          </div>
          <div className="flex items-center gap-s justify-center pb-s">
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
              size="lg"
              width={160}
              variant="primary"
              preDisabled={!isValid || !isChanged}
              onClick={handleUpdateDialog}
            >
              {t('Panel.Whitelist.FormWhitelist.buttonRegistrationUpdate')}
            </Button>
          </div>
        </div>
      </form>
      <Dialog
        title={t('Panel.Whitelist.FormWhitelist.ButtonSaved')}
        open={openUpdateDialog}
        onClose={handleCloseUpdateDialog}
        className="sm:max-w-[328px] max-w-[400px]"
        removeHeaderPaddingX
      >
        <div className="flex flex-col items-center justify-center gap-s my-xm">
          <FiAlertTriangle size={64} className="text-notify-alert-normal" />
          <p className="text-BODY-XM font-Regular text-grey-900 text-center w-9/12">
            {t('Panel.Whitelist.FormWhitelist.TextDialogChange')}
          </p>
          <strong className="text-grey-900 text-BODY-XM">
            {t('Panel.Whitelist.FormWhitelist.TextDialogSaved')}
          </strong>
          <div className="flex justify-center items-center gap-s self-stretch mt-xs">
            <Button
              className="cursor-pointer"
              preIcon={<FiArrowLeft className="w-[16px] h-[16px]" />}
              variant="text"
              onClick={handleCloseUpdateDialog}
            >
              {t('Panel.Whitelist.FormWhitelist.buttonBack')}
            </Button>
            <Button
              className="cursor-pointer"
              variant="success"
              onClick={updateForm}
            >
              <label className="text-grey-300">
                {t('Panel.Whitelist.FormWhitelist.ButtonSaved')}
              </label>
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}

export default FormWhitelistUpdate
