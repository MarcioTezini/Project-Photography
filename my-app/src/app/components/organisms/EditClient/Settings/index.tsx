/* eslint-disable react-hooks/exhaustive-deps */
import { currencyFormatter } from '@/bosons/formatters/currencyFormatter'
import Textfield from '@/components/atoms/Textfield'
import { showToast } from '@/components/atoms/Toast'
import { Tooltip } from '@/components/atoms/Tooltip'
import Dialog from '@/components/molecules/Dialog'
import { DialogButton } from '@/components/molecules/DialogButton'
import { MyClient } from '@/entities/my-clients'
import { editClientSettings } from '@/services/clients/clients'
import { useMyClientStore } from '@/stores/MyClientStore'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'
import { zodResolver } from '@hookform/resolvers/zod'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { useTranslations } from 'next-intl'
import React, { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FiAlertCircle, FiAlertTriangle } from 'react-icons/fi'
import { z } from 'zod'
import { isSettingsDataDifferent } from './helpers'
import { SettingsOption } from './Option'

interface SettingsProps {
  onClose?: () => void
  clientData?: MyClient
  onSuccessfulEdit?: () => void
  disabled?: boolean
}

interface Dialog {
  dialogTitle: string
  variant?: 'success' | 'warning'
  buttonName: string
  backButtonName?: string
  message: string
  boldMessage?: string
  onSubmit: () => Promise<void>
  onCloseDialog?: () => void
}

const formSettingsDataSchema = z.object({
  minimumDeposit: z.string().optional(),
  maximumDailyWithdrawal: z.string().optional(),
  allowAutomaticWithdrawals: z.boolean().optional(),
  allowDeposits: z.boolean().optional(),
  allowWithdrawals: z.boolean().optional(),
  bypassWhitelistSupreme: z.boolean().optional(),
  bypassWhitelistCacheta: z.boolean().optional(),
})

export type SettingsDataSchema = z.infer<typeof formSettingsDataSchema>

export const Settings: React.FC<SettingsProps> = ({
  onClose,
  clientData,
  onSuccessfulEdit,
}) => {
  const t = useTranslations()

  const [openDialog, setOpenDialog] = useState(false)
  const [dialog, setDialog] = useState<Dialog>({} as Dialog)
  const [isLoading, setIsLoading] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)

  const { setEditClientFormData, editClientFormData } = useMyClientStore()

  const {
    setOnSubmit,
    setHasUnsavedChanges,
    hasUnsavedChanges,
    setIsSaveChangesDialogOpen,
    setSaveWithoutChangesFunction,
  } = useSaveChangesDialogStore()

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const clientSettings = clientData?.settings
  const initialValues = {
    minimumDeposit: currencyFormatter.mask(
      String(clientSettings?.depositmin.toFixed(2)).replace('.', ','),
    ),
    maximumDailyWithdrawal: currencyFormatter.mask(
      String(clientSettings?.withdrawmaxperday.toFixed(2)).replace('.', ','),
    ),
    allowDeposits: Boolean(clientSettings?.deposit),
    allowWithdrawals: Boolean(clientSettings?.withdraw),
    allowAutomaticWithdrawals: Boolean(clientSettings?.autoapproved),
    bypassWhitelistSupreme: Boolean(clientSettings?.IgnoreWhitelistSuprema),
    bypassWhitelistCacheta: Boolean(clientSettings?.IgnoreWhitelistCacheta),
  }
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsDataSchema>({
    resolver: zodResolver(formSettingsDataSchema),
    mode: 'onChange',
    defaultValues: {
      minimumDeposit: currencyFormatter.mask(
        String(
          editClientFormData.minimumDeposit ??
            clientSettings?.depositmin.toFixed(2),
        ).replace('.', ','),
      ),
      maximumDailyWithdrawal: currencyFormatter.mask(
        String(
          editClientFormData.maximumDailyWithdrawal ??
            clientSettings?.withdrawmaxperday.toFixed(2),
        ).replace('.', ','),
      ),
      allowDeposits:
        editClientFormData?.allowDeposits ?? Boolean(clientSettings?.deposit),
      allowWithdrawals:
        editClientFormData?.allowWithdrawals ??
        Boolean(clientSettings?.withdraw),
      allowAutomaticWithdrawals:
        editClientFormData?.allowAutomaticWithdrawals ??
        Boolean(clientSettings?.autoapproved),
      bypassWhitelistSupreme:
        editClientFormData?.bypassWhitelistSupreme ??
        Boolean(clientSettings?.IgnoreWhitelistSuprema),
      bypassWhitelistCacheta:
        editClientFormData?.bypassWhitelistCacheta ??
        Boolean(clientSettings?.IgnoreWhitelistCacheta),
    },
  })

  const minimumDeposit = watch('minimumDeposit')
  const maximumDailyWithdrawal = watch('maximumDailyWithdrawal')
  const allowDeposits = watch('allowDeposits')
  const allowWithdrawals = watch('allowWithdrawals')
  const allowAutomaticWithdrawals = watch('allowAutomaticWithdrawals')
  const bypassWhitelistSupreme = watch('bypassWhitelistSupreme')
  const bypassWhitelistCacheta = watch('bypassWhitelistCacheta')

  const currentValues = useMemo(
    () => ({
      minimumDeposit,
      maximumDailyWithdrawal,
      allowDeposits,
      allowWithdrawals,
      allowAutomaticWithdrawals,
      bypassWhitelistSupreme,
      bypassWhitelistCacheta,
    }),
    [
      minimumDeposit,
      maximumDailyWithdrawal,
      allowDeposits,
      allowWithdrawals,
      allowAutomaticWithdrawals,
      bypassWhitelistSupreme,
      bypassWhitelistCacheta,
    ],
  )

  useEffect(() => {
    setEditClientFormData(currentValues)
  }, [currentValues, setEditClientFormData])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'minimumDeposit' | 'maximumDailyWithdrawal',
  ) => {
    const inputValue = e.target.value
    const formattedValue = currencyFormatter.mask(inputValue)
    setValue(field, formattedValue, { shouldValidate: true })
  }

  const wasChanged = isSettingsDataDifferent(initialValues, currentValues)

  const isOnOff = (status?: boolean) => {
    return status ? 'on' : 'off'
  }

  const handleEditSettings = async () => {
    try {
      await editClientSettings({
        clientId: clientData?.id,
        deposit: isOnOff(allowDeposits),
        withdraw: isOnOff(allowWithdrawals),
        autoapproved: isOnOff(allowAutomaticWithdrawals),
        ignoreWhitelistSuprema: isOnOff(bypassWhitelistSupreme),
        ignoreWhitelistCacheta: isOnOff(bypassWhitelistCacheta),
        depositmin: minimumDeposit ?? '0',
        withdrawmax: maximumDailyWithdrawal ?? '0',
      })
      showToast('success', 'Dados salvos com sucesso!', 1000, 'bottom-left')
      await onSuccessfulEdit?.()
      setHasUnsavedChanges(false)
      reset(currentValues, { keepDefaultValues: false })
      setIsDisabled(true)
      handleCloseDialog()
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

  const handleOpenDialog = () => {
    setOpenDialog(true)
    setDialog({
      dialogTitle: 'Salvar Alterações',
      variant: 'success',
      buttonName: 'Salvar alterações',
      backButtonName: 'Voltar',
      message: 'Você alterou os dados de um cliente cadastrado.',
      boldMessage: 'Deseja salvar essas alterações?',
      onSubmit: async () => {
        setIsLoading(true)
        await handleEditSettings()
        setIsLoading(false)
      },
      onCloseDialog: handleCloseDialog,
    })
  }

  const handleDialogSubmit = () => {
    dialog?.onSubmit?.()
  }

  useEffect(() => {
    setIsDisabled(false)
  }, [wasChanged])

  useEffect(() => {
    if (wasChanged) {
      setHasUnsavedChanges(true)
      setSaveWithoutChangesFunction(() => onClose?.())
      setOnSubmit(() => {
        handleSubmit(handleEditSettings)()
        onClose?.()
      })
    } else {
      setHasUnsavedChanges(false)
    }
  }, [wasChanged, handleSubmit])

  useEffect(() => {
    if (!hasUnsavedChanges && isSubmitting) {
      setIsSaveChangesDialogOpen(false)
    }
  }, [hasUnsavedChanges, isSubmitting])

  return (
    <>
      <form
        className="flex flex-col gap-xm overflow-x-hidden overflow-y-auto pb-xxxm"
        onSubmit={handleSubmit(() => handleOpenDialog())}
      >
        <div className="flex flex-col gap-xs">
          <Textfield
            value={minimumDeposit}
            placeholder={t('Panel.customer.editForm.minimumDepositPlaceholder')}
            type="text"
            inputMode="numeric"
            {...register('minimumDeposit')}
            onChange={(e) => handleChange(e, 'minimumDeposit')}
            variant={errors.minimumDeposit && 'error'}
            validationMessages={
              errors.minimumDeposit?.message
                ? [{ message: errors.minimumDeposit.message }]
                : []
            }
            icon={
              <TooltipPrimitive.Provider>
                <Tooltip
                  content={<p>Defina um valor mínimo de depósito.</p>}
                  defaultOpen={false}
                  contentMarginLeft="100px"
                >
                  <FiAlertCircle
                    size={22}
                    className="w-6 h-6 text-grey-600 cursor-pointer"
                  />
                </Tooltip>
              </TooltipPrimitive.Provider>
            }
          />
          <Textfield
            value={maximumDailyWithdrawal}
            placeholder={t(
              'Panel.customer.editForm.maximumDailyWithdrawalPlaceholder',
            )}
            type="text"
            inputMode="numeric"
            {...register('maximumDailyWithdrawal')}
            onChange={(e) => handleChange(e, 'maximumDailyWithdrawal')}
            variant={errors.maximumDailyWithdrawal && 'error'}
            validationMessages={
              errors.maximumDailyWithdrawal?.message
                ? [{ message: errors.maximumDailyWithdrawal.message }]
                : []
            }
            icon={
              <TooltipPrimitive.Provider>
                <Tooltip
                  content={
                    <p>
                      Defina um valor máximo de saque diário desse cliente.
                      <br />
                      <br />
                      <strong>Importante:</strong> esta configuração sobrepõe os
                      ajustes feitos em Configurações {'>'} Ajustes Financeiros.
                    </p>
                  }
                  defaultOpen={false}
                  contentMarginLeft="100px"
                >
                  <FiAlertCircle
                    size={22}
                    className="w-6 h-6 text-grey-600 cursor-pointer"
                  />
                </Tooltip>
              </TooltipPrimitive.Provider>
            }
          />
        </div>
        <div className="flex flex-col gap-s px-xxxs">
          <Controller
            name="allowDeposits"
            control={control}
            render={({ field }) => (
              <SettingsOption
                {...field}
                value={String(field.value)}
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                title="Permitir depósitos"
                name="allowDeposits"
                tooltipMessage="Permite ou não que o cliente faça depósitos caso seu agente esteja cadastrado ou ignorado na Whitelist."
              />
            )}
          />
          <Controller
            name="allowWithdrawals"
            control={control}
            render={({ field }) => (
              <SettingsOption
                {...field}
                value={String(field.value)}
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                title="Permitir saques"
                name="allowWithdrawals"
                tooltipMessage="Permite ou não que o cliente faça saques caso seu agente esteja cadastrado ou ignorado na Whitelist."
              />
            )}
          />
          <Controller
            name="allowAutomaticWithdrawals"
            control={control}
            render={({ field }) => (
              <SettingsOption
                {...field}
                value={String(field.value)}
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                title="Permitir saques automáticos"
                name="allowAutomaticWithdrawals"
                tooltipMessage={
                  <p>
                    Permite ou não que o cliente realize saques automáticos
                    instantaneamente.
                    <br />
                    <br />
                    <strong>Importante:</strong> caso esta função esteja
                    desativada para o agente na Whitelist, o saque cairá na fila
                    de aprovação.
                  </p>
                }
              />
            )}
          />
          <Controller
            name="bypassWhitelistSupreme"
            control={control}
            render={({ field }) => (
              <SettingsOption
                {...field}
                value={String(field.value)}
                name="bypassWhitelistSupreme"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                title="Ignorar Whitelist (Suprema)"
                tooltipMessage="Permite ou não que o cliente utilize o sistema no aplicativo de Poker mesmo que o agente não esteja na Whitelist."
              />
            )}
          />
          <Controller
            name="bypassWhitelistCacheta"
            control={control}
            render={({ field }) => (
              <SettingsOption
                {...field}
                value={String(field.value)}
                name="bypassWhitelistCacheta"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                title="Ignorar Whitelist (Cacheta)"
                tooltipMessage="Permite ou não que o cliente utilize o sistema no aplicativo de Cacheta mesmo que o agente não esteja na Whitelist."
              />
            )}
          />
        </div>
        <DialogButton
          buttonName="Salvar alterações"
          primary={{
            size: 'lg',
            preDisabled: !wasChanged,
            disabled: isDisabled,
          }}
          secondary={{
            variant: 'text',
            size: 'lg',
            onClick: () =>
              wasChanged ? setIsSaveChangesDialogOpen(true) : onClose?.(),
          }}
        />
      </form>
      <Dialog
        title={dialog.dialogTitle}
        open={openDialog}
        onClose={handleCloseDialog}
        removeHeaderPaddingX
        className="sm:max-w-[328px] max-w-[400px]"
      >
        <div className="flex flex-col items-center justify-center gap-s my-xm">
          <FiAlertTriangle size={64} className="text-notify-alert-normal" />
          <p className="text-center text-BODY-XM text-grey-900 font-Regular px-s w-9/12">
            {dialog.message}
          </p>
          <p className="text-BODY-XM text-grey-900 font-Bold text-center">
            {dialog.boldMessage}
          </p>
          <DialogButton
            buttonName={dialog.buttonName}
            backButtonName={dialog.backButtonName}
            primary={{
              variant: dialog.variant,
              onClick: handleDialogSubmit,
              disabled: isLoading,
            }}
            secondary={{
              variant: 'text',
              onClick: handleCloseDialog,
            }}
          />
        </div>
      </Dialog>
    </>
  )
}
