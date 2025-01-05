/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from 'react'
import Button from '@/components/atoms/Button'
import Textfield from '@/components/atoms/Textfield'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { showToast } from '@/components/atoms/Toast'
import { useTranslations } from 'next-intl'
import Selector from '@/components/atoms/Select'
import { FiArrowLeft } from 'react-icons/fi'
import { getClubs } from '@/services/clubs/clubs'
import { getApplications } from '@/services/applications/applications'
import { registerAgentInBlacklist } from '@/services/agent/agent'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'

interface Option {
  value: string
  label: string
}

interface FormBlacklistProps {
  setOpenAddPlayerDialog: (open: boolean) => void
  handleClose: () => void
  refreshData: () => void
}

export function FormBlacklist({
  setOpenAddPlayerDialog,
  handleClose,
  refreshData,
}: FormBlacklistProps) {
  const t = useTranslations()
  const [appData, setAppData] = useState<Option[]>([])
  const [clubData, setClubData] = useState<Option[]>([])

  const {
    setOnSubmit,
    setHasUnsavedChanges,
    hasUnsavedChanges,
    setIsSaveChangesDialogOpen,
  } = useSaveChangesDialogStore()

  const formBlacklistSchema = z.object({
    surname: z.string().min(1, t('Errors.nicknameRequired')),
    playerId: z.string().min(1, t('Errors.playerIdRequired')),
    app: z.string().min(1, t('Errors.clubError')),
    idClube: z.string().min(1, t('Errors.clubError')),
  })

  type FormBlacklistSchema = z.infer<typeof formBlacklistSchema>

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormBlacklistSchema>({
    resolver: zodResolver(formBlacklistSchema),
    mode: 'onChange',
  })

  const surnameValue = watch('surname')
  const playerIdValue = watch('playerId')
  const appValue = watch('app')
  const idClubeValue = watch('idClube')

  const fetchClubs = useCallback(async () => {
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
            `${t(`Errors.${error.message}`)}`,
            5000,
            'bottom-left',
          )
        }
      }
    }
  }, [appValue, t])

  const fetchApps = useCallback(async () => {
    try {
      const { data } = await getApplications()

      const appOptions = data.map((app) => ({
        value: app.id.toString(),
        label: app.name,
      }))

      setAppData(appOptions)
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
  }, [t])

  useEffect(() => {
    fetchClubs()
  }, [fetchClubs])

  useEffect(() => {
    fetchApps()
  }, [fetchApps])

  async function handleFormBlacklist(data: FormBlacklistSchema) {
    try {
      await registerAgentInBlacklist({
        playerName: data.surname,
        playerId: parseInt(data.playerId),
        app: parseInt(data.app),
        clubId: parseInt(data.idClube),
      })
      showToast(
        'success',
        t('Panel.Blacklist.FormBlacklist.dataSaved'),
        5000,
        'bottom-left',
      )

      refreshData()
      setHasUnsavedChanges(false)
      setOpenAddPlayerDialog(false)
      handleClose()
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
  }

  useEffect(() => {
    if (isValid) {
      setHasUnsavedChanges(true)
      setOnSubmit(() => handleSubmit(handleFormBlacklist)())
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
      onSubmit={handleSubmit(handleFormBlacklist)}
      className="grid grid-cols-1 pt-xm px-s pb-m justify-center items-center gap-xs self-stretch"
    >
      <Textfield
        maxLength={40}
        value={surnameValue}
        placeholder={t('Panel.Blacklist.FormBlacklist.surnamePlaceholder')}
        {...register('surname')}
        variant={errors.surname && 'error'}
        validationMessages={
          errors.surname?.message ? [{ message: errors.surname.message }] : []
        }
      />
      <Textfield
        value={playerIdValue}
        type="text"
        inputMode="numeric"
        maxLength={19}
        numericOnly={true}
        placeholder={t('Panel.Blacklist.FormBlacklist.playerIdPlaceholder')}
        {...register('playerId')}
        variant={errors.playerId && 'error'}
        validationMessages={
          errors.playerId?.message ? [{ message: errors.playerId.message }] : []
        }
      />
      <Selector
        placeholder={t('Panel.Blacklist.FormBlacklist.appPlaceholder')}
        {...register('app')}
        value={appValue}
        onChange={async (value) => {
          setValue('app', value)
          setValue('idClube', '')
          await trigger('app')
        }}
        options={appData}
      />
      <Selector
        placeholder={t('Panel.Blacklist.FormBlacklist.clubPlaceholder')}
        {...register('idClube')}
        value={idClubeValue}
        onChange={async (value) => {
          setValue('idClube', value)
          await trigger('idClube')
        }}
        options={clubData}
        disabled={appValue === undefined}
      />

      <div className="flex items-center gap-s justify-center mt-m">
        <Button
          variant="text"
          width={110}
          size="lg"
          preIcon={<FiArrowLeft width={20} height={20} />}
          onClick={(e) => {
            e.preventDefault()
            handleClose()
          }}
        >
          {t('Panel.Blacklist.FormBlacklist.buttonBack')}
        </Button>
        <Button width={180} size="lg" disabled={!isValid || isSubmitting}>
          {t('Panel.Blacklist.FormBlacklist.buttonSubmit')}
        </Button>
      </div>
    </form>
  )
}
