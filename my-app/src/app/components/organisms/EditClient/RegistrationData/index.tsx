import { useEffect, useMemo } from 'react'
import { birthDateFormatter } from '@/bosons/formatters/birthDateFormatter'
import { cpfFormatter } from '@/bosons/formatters/cpfFormatter'
import { phoneFormatter } from '@/bosons/formatters/phoneFormatter'
import Textfield from '@/components/atoms/Textfield'
import { DialogButton } from '@/components/molecules/DialogButton'
import { MyClient } from '@/entities/my-clients'
import { editClientSettings } from '@/services/clients/clients'
import { useMe } from '@/stores/Me'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { currencyFormatter } from '@/bosons/formatters/currencyFormatter'
import { showToast } from '@/components/atoms/Toast'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'

interface RegistrationDataProps {
  clientData?: MyClient
  closeEditing?: () => void
  onSuccessfulEdit?: () => void
}

const formSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  phone: z
    .string()
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Telefone inválido')
    .optional(),
})

export const RegistrationData: React.FC<RegistrationDataProps> = ({
  clientData,
  closeEditing,
  onSuccessfulEdit,
}) => {
  const t = useTranslations()
  const { me } = useMe()

  const {
    setOnSubmit,
    setHasUnsavedChanges,
    hasUnsavedChanges,
    setIsSaveChangesDialogOpen,
    setSaveWithoutChangesFunction,
  } = useSaveChangesDialogStore()

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    register,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: clientData?.email || '',
      phone: phoneFormatter.mask(clientData?.phone) || '',
    },
  })

  const email = watch('email')
  const phone = watch('phone')

  useEffect(() => {
    if (clientData) {
      reset({
        email: clientData.email || '',
        phone: phoneFormatter.mask(clientData?.phone) || '',
      })
    }
  }, [clientData, reset])

  const initialValues = useMemo(
    () => ({
      email: clientData?.email || '',
      phone: phoneFormatter.mask(clientData?.phone) || '',
    }),
    [clientData],
  )

  const isChanged = useMemo(
    () => email !== initialValues.email || phone !== initialValues.phone,
    [email, phone, initialValues],
  )

  const isOnOff = (status?: boolean) => {
    return status ? 'on' : 'off'
  }

  const onSubmit = async (data: { email: string; phone: string }) => {
    try {
      await editClientSettings({
        clientId: clientData?.id,
        deposit: isOnOff(Boolean(clientData?.settings.deposit)),
        withdraw: isOnOff(Boolean(clientData?.settings.withdraw)),
        autoapproved: isOnOff(Boolean(clientData?.settings.autoapproved)),
        ignoreWhitelistCacheta: isOnOff(
          Boolean(clientData?.settings.IgnoreWhitelistCacheta),
        ),
        ignoreWhitelistSuprema: isOnOff(
          Boolean(clientData?.settings.IgnoreWhitelistSuprema),
        ),
        depositmin: currencyFormatter.mask(
          String(clientData?.settings.depositmin.toFixed(2)).replace('.', ','),
        ),
        withdrawmax: currencyFormatter.mask(
          String(clientData?.settings.withdrawmaxperday.toFixed(2)).replace(
            '.',
            ',',
          ),
        ),
        phone: phoneFormatter.unmask(data.phone),
        email: data.email,
      })
      showToast('success', 'Dados salvos com sucesso!', 1000, 'bottom-left')
      await onSuccessfulEdit?.()
      reset()
      setHasUnsavedChanges(false)
      closeEditing?.()
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

  useEffect(() => {
    if (isChanged) {
      setHasUnsavedChanges(true)
      setSaveWithoutChangesFunction(() => closeEditing?.())
      setOnSubmit(() => {
        handleSubmit(onSubmit)()
        closeEditing?.()
      })
    } else {
      setHasUnsavedChanges(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChanged, handleSubmit])

  useEffect(() => {
    if (!hasUnsavedChanges && isSubmitting) {
      setIsSaveChangesDialogOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasUnsavedChanges, isSubmitting])

  const formatedBirthDate = birthDateFormatter.formatDate(clientData?.birthdate)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-xm">
      <div className="flex flex-col gap-xs">
        <Textfield
          name="name"
          placeholder={t('Panel.customer.editForm.fullNamePlaceholder')}
          value={clientData?.name}
          disabled
        />
        <Textfield
          name="document"
          placeholder={t('Panel.customer.editForm.documentIdPlaceholder')}
          value={cpfFormatter.mask(clientData?.document)}
          disabled
        />
        <Textfield
          name="birthdate"
          placeholder={t('Panel.customer.editForm.birthDatePlaceholder')}
          value={birthDateFormatter.mask(formatedBirthDate)}
          disabled
        />
        <Textfield
          value={email}
          {...register('email')}
          placeholder={t('Panel.customer.editForm.emailPlaceholder')}
          // disabled={!(me.level === 3 || me.detail.client.perm === 1)}
          disabled
          onChange={(e) =>
            setValue('email', e.target.value, {
              shouldValidate: true,
            })
          }
          variant={errors.email ? 'error' : undefined}
          validationMessages={
            errors.email?.message ? [{ message: errors.email.message }] : []
          }
        />
        <Textfield
          value={phoneFormatter.mask(phone)}
          {...register('phone')}
          placeholder={t('Panel.customer.editForm.phonePlaceholder')}
          // disabled={!(me.level === 3 || me.detail.client.perm === 1)}
          disabled
          onChange={(e) =>
            setValue('phone', phoneFormatter.mask(e.target.value), {
              shouldValidate: true,
            })
          }
          variant={errors.phone ? 'error' : undefined}
          validationMessages={
            errors.phone?.message ? [{ message: errors.phone.message }] : []
          }
        />
      </div>
      <DialogButton
        buttonName="Salvar alterações"
        primary={{
          size: 'lg',
          disabled:
            !isChanged || !(me.level === 3 || me.detail.client.perm === 1),
        }}
        secondary={{
          variant: 'text',
          size: 'lg',
          onClick: () =>
            isChanged && isValid
              ? setIsSaveChangesDialogOpen(true)
              : closeEditing?.(),
        }}
      />
    </form>
  )
}
