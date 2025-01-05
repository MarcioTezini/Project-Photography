import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/atoms/Button'
import { FiAlertCircle, FiArrowLeft } from 'react-icons/fi'
import Textfield from '@/components/atoms/Textfield'
import Switch from '@/components/atoms/Switch'
import { showToast } from '@/components/atoms/Toast'
import { useTranslations } from 'next-intl'
import { Tooltip } from '@/components/atoms/Tooltip'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'
import { Dropzone } from '@/components/atoms/Dropzone'
import {
  getClubsInfo,
  updateClub,
  UpdateClubParams,
} from '@/services/clubs/clubs'
import { currencyWithPrefixMask } from '@/bosons/formatters/currencyWithPrefixFormatter'
import { removeCurrencyWithPrefixMask } from '@/bosons/formatters/removeCurrencyWithPrefixMask'
import { useClientStore } from '@/stores/ClientStore'
import { isClubsDifferent } from './helpers'

export type ClubsUpdateParams = {
  operatorID: string
  agentID: string
  mindeposit: string
  maxdeposit: string
  minwithdraw: string
  maxwithdraw: string
  playerwithoutIP: string
  playerwithoutagent: string
  ignorewhitelist: string
  files?: string
  default: string
}
interface FormClubsProps {
  onClose: () => void
  setOpenAddAgentDialog: (open: boolean) => void
  maxSizes: { width: number; height: number }
  id: number | null
  refreshData: () => void
}

export function FormClientsUpdate({
  onClose,
  id,
  maxSizes,
  setOpenAddAgentDialog,
  refreshData,
}: FormClubsProps) {
  const t = useTranslations()
  const { selectedClient } = useClientStore()
  const [isChangedClubs, setIsChangedClubs] = useState(false)
  const formRefClubs = useRef<HTMLFormElement>(null)
  const [openUpdateDialogClub] = useState(false)
  const [error, setErrors] = useState<string | null>(null)
  const {
    setOnSubmit,
    setHasUnsavedChanges,
    hasUnsavedChanges,
    setIsSaveChangesDialogOpen,
  } = useSaveChangesDialogStore()
  const [playerWithoutIP, setPlayerwithoutIP] = useState<boolean>(false)
  const [deafultLink, setDefaultLink] = useState<boolean>(false)
  const [playerWithoutagent, setPlayerwithoutagent] = useState<boolean>(false)
  const [ignoreWhitelist, setIgnorewhitelist] = useState<boolean>(false)
  const [isClubInfoLoaded, setIsClubInfoLoaded] = useState(false)
  const [initialValues, setInitialValues] = useState<ClubsUpdateParams>({
    operatorID: '',
    agentID: '',
    mindeposit: '',
    maxdeposit: '',
    minwithdraw: '',
    maxwithdraw: '',
    playerwithoutIP: '',
    playerwithoutagent: '',
    ignorewhitelist: '',
    files: '',
    default: '',
  })
  const formGetSchema = z
    .object({
      id: z.string().optional(),
      appName: z.string().optional(),
      slotID: z.string().optional(),
      name: z.string().optional(),
      operatorID: z.string().optional(),
      agentID: z.string().optional(),
      mindeposit: z.string().refine(
        (val) => {
          const num = removeCurrencyWithPrefixMask(val)
          return !isNaN(num) && num > 0
        },
        {
          message: `${t('Panel.ManagingClubs.FormClubs.DeposistsMinMessage')}`,
        },
      ),
      maxdeposit: z.string().refine(
        (val) => {
          const num = removeCurrencyWithPrefixMask(val)
          return !isNaN(num) && num > 0
        },
        {
          message: `${t('Panel.ManagingClubs.FormClubs.DeposistsMaxMessage')}`,
        },
      ),
      minwithdraw: z.string().refine(
        (val) => {
          const num = removeCurrencyWithPrefixMask(val)
          return !isNaN(num) && num > 0
        },
        {
          message: `${t('Panel.ManagingClubs.FormClubs.WithdrawalMinMessage')}`,
        },
      ),
      maxwithdraw: z.string().refine(
        (val) => {
          const num = removeCurrencyWithPrefixMask(val)
          return !isNaN(num) && num > 0
        },
        {
          message: `${t('Panel.ManagingClubs.FormClubs.WithdrawalMaxMessage')}`,
        },
      ),
      playerwithoutIP: z.string().optional(),
      playerwithoutagent: z.string().optional(),
      ignorewhitelist: z.string().optional(),
      default: z.string().optional(),
      files: z.any().optional(),
      domain: z.string(),
    })
    .refine((data) => {
      if (!data.files || data.files.length === 0) {
        return false
      }
      return true
    })

  type FormGetClubSchema = z.infer<typeof formGetSchema>

  const {
    register,
    watch,
    control,
    setValue,
    setError,
    handleSubmit,
    trigger,
    clearErrors,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormGetClubSchema>({
    resolver: zodResolver(formGetSchema),
    mode: 'onChange',
  })

  const onDropzoneChange = (
    file: File | null,
    onChange: (file: File[]) => void,
    fileName: 'files',
  ) => {
    clearErrors(fileName)

    if (file) {
      const fileExtension = `image/${file.name.split('.').pop()?.toLowerCase() ?? ''}`
      const validFormats = ['image/png', 'image/jpg', 'image/jpeg']
      const fileFormat = file.type || fileExtension

      if (!validFormats.includes(fileFormat)) {
        setErrors('Formato de arquivo inválido')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          const base64Data = e.target.result as string
          const img = new Image()

          img.onload = () => {
            const width = img.width
            const height = img.height

            if (width <= 200 && height <= 200) {
              onChange([file])
              setIsChangedClubs(true)
              setErrors(null)
            } else {
              setErrors('Tamanho da imagem inválido')
              onChange([])
            }
          }

          img.onerror = () => {
            setError(fileName, {
              type: 'manual',
              message: t('Errors.ImageLoadError'),
            })
          }

          img.src = base64Data
        }
      }

      reader.onerror = () => {
        setError(fileName, {
          type: 'manual',
          message: t('Errors.FileReadError'),
        })
      }

      reader.readAsDataURL(file)
    } else {
      setError(fileName, {
        type: 'manual',
        message: t('Errors.PleaseChooseanImage'),
      })
      onChange([])
    }
  }

  const [isHidden, setIsHidden] = useState(false)
  useEffect(() => {
    if (selectedClient && selectedClient.plano === 'Suprema Pay') {
      setIsHidden(true)
    } else {
      setIsHidden(false)
    }
  }, [selectedClient])

  const filesValue = watch('files')
  const operatorID = watch('operatorID')
  const agentID = watch('agentID')
  const mindeposit = watch('mindeposit')
  const maxdeposit = watch('maxdeposit')
  const minwithdraw = watch('minwithdraw')
  const maxwithdraw = watch('maxwithdraw')
  const domain = watch('domain')
  const playerwithoutIP = watch('playerwithoutIP')
  const playerwithoutagent = watch('playerwithoutagent')
  const ignorewhitelist = watch('ignorewhitelist')
  const defaultLink = watch('default')

  useMemo(() => {
    const fetchClubInfo = async () => {
      if (id !== null && !isClubInfoLoaded) {
        try {
          const response = await getClubsInfo(id)
          const clubData = response.data
          const appName =
            clubData.appName.toString() === 'Suprema Poker'
              ? 'poker'
              : 'cacheta'

          const playerwithoutIPValue = clubData.playerwithoutIP.toString()
          const playerwithoutagentValue = clubData.playerwithoutagent.toString()
          const ignorewhitelistValue = clubData.ignorewhitelist.toString()
          const defaultValue = clubData.default.toString()

          setValue('appName', clubData.appName.toString())
          setValue('slotID', clubData.slotID.toString())
          setValue('name', clubData.name)
          setValue('operatorID', clubData.operatorID.toString())
          setValue('agentID', clubData.agentID.toString())
          setValue(
            'mindeposit',
            currencyWithPrefixMask(
              clubData.mindeposit.toFixed(2).toString().replace(',', '.'),
            ),
          )
          setValue(
            'maxdeposit',
            currencyWithPrefixMask(
              clubData.maxdeposit.toFixed(2).toString().replace(',', '.'),
            ),
          )
          setValue(
            'minwithdraw',
            currencyWithPrefixMask(
              clubData.minwithdraw.toFixed(2).toString().replace(',', '.'),
            ),
          )
          setValue(
            'maxwithdraw',
            currencyWithPrefixMask(
              clubData.maxwithdraw.toFixed(2).toString().replace(',', '.'),
            ),
          )
          setPlayerwithoutIP(clubData.playerwithoutIP === 1)
          setPlayerwithoutagent(clubData.playerwithoutagent === 1)
          setIgnorewhitelist(clubData.ignorewhitelist === 1)
          setDefaultLink(clubData.default === 1)
          setValue('playerwithoutIP', playerwithoutIPValue)
          setValue('playerwithoutagent', playerwithoutagentValue)
          setValue('ignorewhitelist', ignorewhitelistValue)
          setValue(
            'domain',
            String(
              `https://${clubData.domain}/#/${appName}/${clubData.slotID}`,
            ),
          )
          setHasUnsavedChanges(false)
          setValue('files', clubData.logo)

          setValue('default', defaultValue)

          setIsClubInfoLoaded(true)
          setInitialValues({
            operatorID: clubData.operatorID.toString(),
            agentID: clubData.agentID.toString(),
            mindeposit: currencyWithPrefixMask(
              clubData.mindeposit.toFixed(2).toString().replace(',', '.'),
            ),
            maxdeposit: currencyWithPrefixMask(
              clubData.maxdeposit.toFixed(2).toString().replace(',', '.'),
            ),
            minwithdraw: currencyWithPrefixMask(
              clubData.minwithdraw.toFixed(2).toString().replace(',', '.'),
            ),
            maxwithdraw: currencyWithPrefixMask(
              clubData.maxwithdraw.toFixed(2).toString().replace(',', '.'),
            ),
            playerwithoutIP: playerwithoutIPValue,
            playerwithoutagent: playerwithoutagentValue,
            ignorewhitelist: ignorewhitelistValue,
            default: defaultValue,
            files: clubData.logo,
          })
        } catch (error) {
          if (error instanceof Error) {
            showToast('error', `${error.message}`, 5000, 'bottom-left')
          }
        }
      }
    }

    fetchClubInfo()
  }, [id, setValue])

  useEffect(() => {
    const currentValues = {
      operatorID,
      agentID,
      mindeposit,
      maxdeposit,
      minwithdraw,
      maxwithdraw,
      playerwithoutIP,
      playerwithoutagent,
      ignorewhitelist,
      files: filesValue,
      default: defaultLink,
    } as ClubsUpdateParams

    const isClubsChangeValues = isClubsDifferent(initialValues, currentValues)
    setIsChangedClubs(isClubsChangeValues)
  }, [
    filesValue,
    operatorID,
    agentID,
    mindeposit,
    maxdeposit,
    minwithdraw,
    maxwithdraw,
    playerwithoutIP,
    playerwithoutagent,
    ignorewhitelist,
    initialValues,
    defaultLink,
  ])

  useEffect(() => {
    trigger('domain')
  }, [domain, trigger])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'mindeposit' | 'maxdeposit' | 'minwithdraw' | 'maxwithdraw',
  ) => {
    const inputValue = e.target.value
    const formattedValue = currencyWithPrefixMask(inputValue)
    setValue(field, formattedValue, { shouldValidate: true })
  }

  const handlePlayerwithoutIP = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const isChecked = event.target.checked
    setPlayerwithoutIP(isChecked)
    setValue('playerwithoutIP', isChecked ? '1' : '0', { shouldValidate: true })
    trigger('playerwithoutIP')
  }

  const handlePlayerwithoutagent = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const isChecked = event.target.checked
    setPlayerwithoutagent(isChecked)
    setValue('playerwithoutagent', isChecked ? '1' : '0', {
      shouldValidate: true,
    })
    trigger('playerwithoutagent')
  }

  const handleIgnorewhitelist = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const isChecked = event.target.checked
    setIgnorewhitelist(isChecked)
    setValue('ignorewhitelist', isChecked ? '1' : '0', { shouldValidate: true })
    trigger('ignorewhitelist')
  }

  const handleDefaultLink = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked
    setDefaultLink(isChecked)

    const valueToSet = isChecked ? '1' : '0'
    setValue('default', valueToSet, { shouldValidate: true })

    trigger('default')
  }

  useEffect(() => {}, [defaultLink])

  useEffect(() => {}, [openUpdateDialogClub])

  const playerwithoutIParams = playerWithoutIP ? 1 : 0
  const playerwithoutagentParams = playerWithoutagent ? 1 : 0
  const ignorewhitelistParams = ignoreWhitelist ? 1 : 0
  const defaultParams = defaultLink

  useEffect(() => {}, [defaultParams])

  const handleFormUpdate = useCallback(
    async (data: FormGetClubSchema) => {
      let logo: File | undefined
      const files = data.files

      const formattedMindeposit = removeCurrencyWithPrefixMask(
        data.mindeposit as string,
      )
      const formattedMaxdeposit = removeCurrencyWithPrefixMask(
        data.maxdeposit as string,
      )
      const formattedMinwithdraw = removeCurrencyWithPrefixMask(
        data.minwithdraw as string,
      )
      const formattedMaxwithdraw = removeCurrencyWithPrefixMask(
        data.maxwithdraw as string,
      )

      if (typeof files === 'string') {
        logo = undefined
      } else if (files instanceof FileList || Array.isArray(files)) {
        const file = files?.[0]
        if (file) {
          logo = file
        }
      }

      try {
        const formData = new FormData()
        formData.append('id', String(id))
        formData.append('operatorID', String(data.operatorID || '0'))
        formData.append('agentID', String(data.agentID || '0'))
        formData.append('minDeposit', String(formattedMindeposit))
        formData.append('maxDeposit', String(formattedMaxdeposit))
        formData.append('minWithdraw', String(formattedMinwithdraw))
        formData.append('maxWithdraw', String(formattedMaxwithdraw))
        formData.append('playerWithoutIP', String(playerwithoutIParams))
        formData.append('playerWithoutAgent', String(playerwithoutagentParams))
        formData.append('ignoreWhitelist', String(ignorewhitelistParams))
        formData.append('default', String(defaultParams))

        if (logo) {
          formData.append('logo', logo)
        }

        await updateClub(Number(id), formData as unknown as UpdateClubParams)

        showToast(
          'success',
          t('Panel.ManagingClubs.FormClubs.Successes'),
          5000,
          'bottom-left',
        )

        refreshData()
        setHasUnsavedChanges(false)
        setOpenAddAgentDialog(false)
        onClose()
      } catch (error) {
        console.error('Error in handleFormUpdate:', error)

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
    [
      id,
      playerwithoutIParams,
      playerwithoutagentParams,
      ignorewhitelistParams,
      defaultParams,
      t,
      refreshData,
      onClose,
      setOpenAddAgentDialog,
      setHasUnsavedChanges,
    ],
  )

  const updateForm = useCallback(async () => {
    if (formRefClubs.current) {
      if (isChangedClubs) {
        await handleSubmit(handleFormUpdate)()
        onClose()
      } else {
        onClose()
      }
    }
  }, [handleSubmit, handleFormUpdate, isChangedClubs])

  useEffect(() => {
    if (isChangedClubs) {
      setHasUnsavedChanges(true)
      setOnSubmit(() => handleSubmit(updateForm)())
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
    <>
      <form
        ref={formRefClubs}
        onSubmit={handleSubmit(handleFormUpdate)}
        className="grid grid-cols-1 pt-xm px-s pb-m justify-center items-center gap-s self-stretch"
      >
        <Textfield
          // appName
          value={watch('appName')}
          placeholder={t('Panel.ManagingClubs.FormClubs.Application')}
          type="text"
          maxLength={19}
          disabled
          numericOnly
          {...register('appName')}
          variant={errors.appName ? 'error' : undefined}
          validationMessages={
            errors.appName?.message ? [{ message: errors.appName.message }] : []
          }
        />
        <Textfield
          // slotID
          value={watch('slotID')}
          placeholder={t('Panel.ManagingClubs.FormClubs.ClubId')}
          type="text"
          maxLength={9}
          disabled
          numericOnly
          {...register('slotID')}
          variant={errors.slotID ? 'error' : undefined}
          validationMessages={
            errors.slotID?.message ? [{ message: errors.slotID.message }] : []
          }
        />
        <Textfield
          // name
          value={watch('name')}
          placeholder={t('Panel.ManagingClubs.FormClubs.NameClub')}
          type="text"
          maxLength={19}
          disabled
          numericOnly
          {...register('name')}
          variant={errors.name ? 'error' : undefined}
          validationMessages={
            errors.name?.message ? [{ message: errors.name.message }] : []
          }
        />
        <Textfield
          // operatorID
          value={watch('operatorID')}
          maxLength={9}
          placeholder={t('Panel.ManagingClubs.FormClubs.StandardManager')}
          type="text"
          inputMode="numeric"
          {...register('operatorID')}
          variant={errors.operatorID ? 'error' : undefined}
          validationMessages={
            errors.operatorID?.message
              ? [{ message: errors.operatorID.message }]
              : []
          }
          tooltip={
            <TooltipPrimitive.Provider>
              <Tooltip
                content={
                  <div>
                    <p className="pb-xs">
                      {t('Panel.ManagingClubs.FormClubs.informationOne')}
                    </p>
                    <p>
                      <strong className="text-grey-900">
                        {t('Panel.ManagingClubs.FormClubs.Obs')}
                      </strong>{' '}
                    </p>
                    <p>
                      <strong className="text-grey-900">
                        {t('Panel.ManagingClubs.FormClubs.One')}
                      </strong>{' '}
                      {t('Panel.ManagingClubs.FormClubs.ManagerId')}
                    </p>
                    <p>
                      <strong className="text-grey-900">
                        {t('Panel.ManagingClubs.FormClubs.Two')}
                      </strong>{' '}
                      {t('Panel.ManagingClubs.FormClubs.RegisterManagerId')}
                    </p>
                  </div>
                }
                defaultOpen={false}
                contentMarginRight="30px"
              >
                <FiAlertCircle className="w-6 h-6 text-grey-600 cursor-pointer" />
              </Tooltip>
            </TooltipPrimitive.Provider>
          }
        />
        <Textfield
          value={watch('agentID')}
          maxLength={9}
          placeholder={t('Panel.ManagingClubs.FormClubs.StandardAgent')}
          type="text"
          inputMode="numeric"
          {...register('agentID')}
          variant={errors.agentID ? 'error' : undefined}
          validationMessages={
            errors.agentID?.message ? [{ message: errors.agentID.message }] : []
          }
          tooltip={
            <TooltipPrimitive.Provider>
              <Tooltip
                content={<p>{t('Panel.ManagingClubs.FormClubs.NewClients')}</p>}
                defaultOpen={false}
                contentMarginRight="30px"
              >
                <FiAlertCircle className="w-6 h-6 text-grey-600 cursor-pointer" />
              </Tooltip>
            </TooltipPrimitive.Provider>
          }
        />
        <Textfield
          value={watch('mindeposit')}
          placeholder={t('Panel.ManagingClubs.FormClubs.MinimumDeposit')}
          type="text"
          inputMode="numeric"
          {...register('mindeposit')}
          variant={errors.mindeposit ? 'error' : undefined}
          onChange={(e) => handleChange(e, 'mindeposit')}
          validationMessages={
            errors.mindeposit?.message
              ? [{ message: errors.mindeposit.message }]
              : []
          }
        />
        <Textfield
          value={watch('maxdeposit')}
          placeholder={t('Panel.ManagingClubs.FormClubs.MaximumDeposit')}
          type="text"
          inputMode="numeric"
          {...register('maxdeposit')}
          variant={errors.maxdeposit ? 'error' : undefined}
          onChange={(e) => handleChange(e, 'maxdeposit')}
          validationMessages={
            errors.maxdeposit?.message
              ? [{ message: errors.maxdeposit.message }]
              : []
          }
        />
        <Textfield
          value={watch('minwithdraw')}
          placeholder={t('Panel.ManagingClubs.FormClubs.MinimumWithdrawal')}
          type="text"
          inputMode="numeric"
          {...register('minwithdraw')}
          variant={errors.minwithdraw ? 'error' : undefined}
          onChange={(e) => handleChange(e, 'minwithdraw')}
          validationMessages={
            errors.minwithdraw?.message
              ? [{ message: errors.minwithdraw.message }]
              : []
          }
        />
        <Textfield
          value={watch('maxwithdraw')}
          placeholder={t('Panel.ManagingClubs.FormClubs.MaximumWithdrawal')}
          type="text"
          inputMode="numeric"
          {...register('maxwithdraw')}
          variant={errors.maxwithdraw ? 'error' : undefined}
          onChange={(e) => handleChange(e, 'maxwithdraw')}
          validationMessages={
            errors.maxwithdraw?.message
              ? [{ message: errors.maxwithdraw.message }]
              : []
          }
        />
        <div className="my-xm flex flex-col gap-m">
          <div className="flex items-center justify-between min-w-full border-b border-grey-600 py-xs">
            <div className="flex items-center gap-xs">
              <p className="text-BODY-XM text-grey-700">
                {t('Panel.ManagingClubs.FormClubs.IgnoreWhitelist')}
              </p>
              <TooltipPrimitive.Provider>
                <Tooltip
                  content={
                    <p>
                      {t('Panel.ManagingClubs.FormClubs.IgnoreWhitelistInfo')}
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
              checked={ignoreWhitelist}
              onChange={handleIgnorewhitelist}
              id="ignorewhitelist"
            />
          </div>
          <div className="flex items-center justify-between min-w-full border-b border-grey-600 py-xs">
            <div className="flex items-center gap-xs">
              <p className="text-BODY-XM text-grey-700">
                {t('Panel.ManagingClubs.FormClubs.DepositisAndWithdrawals')}
              </p>
              <TooltipPrimitive.Provider>
                <Tooltip
                  content={
                    <p>
                      {t(
                        'Panel.ManagingClubs.FormClubs.DepositisAndWithdrawalsInfo',
                      )}
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
              checked={playerWithoutagent}
              onChange={handlePlayerwithoutagent}
              id="playerwithoutagent"
            />
          </div>
          <div className="flex items-center justify-between min-w-full border-b border-grey-600 py-xs">
            <div className="flex items-center gap-xs">
              <p className="text-BODY-XM text-grey-700">
                {t('Panel.ManagingClubs.FormClubs.IPWithdrawals')}
              </p>
              <TooltipPrimitive.Provider>
                <Tooltip
                  content={
                    <div className="flex flex-col gap-xs">
                      <p>
                        {t('Panel.ManagingClubs.FormClubs.IPWithdrawalsInfo')}
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
              checked={playerWithoutIP}
              onChange={handlePlayerwithoutIP}
              id="playerwithoutIP"
              value={watch('playerwithoutIP')}
            />
          </div>
          <div
            style={{ display: isHidden ? 'none' : 'flex' }}
            className="flex items-center justify-between min-w-full border-b border-grey-600 py-xs"
          >
            <div className="flex items-center gap-xs">
              <p className="text-BODY-XM text-grey-700">
                {t('Panel.ManagingClubs.FormClubs.StandardLink')}
              </p>
              <TooltipPrimitive.Provider>
                <Tooltip
                  content={
                    <div className="flex flex-col gap-xs">
                      <p>
                        {t('Panel.ManagingClubs.FormClubs.StandardLinkInfo')}
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
              checked={deafultLink}
              onChange={handleDefaultLink}
              id="deafultLink"
              value={watch('default')}
            />
          </div>
          <div className="mb-s">
            <Controller
              // logo
              name="files"
              control={control}
              render={({ field }) => (
                <Dropzone
                  className={error ? 'border-red-500' : 'border-gray-300'}
                  accept={{ 'image/*': ['.jpg', '.jpeg', '.png'] }}
                  primaryText={t('Panel.ManagingClubs.FormClubs.Logo')}
                  width={maxSizes.width}
                  height={maxSizes.height}
                  value={filesValue as string | undefined}
                  secondaryText={'jpg, jpeg, png'}
                  typeResolutionText={t(`Panel.ManagingClubs.FormClubs.width`)}
                  resolutionNumber={`${maxSizes.width}px ${maxSizes.height}px`}
                  onChange={(file) =>
                    onDropzoneChange(file, field.onChange, 'files')
                  }
                  validationMessages={
                    error ? [{ message: error, isValid: false }] : []
                  }
                />
              )}
            />
          </div>
          <div>
            <Textfield
              value={watch('domain')}
              placeholder={t('Panel.ManagingClubs.FormClubs.Deeplink')}
              type="text"
              {...register('domain')}
              disabled
              variant={errors.domain ? 'error' : undefined}
              validationMessages={
                errors.domain?.message
                  ? [{ message: errors.domain.message }]
                  : []
              }
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
              preDisabled={isSubmitting || !isValid || !isChangedClubs}
            >
              {t('Panel.Whitelist.FormWhitelist.buttonRegistrationUpdate')}
            </Button>
          </div>
        </div>
      </form>
    </>
  )
}

export default FormClientsUpdate
