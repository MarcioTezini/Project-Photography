/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import Button from '@/components/atoms/Button'
import { Dropzone } from '@/components/atoms/Dropzone'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { Tooltip } from '@/components/atoms/Tooltip'
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowLeft,
  FiLoader,
} from 'react-icons/fi'
import { useEffect, useRef, useState } from 'react'
import { getLogos, updateLogos } from '@/services/logos/logos'
import { showToast } from '@/components/atoms/Toast'
import Dialog from '@/components/molecules/Dialog'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'
import { useTranslations } from 'next-intl'
import { useClientStore } from '@/stores/ClientStore'
import { useDebounce } from '@/hooks/useDebounce'

type LogoName = 'favicon' | 'logo' | 'logoMobile' | 'logoFooter'

interface RemoveValues {
  [key: string]: boolean | undefined
}

export default function Logos() {
  const t = useTranslations()

  const { setHasUnsavedChanges, setOnSubmit } = useSaveChangesDialogStore()
  const [isLoadingLogos, setIsLoadingLogos] = useState(false)

  const formLogosSchema = z.object({
    favicon: z.array(z.any()).optional(),
    logo: z.array(z.any()).optional(),
    logoMobile: z.array(z.any()).optional(),
    logoFooter: z.array(z.any()).optional(),
  })

  const sizeInfo = {
    favicon: {
      width: 32,
      height: 32,
    },
    logo: {
      width: 205,
      height: 64,
    },
    logoMobile: {
      width: 32,
      height: 32,
    },
    logoFooter: {
      width: 205,
      height: 90,
    },
  }

  type FormLogosSchema = z.infer<typeof formLogosSchema>

  const [currentValues, setCurrentValues] = useState<FormLogosSchema | null>(
    null,
  )
  const [removeValues, setRemoveValues] = useState<RemoveValues | null>(null)
  const [isChanged, setIsChanged] = useState(false)
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isDisabled, setIsDisabled] = useState(true)
  const { selectedClient } = useClientStore()
  const isFirstRender = useRef(true)

  const {
    control,
    setError,
    formState: { errors, isValid, isSubmitting },
    handleSubmit,
    clearErrors,
  } = useForm<FormLogosSchema>({
    resolver: zodResolver(formLogosSchema),
    mode: 'onChange',
  })

  let img: HTMLImageElement | null = null

  const fetchImages = async () => {
    setIsLoadingLogos(true)
    try {
      const response = await getLogos()
      const { favicon, logo, logoFooter, logoMobile } = response

      setCurrentValues({
        favicon: favicon || [],
        logo: logo || [],
        logoMobile: logoMobile || [],
        logoFooter: logoFooter || [],
      })
      setIsChanged(false)
      setIsDisabled(true)
      setIsLoadingLogos(false)
    } catch (error) {
      setIsLoadingLogos(false)
      console.error('Error when searching for images:', error)
    }
  }

  const fetchImagesDebounced = useDebounce(fetchImages, 1000)

  useEffect(() => {
    fetchImages().then(() => {
      setTimeout(() => {
        isFirstRender.current = false // Define como false após 1 segundo
      }, 1000) // Delay de 1000ms
    })
  }, [])

  useEffect(() => {
    if (!isFirstRender.current) {
      setCurrentValues(null)
      fetchImagesDebounced()
    }
  }, [selectedClient])

  useEffect(() => {
    if (isChanged) {
      setHasUnsavedChanges(true)
      setOnSubmit(() => handleSubmit(onSubmit)())
    } else {
      setHasUnsavedChanges(false)
    }
  }, [isChanged, handleSubmit, isValid])

  const onDropzoneChange = (
    file: File | null,
    onChange: (file: File[]) => void,
    fileName: LogoName,
  ) => {
    if (file) {
      const fileExtension = `image/${file.name.split('.').pop()?.toLowerCase() ?? ''}`
      const validFormats = ['image/png', 'image/svg+xml', 'image/svg%2bxml']
      const fileFormat = file.type ? file.type : fileExtension

      if (!validFormats.includes(fileFormat)) {
        setError(fileName, {
          type: 'manual',
          message: t('Errors.IncorrectSizeorFormat'),
        })
        return
      }

      const reader = new FileReader()

      reader.onload = (e) => {
        if (e.target?.result) {
          const base64Data = e.target.result as string
          img = new Image()
          img.src = base64Data
          img.onload = () => {
            const width = img?.width ?? 0
            const height = img?.height ?? 0

            // Agora aceitando imagens menores ou iguais ao tamanho permitido
            if (
              width <= sizeInfo[fileName].width &&
              height <= sizeInfo[fileName].height
            ) {
              onChange([file])
              setIsChanged(true)
              setHasUnsavedChanges(true)
              clearErrors(fileName)
            } else {
              setError(fileName, {
                type: 'manual',
                message: t('Errors.IncorrectSizeorFormat'),
              })
            }
          }
        }
      }

      reader.readAsDataURL(file)
    } else {
      setIsChanged(true)
      setRemoveValues({ ...removeValues, [fileName]: true })
      setError(fileName, {
        type: 'manual',
        message: t('Errors.PleaseChooseanImage'),
      })
      onChange([])
    }
  }

  const onSubmit: SubmitHandler<FormLogosSchema> = async (data) => {
    const formData = new FormData()

    if (removeValues) {
      Object.keys(removeValues).forEach((key) => {
        if (removeValues[key]) {
          formData.append(key, 'remove')
        }
      })
    }

    if (data.favicon && data.favicon.length > 0) {
      formData.append('favicon', data.favicon[0])
    }
    if (data.logo && data.logo.length > 0) {
      formData.append('logo', data.logo[0])
    }
    if (data.logoMobile && data.logoMobile.length > 0) {
      formData.append('logoMobile', data.logoMobile[0])
    }
    if (data.logoFooter && data.logoFooter.length > 0) {
      formData.append('logoFooter', data.logoFooter[0])
    }

    try {
      const response = await updateLogos(formData)

      if (response.status === 200) {
        setOpenUpdateDialog(false)
        setIsSaved(true)
        setIsChanged(false)
        showToast(
          'success',
          t('Panel.Logos.successSaveImages'),
          5000,
          'bottom-left',
        )
      } else {
        throw new Error('Failed to update logos')
      }
    } catch (error) {
      setOpenUpdateDialog(false)
      setIsSaved(false)
      setIsChanged(true)
      showToast('error', t('Errors.imagesSaveError'), 5000, 'bottom-left')
    }
  }

  const handleUpdateDialog = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setOpenUpdateDialog(true)
  }

  const handleCloseUpdateDialog = () => {
    setOpenUpdateDialog(false)
  }

  useEffect(() => {}, [openUpdateDialog])

  useEffect(() => {
    if (isChanged) setIsDisabled(false)
    if (!isValid) setIsDisabled(true)
  }, [isChanged, isValid])

  const imagesArray = Object.keys(currentValues ?? {})

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex p-s sm:px-xs sm:py-s flex-col justify-end items-end sm:items-center gap-xm self-stretch rounded-sm bg-grey-300 shadow-DShadow-Special-X">
        <div className="flex items-center gap-xs self-stretch">
          <h6 className="text-grey-900 font-Regular text-H6">
            {t('Panel.Logos.titleCard')}
          </h6>
        </div>
        <hr className="w-full text-grey-600" />
        <div className="flex items-center gap-xm self-stretch">
          <div className="w-full">
            {isLoadingLogos ? (
              <div className="flex justify-center items-center min-h-[300px]">
                <FiLoader className="animate-spin text-H3 text-grey-500" />
              </div>
            ) : (
              <div className="grid grid-cols-4 md:grid-cols-2 sm:grid-cols-1 justify-center gap-xm self-stretch min-h-[231px]">
                {imagesArray.map((key, index) => {
                  const size = sizeInfo[key as keyof typeof sizeInfo]

                  return (
                    <div className="flex flex-col gap-xs" key={key + index}>
                      <div className="text-grey-900 text-BODY-M font-Regular leading-5">
                        <div className="flex items-center gap-xs">
                          {t(`Panel.Logos.${key}`)}
                          <div className="inline-block relative group">
                            <TooltipPrimitive.Provider delayDuration={0}>
                              <Tooltip
                                content={
                                  <p>
                                    {t(
                                      `Panel.Logos.tooltip${key.charAt(0).toUpperCase() + key.slice(1)}`,
                                    )}
                                  </p>
                                }
                                defaultOpen={false}
                                contentMarginLeft="90px"
                              >
                                <FiAlertCircle className="w-6 h-6 cursor-pointer" />
                              </Tooltip>
                            </TooltipPrimitive.Provider>
                          </div>
                        </div>
                      </div>
                      <Controller
                        name={key as LogoName}
                        control={control}
                        render={({ field }) => (
                          <Dropzone
                            className={
                              errors[key as keyof FormLogosSchema]
                                ? 'border-notify-warning-normal'
                                : 'border-notify-alert-normal'
                            }
                            value={
                              currentValues?.[
                                key as keyof typeof currentValues
                              ] as string | undefined
                            }
                            width={size.width}
                            height={size.height}
                            accept={{
                              'image/*': ['.png', '.svg', '.svg%2bxml'],
                            }}
                            primaryText={t('Panel.Logos.loadImage')}
                            secondaryText={'.png, .svg'}
                            typeResolutionText={t('Panel.Logos.maximumSize')}
                            resolutionNumber={`${size.width}x${size.height}px`}
                            onChange={(file) =>
                              onDropzoneChange(
                                file,
                                field.onChange,
                                key as LogoName,
                              )
                            }
                            validationMessages={
                              errors?.[key as keyof FormLogosSchema]?.message
                                ? [
                                    {
                                      message:
                                        errors[key as keyof FormLogosSchema]
                                          ?.message ?? '',
                                    },
                                  ]
                                : []
                            }
                          />
                        )}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        <Button
          variant="primary"
          inputClassName={currentValues ? '' : 'animate-pulse'}
          preDisabled={(isSaved && !isChanged) || isSubmitting}
          disabled={isDisabled}
          onClick={handleUpdateDialog}
        >
          {t('Panel.Logos.submitButtonText')}
        </Button>
        <Dialog
          title={t('Panel.Logos.submitButtonText')}
          open={openUpdateDialog}
          onClose={handleCloseUpdateDialog}
          className="!max-w-[400px]"
        >
          <div className="flex flex-col items-center justify-center gap-s mb-s mt-s px-s py-xm">
            <FiAlertTriangle className="w-[64px] h-[64px] text-notify-alert-normal" />
            <p className="text-BODY-XM font-Regular text-grey-900 text-center">
              {t('Panel.Logos.dialogSaveText')}
            </p>
            <strong className="text-grey-900 text-BODY-XM">
              {t('Panel.Logos.dialogConfirmSaveText')}
            </strong>
            <div className="flex justify-center items-center gap-s self-stretch mt-xs">
              <Button
                className="cursor-pointer"
                preIcon={<FiArrowLeft className="w-[16px] h-[16px]" />}
                variant="text"
                onClick={handleCloseUpdateDialog}
              >
                {t('Panel.Logos.returnButtonText')}
              </Button>
              <Button
                className="cursor-pointer"
                variant="success"
                onClick={handleSubmit(onSubmit)}
              >
                <span className="text-grey-300">
                  {t('Panel.Logos.submitButtonText')}
                </span>
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </form>
  )
}
