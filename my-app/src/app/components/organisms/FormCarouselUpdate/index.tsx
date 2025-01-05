/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/atoms/Button'
import { FiAlertCircle, FiArrowLeft } from 'react-icons/fi'
import Textfield from '@/components/atoms/Textfield'
import Selector from '@/components/atoms/Select'
import Switch from '@/components/atoms/Switch'
import { showToast } from '@/components/atoms/Toast'
import { useTranslations } from 'next-intl'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'
import TextArea from '@/components/atoms/TextArea'
import { Dropzone } from '@/components/atoms/Dropzone'
import Counter from '@/components/atoms/Counter'
import CustomDatePicker from '@/components/molecules/Datepicker'
import Checkbox from '@/components/atoms/Checkbox'
import { getCarouselInfo, updateCarousel } from '@/services/carousel/carousel'
import { dateFormatter } from '@/bosons/dateFormatter'
import { isEqual } from 'lodash'

export type CarouselUpdateDataSchema = {
  device?: string
  textArea?: string
  titleUpdate: string
  publishedUpdate: string
  link?: string
  applicationOptions: string
  DisplayFor: string
  counterOrder: string
  timeExibition: string
  files?: string
  redirectLink?: string
  tabOptions?: string
  initialDate?: Date
  finalDate?: Date
  Checkbox?: boolean
}

interface FormWhitelistProps {
  onClose: () => void
  setOpenAddCarouselDialog: (open: boolean) => void
  setOpenFormCarousel: (open: boolean) => void
  maxSizes: { width: number; height: number }
  id: number | null
  refreshData: () => void
}

export function FormCarouselUpdate({
  onClose,
  id,
  maxSizes,
  setOpenAddCarouselDialog,
  setOpenFormCarousel,
  refreshData,
}: FormWhitelistProps) {
  const {
    setOnSubmit,
    setHasUnsavedChanges,
    hasUnsavedChanges,
    setIsSaveChangesDialogOpen,
  } = useSaveChangesDialogStore()

  const t = useTranslations()
  const [isCheckboxCheckedUpdate, setIsCheckboxChecked] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [openUpdateDialogUpdate] = useState(false)
  const [isChanged, setIsChanged] = useState(false)
  const [publishedUpdate, setPublish] = useState<boolean>(false)
  const [initialValues, setInitialValues] = useState<CarouselUpdateDataSchema>({
    textArea: '',
    titleUpdate: '',
    link: '',
    DisplayFor: '',
    counterOrder: '',
    timeExibition: '',
    publishedUpdate: '',
    redirectLink: '',
    applicationOptions: '',
    tabOptions: '',
    initialDate: undefined,
    finalDate: undefined,
    device: '',
    files: '',
  })

  const formGetSchema = z
    .object({
      device: z.string().optional(),
      publishedUpdate: z.string().min(1, '').optional(),
      textArea: z.string().optional(),
      titleUpdate: z.string().min(1, 'Campo obrigatório'),
      files: z.any().optional(),
      link: z
        .string()
        .min(1, '')
        .optional()
        .refine((val) => !val || /^(https?:\/\/[^\s$.?#].[^\s]*)$/i.test(val), {
          message: t('Errors.InvalidLink'),
        }),
      applicationOptions: z.string().min(1, t('Errors.PleaseChooseanOption')),
      DisplayFor: z.string().min(1, t('Errors.PleaseChooseanOption')),
      counterOrder: z.string(),
      timeExibition: z.string(),
      redirectLink: z
        .string()
        .optional()
        .refine((val) => !val || /^(https?:\/\/[^\s$.?#].[^\s]*)$/i.test(val), {
          message: t('Errors.InvalidLink'),
        }),
      tabOptions: z.string().optional(),
      initialDate: z
        .date({
          required_error: 'Data inicial é obrigatória',
        })
        .optional(),
      finalDate: z
        .date({
          required_error: 'Data final é obrigatória',
        })
        .optional(),
      Checkbox: z.boolean().optional(),
    })
    .refine(
      (data) => {
        if (
          data.initialDate &&
          data.finalDate &&
          data.finalDate < data.initialDate
        ) {
          return false
        }
        if (data.redirectLink && !data.tabOptions) {
          return false
        }
        if (data.tabOptions && !data.redirectLink) {
          return false
        }
        return true
      },
      {
        message: 'Campo obrigatório',
        path: ['tabOptions'],
      },
    )
    .refine(
      (data) => {
        if (data.Checkbox && (!data.initialDate || !data.finalDate)) {
          return true
        }
        return true
      },
      {
        message: 'Coloque a data inicial e final',
        path: [],
      },
    )

  type FormGetSchema = z.infer<typeof formGetSchema>

  const [applicationOptions] = useState<{ value: string; label: string }[]>([
    { value: 'upload', label: t('Panel.Carousel.formCarousel.Upload') },
    {
      value: 'external',
      label: t('Panel.Carousel.formCarousel.externalLink'),
    },
  ])

  const [DisplayFor] = useState<{ value: string; label: string }[]>([
    { value: '1', label: t('Panel.Carousel.formCarousel.userLog') },
    {
      value: '2',
      label: t('Panel.Carousel.formCarousel.userLogoff'),
    },
    {
      value: '3',
      label: t('Panel.Carousel.formCarousel.userAllLog'),
    },
  ])

  const [tabOptions] = useState<{ value: string; label: string }[]>([
    { value: '_self', label: t('Panel.Carousel.formCarousel.sameTab') },
    { value: '_blank', label: t('Panel.Carousel.formCarousel.newTab') },
  ])

  const {
    register,
    watch,
    setValue,
    resetField,
    control,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormGetSchema>({
    resolver: zodResolver(formGetSchema),
    mode: 'onChange',
    defaultValues: {
      timeExibition: '1',
      counterOrder: '1',
    },
  })

  const addDaysAndHours = (date: Date, days: number, hours: number): Date => {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() + days)
    newDate.setHours(newDate.getHours() + hours)
    return newDate
  }

  const applicationOptionsValue = watch('applicationOptions')
  const DisplayForValue = watch('DisplayFor')
  const filesValue = watch('files')
  const finalDateValue = watch('finalDate')
  const initialDateValue = watch('initialDate')
  const devicesValue = watch('device')
  const publishedUpdateValue = watch('publishedUpdate')
  const counterOrderValue = watch('counterOrder')
  const timeExibitionValue = watch('timeExibition')
  const redirectLinkValue = watch('redirectLink')
  const textAreaValue = watch('textArea')
  const titleUpdateValue = watch('titleUpdate')
  const linkValue = watch('link')
  const tabOptionsValue = watch('tabOptions')

  useEffect(() => {
    const fetchAgentInfo = async () => {
      if (id !== null) {
        try {
          const response = await getCarouselInfo(id)
          const carouselData = response.data
          const publishedUpdateValue = carouselData.published
          setValue('titleUpdate', String(carouselData.name))
          setValue('applicationOptions', String(carouselData.type))
          setValue('link', carouselData.url)
          setValue('textArea', carouselData.description)
          setValue('timeExibition', String(carouselData.interval))
          setPublish(carouselData.published === 1)
          setValue('publishedUpdate', String(publishedUpdateValue))
          setValue(
            'initialDate',
            carouselData.dateStart
              ? addDaysAndHours(new Date(carouselData.dateStart), 0, 3)
              : undefined,
          )

          setValue(
            'finalDate',
            carouselData.dateEnd
              ? addDaysAndHours(new Date(carouselData.dateEnd), 0, 3)
              : undefined,
          )
          setIsCheckboxChecked(false)
          if (carouselData.dateStart || carouselData.dateEnd) {
            setIsCheckboxChecked(true)
          }
          setValue('counterOrder', String(carouselData.sorder))
          setValue('device', String(carouselData.device))
          setValue('tabOptions', String(carouselData.target))
          setValue('DisplayFor', String(carouselData.show))
          setValue('redirectLink', String(carouselData.link))
          setValue('files', carouselData.url)
          setInitialValues({
            link: String(carouselData.url),
            textArea: String(carouselData.description),
            timeExibition: String(carouselData.interval),
            publishedUpdate: String(publishedUpdateValue),
            counterOrder: String(carouselData.sorder),
            DisplayFor: String(carouselData.show),
            redirectLink: String(carouselData.link),
            titleUpdate: String(carouselData.name),
            applicationOptions: String(carouselData.type),
            initialDate: carouselData.dateStart
              ? addDaysAndHours(new Date(carouselData.dateStart), 0, 3)
              : undefined,
            finalDate: carouselData.dateEnd
              ? addDaysAndHours(new Date(carouselData.dateEnd), 0, 3)
              : undefined,
            device: String(carouselData.device),
            tabOptions: String(carouselData.target),
            files: carouselData.url,
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

  // Função fora do componente para construir currentValues
  const getCurrentValues = ({
    DisplayFor,
    publishedUpdate,
    applicationOptions,
    tabOptions,
    initialDate,
    finalDate,
    device,
    link,
    textArea,
    timeExibition,
    counterOrder,
    redirectLink,
    titleUpdate,
    files,
  }: {
    DisplayFor: string
    publishedUpdate: string
    applicationOptions: string
    tabOptions: string
    initialDate?: Date
    finalDate?: Date
    device: string
    link: string
    textArea: string
    timeExibition: string
    counterOrder: string
    redirectLink: string
    titleUpdate: string
    files?: string
  }): CarouselUpdateDataSchema => {
    return {
      DisplayFor,
      publishedUpdate,
      applicationOptions,
      tabOptions,
      initialDate,
      finalDate,
      device,
      link,
      textArea,
      timeExibition,
      counterOrder,
      redirectLink,
      titleUpdate,
      files,
    }
  }

  useEffect(() => {
    const currentValues = getCurrentValues({
      DisplayFor: DisplayForValue,
      publishedUpdate: publishedUpdateValue as string,
      applicationOptions: applicationOptionsValue,
      tabOptions: tabOptionsValue as string,
      initialDate: initialDateValue,
      finalDate: finalDateValue,
      device: devicesValue as string,
      link: linkValue as string,
      textArea: textAreaValue as string,
      timeExibition: timeExibitionValue,
      counterOrder: counterOrderValue,
      redirectLink: redirectLinkValue as string,
      titleUpdate: titleUpdateValue,
      files: filesValue,
    })

    const isChanged = !isEqual(initialValues, currentValues)
    setIsChanged(isChanged)
  }, [
    initialValues,
    DisplayForValue,
    applicationOptions,
    tabOptions,
    filesValue,
    initialDateValue,
    finalDateValue,
    devicesValue,
    publishedUpdate,
    counterOrderValue,
    timeExibitionValue,
    redirectLinkValue,
    textAreaValue,
    titleUpdateValue,
    linkValue,
  ])

  const onDropzoneChange = (
    file: File | null,
    onChange: (file: File[]) => void,
    fileName: 'files',
  ) => {
    if (file) {
      const fileExtension = `image/${file.name.split('.').pop()?.toLowerCase() ?? ''}`
      const validFormats = ['image/png', 'image/jpg', 'image/jpeg']
      const fileFormat = file.type ? file.type : fileExtension
      const maxFileSize = 3 * 1024 * 1024

      if (!validFormats.includes(fileFormat)) {
        setError(fileName, {
          type: 'manual',
          message: t('Errors.IncorrectSizeorFormat'),
        })
        return
      }

      if (file.size > maxFileSize) {
        setError(fileName, {
          type: 'manual',
          message: t('Errors.IncorrectMb'),
        })
        return
      }

      const reader = new FileReader()
      let img: HTMLImageElement | null = null
      reader.onload = (e) => {
        if (e.target?.result) {
          const base64Data = e.target.result as string
          img = new Image()
          img.src = base64Data
          img.onload = () => {
            const width = img?.width
            const height = img?.height

            const validSizes = {
              files: {
                width: devicesValue === '1' ? 1920 : 680,
                height: devicesValue === '1' ? 768 : 600,
              },
            }

            if (
              width === validSizes[fileName].width &&
              height === validSizes[fileName].height
            ) {
              onChange([file])
              setIsChanged(true)
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
      setError(fileName, {
        type: 'manual',
        message: t('Errors.PleaseChooseanImage'),
      })
    }
  }

  const handlePublishedChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const isChecked = event.target.checked
    setPublish(isChecked)
    setValue('publishedUpdate', isChecked ? '1' : '0')
  }

  useEffect(() => {}, [openUpdateDialogUpdate])

  const publishParams = publishedUpdate ? 1 : 0

  const handleFormUpdate = useCallback(
    async (data: FormGetSchema) => {
      let link = null
      let files = null
      const applicationOptions = data.applicationOptions

      switch (applicationOptions) {
        case 'external':
          link = data.link
          files = ''
          break
        case 'upload':
          files = data.files
          break
        default:
          link = data.link
          break
      }
      if (typeof files === 'string') {
        files = undefined
      }
      try {
        await updateCarousel({
          id: Number(id),
          type: link || files ? data.applicationOptions : undefined,
          name: String(data.titleUpdate),
          published: publishParams,
          url: String(link),
          target: String(data.tabOptions),
          description: String(data.textArea),
          interval: Number(data.timeExibition),
          dateStart:
            dateFormatter.mask(data.initialDate?.toISOString()) ??
            dateFormatter.mask(new Date().toISOString()),
          dateEnd:
            dateFormatter.mask(data.finalDate?.toISOString()) ??
            dateFormatter.mask(new Date().toISOString()),
          sorder: Number(data.counterOrder),
          show: Number(data.DisplayFor),
          link: String(data.redirectLink),
          image: files?.[0] ? files?.[0] : undefined,
        })
        showToast(
          'success',
          t('Panel.Whitelist.FormWhitelist.agentUpdate'),
          5000,
          'bottom-left',
        )
        refreshData()
        setHasUnsavedChanges(false)
        setOpenAddCarouselDialog(false)
        setOpenFormCarousel(false)
        onClose()
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'imageTooLarge') {
            setError('files', {
              type: 'manual',
              message: t('Errors.imageTooLarge'),
            })
          } else {
            showToast(
              'error',
              `${t(`Errors.${error.message}`)}`,
              5000,
              'bottom-left',
            )
          }
        }
      }
    },
    [id, publishParams, t, refreshData, onClose],
  )

  useEffect(() => {
    if (isCheckboxCheckedUpdate === false) {
      resetField('initialDate')
      resetField('finalDate')
    }
  }, [isCheckboxCheckedUpdate])

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    return setIsCheckboxChecked(event.target.checked || false)
  }

  useEffect(() => {
    if (isChanged) {
      setHasUnsavedChanges(true)
      setOnSubmit(() => handleSubmit(handleFormUpdate)())
    } else {
      setHasUnsavedChanges(false)
    }
  }, [isChanged, handleSubmit])

  useEffect(() => {
    if (!hasUnsavedChanges && isSubmitting) {
      setIsSaveChangesDialogOpen(false)
      setIsChanged(false)
    }
  }, [hasUnsavedChanges, isSubmitting])

  useEffect(() => {
    if (applicationOptionsValue === 'upload') {
      resetField('link')
    } else if (applicationOptionsValue === 'external') {
      resetField('files')
    }
  }, [applicationOptionsValue, resetField])

  useEffect(() => {
    if (redirectLinkValue === '') {
      resetField('tabOptions')
    }
  }, [redirectLinkValue, resetField])

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(handleFormUpdate)}
      className="grid grid-cols-1 pt-xm px-s pb-m justify-center items-center gap-s self-stretch max-w-[328px] m-auto"
    >
      <div className="z-20">
        <div className="flex items-center mb-xs">
          <span className="text-BODY-S font-Regular text-grey-500 mr-s">
            {t('Panel.Carousel.formCarousel.image')}
          </span>
          <hr className="w-full text-grey-500" />
        </div>
        <Controller
          name="applicationOptions"
          control={control}
          render={({ field, fieldState }) => (
            <Selector
              disabled
              placeholder={t('Panel.Carousel.formCarousel.Format')}
              value={applicationOptionsValue || 'external'}
              onChange={(value) => field.onChange(value)}
              options={applicationOptions}
              variant={fieldState.error ? 'default' : undefined}
              validationMessages={
                errors.applicationOptions?.message
                  ? [{ message: errors.applicationOptions.message }]
                  : []
              }
            />
          )}
        />
      </div>
      {applicationOptionsValue === 'external' && (
        <div>
          <Textfield
            value={watch('link')}
            placeholder="Link"
            type="text"
            {...register('link')}
            variant={errors.link ? 'error' : undefined}
            validationMessages={
              errors.link?.message ? [{ message: errors.link.message }] : []
            }
          />
        </div>
      )}

      {applicationOptionsValue === 'upload' && (
        <div className="mb-s">
          <Controller
            name="files"
            control={control}
            render={({ field }) => (
              <Dropzone
                className={
                  errors.files
                    ? 'border-notify-warning-normal'
                    : 'border-notify-alert-normal'
                }
                width={maxSizes.width}
                height={maxSizes.height}
                value={filesValue as string | undefined}
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                primaryText={t('Panel.Carousel.formCarousel.UploadImage')}
                secondaryText={'jpg, jpeg, png | max. 3mb'}
                typeResolutionText={t(
                  `Panel.Carousel.formCarousel.Required${devicesValue === '1' ? 'Desktop' : 'Mobile'}Size`,
                )}
                resolutionNumber={`${devicesValue === '1' ? 1920 : 680}px${devicesValue === '1' ? 768 : 600}px`}
                onChange={(file) =>
                  onDropzoneChange(file, field.onChange, 'files')
                }
                validationMessages={
                  errors.files?.message
                    ? [{ message: errors.files.message.toString() }]
                    : []
                }
              />
            )}
          />
        </div>
      )}
      <div>
        <div className="flex items-center mb-xs">
          <span className="text-BODY-S font-Regular text-grey-500 mr-s">
            {t('Panel.Carousel.formCarousel.Information')}
          </span>
          <hr className="w-full text-grey-500" />
        </div>
        <Textfield
          value={watch('titleUpdate')}
          placeholder={t('Panel.Carousel.formCarousel.title')}
          type="text"
          {...register('titleUpdate')}
          variant={errors.titleUpdate ? 'error' : undefined}
          validationMessages={
            errors.titleUpdate?.message
              ? [{ message: errors.titleUpdate.message }]
              : []
          }
        />
      </div>
      <TextArea
        value={watch('textArea')}
        placeholder={t('Panel.Carousel.formCarousel.Description')}
        {...register('textArea')}
        variant={errors.textArea ? 'error' : undefined}
        validationMessages={
          errors.textArea?.message ? [{ message: errors.textArea.message }] : []
        }
      />
      <div className="z-10 mt-s">
        <div className="flex items-center mb-xs">
          <span className="text-BODY-S font-Regular text-grey-500 mr-s">
            {t('Panel.Carousel.formCarousel.Display')}
          </span>
          <hr className="w-full text-grey-500" />
        </div>
        <Controller
          name="DisplayFor"
          control={control}
          render={({ field, fieldState }) => (
            <Selector
              placeholder={t('Panel.Carousel.formCarousel.DisplayFor')}
              value={DisplayForValue || ''}
              onChange={(value) => field.onChange(value)}
              options={DisplayFor}
              variant={fieldState.error ? 'default' : undefined}
              validationMessages={
                errors.DisplayFor?.message
                  ? [{ message: errors.DisplayFor.message }]
                  : []
              }
            />
          )}
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-xs">
          <span className="text-BODY-S font-Regular text-grey-800">
            {t('Panel.Carousel.formCarousel.DisplayOrder')}
          </span>
          <Controller
            name="counterOrder"
            control={control}
            render={({ field }) => <Counter {...field} min={1} max={10} />}
          />
        </div>
        <div className="flex justify-between items-center mb-xs">
          <span className="text-BODY-S font-Regular text-grey-800">
            {t('Panel.Carousel.formCarousel.DisplayTime')}
          </span>
          <Controller
            name="timeExibition"
            control={control}
            render={({ field }) => <Counter {...field} min={1} max={10} />}
          />
        </div>
        <div className="flex justify-end min-w-full gap-xs mt-s">
          <div>
            <p className="text-BODY-XM text-grey-700">
              {'Ativar/desativar banner'}
            </p>
          </div>
          <div>
            <Switch
              checked={publishedUpdate}
              onChange={handlePublishedChange}
              id="publishedUpdate"
            />
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center mb-xs">
          <span className="text-BODY-S font-Regular text-grey-500 mr-s">
            {t('Panel.Carousel.formCarousel.BannerAction')}
          </span>
          <hr className="w-[62%] text-grey-500" />
        </div>
        <Textfield
          value={watch('redirectLink')}
          placeholder={t('Panel.Carousel.formCarousel.RedirectLink')}
          type="text"
          {...register('redirectLink')}
          variant={errors.redirectLink ? 'error' : undefined}
          validationMessages={
            errors.redirectLink?.message
              ? [{ message: errors.redirectLink.message }]
              : []
          }
        />
      </div>
      <div className="mb-s">
        <Controller
          name="tabOptions"
          control={control}
          render={({ field, fieldState }) => (
            <Selector
              placeholder={t('Panel.Carousel.formCarousel.OpenLinkIn')}
              value={watch('tabOptions') || ''}
              onChange={(value) => field.onChange(value)}
              options={tabOptions}
              variant={fieldState.error ? 'default' : undefined}
              validationMessages={
                errors.tabOptions?.message
                  ? [{ message: errors.tabOptions.message }]
                  : []
              }
            />
          )}
        />
      </div>
      <div className="flex flex-row-reverse justify-end gap-xs">
        <span>{t('Panel.Carousel.formCarousel.ScheduleBanner')}</span>
        <Checkbox
          {...register('Checkbox')}
          checked={isCheckboxCheckedUpdate}
          onChange={handleCheckboxChange}
        />
      </div>
      {isCheckboxCheckedUpdate === true && (
        <div>
          <div className="flex gap-xs">
            <Controller
              control={control}
              name="initialDate"
              render={({ field }) => (
                <CustomDatePicker
                  inputClassName="w-[143px]"
                  showTimeInput={true}
                  inputPlaceholder={t('Panel.Carousel.formCarousel.StartDate')}
                  selected={field.value}
                  onChange={(date) => field.onChange(date)}
                  variant={errors.initialDate ? 'error' : undefined}
                />
              )}
            />
            <Controller
              control={control}
              name="finalDate"
              render={({ field }) => (
                <CustomDatePicker
                  inputClassName="w-[143px]"
                  showTimeInput={true}
                  inputPlaceholder={t('Panel.Carousel.formCarousel.EndDate')}
                  selected={field.value}
                  onChange={(date) => field.onChange(date)}
                  variant={errors.finalDate ? 'error' : undefined}
                />
              )}
            />
          </div>
          <div className="flex gap-xxs pt-xxs ml-xs self-stretch">
            {errors.finalDate && (
              <>
                <FiAlertCircle className="w-[12px] h-[12px] text-notify-warning-darkest" />
                <span className="flex gap-xxs items-center text-LABEL-L font-Medium text-notify-warning-darkest">
                  {errors.finalDate.message}
                </span>
              </>
            )}
            {errors.initialDate && (
              <>
                <FiAlertCircle className="w-[12px] h-[12px] text-notify-warning-darkest" />
                <span className="flex gap-xxs items-center text-LABEL-L font-Medium text-notify-warning-darkest">
                  {errors.initialDate.message}
                </span>
              </>
            )}
          </div>
        </div>
      )}
      <div className="flex items-center gap-s justify-center mb-xl">
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
          width={173}
          variant="primary"
          disabled={
            !isValid ||
            isSubmitting ||
            !isChanged ||
            (!initialDateValue && !finalDateValue && isCheckboxCheckedUpdate) ||
            (applicationOptionsValue === 'upload' && !filesValue)
          }
        >
          {t('Panel.Carousel.formCarousel.SaveChanges')}
        </Button>
      </div>
    </form>
  )
}

export default FormCarouselUpdate
