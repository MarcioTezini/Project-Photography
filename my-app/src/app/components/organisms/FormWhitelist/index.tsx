import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/atoms/Button'
import { FiAlertCircle, FiArrowLeft } from 'react-icons/fi'
import Textfield from '@/components/atoms/Textfield'
import Selector from '@/components/atoms/Select'
import Switch from '@/components/atoms/Switch'
import { Tooltip } from '@/components/atoms/Tooltip'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { useTranslations } from 'next-intl'
import { getPayment, registerAgentInWhitelist } from '@/services/agent/agent'
import { showToast } from '@/components/atoms/Toast'
import validatePhone from '@/utils/validatePhone'
import { getClubs } from '@/services/clubs/clubs'
import { getApplications } from '@/services/applications/applications'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'
import { phoneFormatter } from '@/bosons/formatters/phoneFormatter'

interface Option {
  value: string
  label: string
}

interface FormWhitelistProps {
  setOpenAddAgentDialog: (open: boolean) => void
  onClose: () => void
  refreshData: () => void
}

const useFetchData = (
  appValue: string | undefined,
  setAppData: React.Dispatch<React.SetStateAction<Option[]>>,
  setClubData: React.Dispatch<React.SetStateAction<Option[]>>,
  setPaymentOptions: React.Dispatch<React.SetStateAction<Option[]>>,
  setSelectedOptionPay: React.Dispatch<React.SetStateAction<string>>,
  t: (key: string) => string,
) => {
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data } = await getPayment()
        const options = data.map((payment) => ({
          value: payment.id.toString(),
          label: payment.name,
        }))
        setPaymentOptions(options)
        if (options.length > 0) {
          setTimeout(() => {
            setSelectedOptionPay(options[0].value)
          }, 500)
        }
      } catch (error) {
        if (error instanceof Error) {
          showToast('error', t(`Errors.${error.message}`), 5000, 'bottom-left')
        }
      }
    }

    const fetchApps = async () => {
      try {
        const { data } = await getApplications()
        const appOptions = data.map((app) => ({
          value: app.id.toString(),
          label: app.name,
        }))
        setAppData(appOptions)
      } catch (error) {
        if (error instanceof Error) {
          showToast('error', t(`Errors.${error.message}`), 5000, 'bottom-left')
        }
      }
    }

    fetchPayments()
    fetchApps()
  }, [t, setAppData, setClubData, setPaymentOptions, setSelectedOptionPay])

  useEffect(() => {
    const fetchClubs = async () => {
      if (appValue) {
        const appId = parseInt(appValue, 10)
        try {
          const { data } = await getClubs(appId)
          const clubOptions = data.map((club) => ({
            value: club.slotID.toString(),
            label: club.name,
          }))
          setClubData(clubOptions)
        } catch (error) {
          if (error instanceof Error) {
            showToast(
              'error',
              t(`Errors.${error.message}`),
              5000,
              'bottom-left',
            )
          }
        }
      }
    }
    fetchClubs()
  }, [appValue, setClubData, t])
}

export function FormWhitelist({
  onClose,
  refreshData,
  setOpenAddAgentDialog,
}: FormWhitelistProps) {
  const t = useTranslations()
  const [appData, setAppData] = useState<Option[]>([])
  const [clubData, setClubData] = useState<Option[]>([])
  const [paymentOptions, setPaymentOptions] = useState<Option[]>([])
  const [selectedOptionPay, setSelectedOptionPay] = useState<string>('')
  const [allowSubagents, setAllowSubagents] = useState<boolean>(false)
  const [allowAutoWithdrawals, setAllowAutoWithdrawals] =
    useState<boolean>(false)

  const {
    setOnSubmit,
    setHasUnsavedChanges,
    hasUnsavedChanges,
    setIsSaveChangesDialogOpen,
  } = useSaveChangesDialogStore()

  const formRegisterSchema = z.object({
    agentId: z.string().min(1, t('Errors.agentIdRequired')),
    nickname: z.string().min(1, t('Errors.nicknameRequired')),
    phoneNumber: z
      .string()
      .refine((val) => validatePhone(val), t('Errors.invalidPhone'))
      .optional(),
    appId: z.string().min(1, t('Errors.clubError')),
    clubId: z.string().min(1, t('Errors.clubError')),
  })

  type FormRegisterSchema = z.infer<typeof formRegisterSchema>

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormRegisterSchema>({
    resolver: zodResolver(formRegisterSchema),
    mode: 'onChange',
  })

  const agentIdValue = watch('agentId')
  const nicknameValue = watch('nickname')
  const phoneNumberValue = watch('phoneNumber')
  const appValue = watch('appId')
  const idClubeValue = watch('clubId')

  useFetchData(
    appValue,
    setAppData,
    setClubData,
    setPaymentOptions,
    setSelectedOptionPay,
    t,
  )

  const handleFormRegister = async (data: FormRegisterSchema) => {
    try {
      await registerAgentInWhitelist({
        agentId: parseInt(data.agentId, 10),
        agentNick: data.nickname,
        agentPhone: data.phoneNumber ? data.phoneNumber.replace(/\D/g, '') : '',
        appId: parseInt(data.appId),
        clubId: parseInt(data.clubId),
        allowSub: allowSubagents ? 1 : 0,
        autoApproved: allowAutoWithdrawals ? 1 : 0,
        settlement: parseInt(selectedOptionPay, 10),
      })
      showToast(
        'success',
        t('Panel.Whitelist.FormWhitelist.agentCreate'),
        5000,
        'bottom-left',
      )
      refreshData()
      setHasUnsavedChanges(false)
      setOpenAddAgentDialog(false)
      onClose()
    } catch (error) {
      if (error instanceof Error) {
        showToast('error', t(`Errors.${error.message}`), 5000, 'bottom-left')
      }
    }
  }

  useEffect(() => {
    if (isValid) {
      setHasUnsavedChanges(true)
      setOnSubmit(() => handleSubmit(handleFormRegister)())
    } else {
      setHasUnsavedChanges(false)
    }
  }, [isValid, handleSubmit])

  useEffect(() => {
    if (!hasUnsavedChanges && isSubmitting) {
      setIsSaveChangesDialogOpen(false)
    }
  }, [hasUnsavedChanges, isSubmitting])

  return (
    <form
      onSubmit={handleSubmit(handleFormRegister)}
      className="grid grid-cols-1 pt-xm px-s pb-m justify-center items-center gap-s self-stretch"
    >
      <Selector
        placeholder={t('Panel.Whitelist.FormWhitelist.app')}
        {...register('appId')}
        value={appValue}
        onChange={async (value) => {
          setValue('appId', value)
          setValue('clubId', '')
          await trigger('appId')
        }}
        options={appData}
      />
      <Selector
        placeholder={t('Panel.Whitelist.FormWhitelist.clubPlaceholder')}
        {...register('clubId')}
        value={idClubeValue}
        onChange={async (value) => {
          setValue('clubId', value)
          await trigger('clubId')
        }}
        options={clubData}
        disabled={!appValue}
      />
      <Textfield
        value={agentIdValue}
        placeholder={t('Panel.Whitelist.FormWhitelist.agentPlaceholder')}
        type="text"
        inputMode="numeric"
        maxLength={9}
        numericOnly
        {...register('agentId')}
        variant={errors.agentId ? 'error' : undefined}
        validationMessages={
          errors.agentId?.message ? [{ message: errors.agentId.message }] : []
        }
      />
      <Textfield
        value={nicknameValue}
        placeholder={t('Panel.Whitelist.FormWhitelist.nickNamePlaceholder')}
        type="text"
        maxLength={35}
        {...register('nickname')}
        variant={errors.nickname ? 'error' : undefined}
        validationMessages={
          errors.nickname?.message ? [{ message: errors.nickname.message }] : []
        }
      />
      <Textfield
        value={phoneFormatter.mask(phoneNumberValue)}
        placeholder={t('Panel.Whitelist.FormWhitelist.phonePlaceholder')}
        type="text"
        {...register('phoneNumber')}
        inputMode="tel"
        variant={errors.phoneNumber ? 'error' : undefined}
        validationMessages={
          errors.phoneNumber?.message
            ? [{ message: errors.phoneNumber.message }]
            : []
        }
      />
      <Selector
        placeholder={t(
          'Panel.Whitelist.FormWhitelist.paymentOptionsPlaceholder',
        )}
        variant="default"
        iconColorVariant="info"
        value={selectedOptionPay}
        onChange={(value) => setSelectedOptionPay(value)}
        options={paymentOptions}
      />
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
            checked={allowSubagents}
            onChange={(e) => setAllowSubagents(e.target.checked)}
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
            checked={allowAutoWithdrawals}
            onChange={(e) => setAllowAutoWithdrawals(e.target.checked)}
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
            width={160}
            variant="primary"
            disabled={!isValid || isSubmitting}
          >
            {t('Panel.Whitelist.FormWhitelist.buttonRegistration')}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default FormWhitelist
