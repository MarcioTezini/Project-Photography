/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/atoms/Button'
import { FiAlertCircle, FiArrowLeft } from 'react-icons/fi'
import Textfield from '@/components/atoms/Textfield'
import Selector from '@/components/atoms/Select'
import { useTranslations } from 'next-intl'
import TextArea from '@/components/atoms/TextArea'
import Checkbox from '@/components/atoms/Checkbox'
import { Dropzone } from '@/components/atoms/Dropzone'
import CustomDatePicker from '@/components/molecules/Datepicker'
import Counter from '@/components/atoms/Counter'
import { showToast } from '@/components/atoms/Toast'
import { registerSaveImage } from '@/services/carousel/carousel'
import { dateFormatter } from '@/bosons/dateFormatter'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'

interface FormCarouselProps {
  onClose: () => void
  refreshData: () => void
  setOpenAddCarouselDialog: (open: boolean) => void
  setOpenFormCarousel: (open: boolean) => void
  maxSizes: { width: number; height: number }
  devices: number
}

function FormCarousel({
  onClose,
  maxSizes,
  devices,
  setOpenAddCarouselDialog,
  setOpenFormCarousel,
  refreshData,
}: FormCarouselProps) {
  const t = useTranslations()
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false)
  const [error, setErrors] = useState<string | null>(null)

  const {
    setOnSubmit,
    setHasUnsavedChanges,
    hasUnsavedChanges,
    setIsSaveChangesDialogOpen,
  } = useSaveChangesDialogStore()

  const formRegisterSchema = z
    .object({
      device: z.string().optional(),
      textArea: z.string().optional(),
      title: z.string().min(1, ''),
      tabOption: z.string().optional(),
      counterOrder: z.string().optional(),
      timeExibition: z.string().optional(),
      redirectLink: z
        .string()
        .optional()
        .refine((val) => !val || /^(https?:\/\/[^\s$.?#].[^\s]*)$/i.test(val), {
          message: t('Errors.InvalidLink'),
        }),
      DisplayFor: z.string().min(1, t('Errors.PleaseChooseanOption')),
      Checkbox: z.boolean().optional(),
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
      link: z
        .string()
        .min(1, t('Errors.PleaseAddaLink'))
        .optional()
        .refine((val) => !val || /^(https?:\/\/[^\s$.?#].[^\s]*)$/i.test(val), {
          message: t('Errors.InvalidLink'),
        }),
      applicationOptions: z.string().min(1, t('Errors.PleaseChooseanOption')),
      files: z.array(z.any()).optional(),
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
        if (data.applicationOptions === 'upload' && !data.files?.length) {
          return false
        }
        if (data.redirectLink && !data.tabOption) {
          return false
        }
        if (data.tabOption && !data.redirectLink) {
          return false
        }
        return true
      },
      {
        message: '',
        path: ['tabOption'],
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
        path: ['initialDate'],
      },
    )

  type FormRegisterSchema = z.infer<typeof formRegisterSchema>
  const [applicationOptions] = useState<{ value: string; label: string }[]>([
    { value: 'upload', label: t('Panel.Carousel.formCarousel.Upload') },
    {
      value: 'external',
      label: t('Panel.Carousel.formCarousel.externalLink'),
    },
  ])

  const [applicationExibition] = useState<{ value: string; label: string }[]>([
    { value: '1', label: t('Panel.Carousel.formCarousel.userLog') },
    {
      value: '2',
      label: t('Panel.Carousel.formCarousel.userLogoff'),
    },
    { value: '3', label: t('Panel.Carousel.formCarousel.userAllLog') },
  ])

  const [tabOptions] = useState<{ value: string; label: string }[]>([
    { value: '_self', label: t('Panel.Carousel.formCarousel.sameTab') },
    { value: '_blank', label: t('Panel.Carousel.formCarousel.newTab') },
  ])

  const [wasCheckboxClickedTwice, setWasCheckboxClickedTwice] = useState(false)

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsCheckboxChecked(event.target.checked)
    if (event.target.checked && wasCheckboxClickedTwice) {
      setWasCheckboxClickedTwice(true)
    } else {
      setWasCheckboxClickedTwice(false)
    }
  }

  const {
    register,
    watch,
    control,
    resetField,
    clearErrors,
    setError,
    setValue,
    formState: { errors, isValid, isSubmitting },
    handleSubmit,
  } = useForm<FormRegisterSchema>({
    resolver: zodResolver(formRegisterSchema),
    mode: 'onChange',
    defaultValues: {
      timeExibition: '1',
      counterOrder: '1',
    },
  })

  const onDropzoneChange = (
    file: File | null,
    onChange: (files: File[]) => void,
  ) => {
    if (file) {
      const validFormats = ['image/jpeg', 'image/png', 'image/jpg']
      const maxFileSize = 3 * 1024 * 1024

      if (!validFormats.includes(file.type)) {
        setErrors(t('Errors.IncorrectSizeorFormat'))
        return
      }

      if (file.size > maxFileSize) {
        setErrors(t('Errors.IncorrectMb'))
        return
      }

      const img = new Image()
      const reader = new FileReader()

      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string
        }
      }

      reader.readAsDataURL(file)

      img.onload = () => {
        const width = img.width
        const height = img.height

        if (width !== maxSizes.width || height !== maxSizes.height) {
          setErrors(t('Errors.IncorrectSizeorFormat'))
        } else {
          setErrors(null)
          onChange([file])
        }
      }

      img.onerror = () => {
        setErrors('error')
      }
    } else {
      setError('files', {
        type: 'manual',
        message: t('Errors.PleaseChooseanImage'),
      })
    }
  }

  const redirectLinkValue = watch('redirectLink')
  const linkValue = watch('link')
  const filesValue = watch('files')
  const tabOptionValue = watch('tabOption')
  const applicationOptionsValue = watch('applicationOptions')
  const DisplayForValue = watch('DisplayFor')
  const initialDate = watch('initialDate')
  const finalDate = watch('finalDate')
  const titleValue = watch('title')
  const textAreaValue = watch('textArea')
  watch('device')

  useEffect(() => {
    if (!initialDate || !finalDate) {
      return
    }
    if (initialDate > finalDate) {
      setError('initialDate', {
        type: 'manual',
        message: 'selecione uma data correta',
      })
      setError('finalDate', {
        type: 'manual',
        message: 'selecione uma data correta',
      })
    } else {
      clearErrors()
    }
  }, [finalDate, initialDate])

  useEffect(() => {
    if (initialDate && !finalDate) {
      initialDate.setDate(initialDate.getDate() + 1)
      setValue('finalDate', initialDate)
    }
    if (isCheckboxChecked && !finalDate && !initialDate) {
      setError('initialDate', {
        type: 'manual',
        message: 'selecione uma data',
      })
    }
  }, [finalDate, initialDate])

  useEffect(() => {
    if (applicationOptionsValue === 'upload') {
      resetField('link')
    } else if (applicationOptionsValue === 'external') {
      resetField('files')
    }
  }, [applicationOptionsValue, resetField])

  const handleFormCarousel = async (data: FormRegisterSchema) => {
    try {
      await registerSaveImage({
        name: data.title,
        type: data.applicationOptions,
        url: data.link,
        link: data.redirectLink,
        target: data.tabOption,
        description: data.textArea,
        interval: Number(data.timeExibition),
        dateStart:
          dateFormatter.mask(data.initialDate?.toISOString()) ??
          dateFormatter.mask(new Date().toISOString()),
        dateEnd: dateFormatter.mask(data.finalDate?.toISOString()) ?? '',
        sorder: Number(data.counterOrder),
        device: Number(data.device),
        published: Number(1),
        show: Number(data.DisplayFor),
        image: data.files?.[0] ? data.files?.[0] : undefined,
      })

      showToast(
        'success',
        t('Panel.Carousel.formCarousel.BannerSuccess'),
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
  }

  useEffect(() => {
    if (isValid) {
      setHasUnsavedChanges(true)
      setOnSubmit(() => handleSubmit(handleFormCarousel)())
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
      className="grid grid-cols-1 pt-xm px-s pb-m justify-center items-center gap-s self-stretch max-w-[328px] m-auto"
      onSubmit={handleSubmit(handleFormCarousel)}
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
              placeholder={t('Panel.Carousel.formCarousel.Format')}
              value={applicationOptionsValue || ''}
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
            value={linkValue}
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
                className={error ? 'border-red-500' : 'border-gray-300'}
                value={
                  (filesValue as string | undefined) ||
                  (field.value as string | undefined)
                }
                width={1920}
                height={768}
                accept={{ 'image/*': ['.jpg', '.jpeg', '.png'] }}
                primaryText={t('Panel.Carousel.formCarousel.UploadImage')}
                secondaryText={'jpg, jpeg, png | max. 3mb'}
                typeResolutionText={t(
                  `Panel.Carousel.formCarousel.Required${maxSizes.width > 680 ? 'Desktop' : 'Mobile'}Size`,
                )}
                resolutionNumber={`${maxSizes.width}px${maxSizes.height}px`}
                onChange={(file) => onDropzoneChange(file, field.onChange)}
                validationMessages={
                  error ? [{ message: error, isValid: false }] : []
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
          value={titleValue}
          placeholder={t('Panel.Carousel.formCarousel.title')}
          type="text"
          {...register('title')}
          variant={errors.title ? 'error' : undefined}
          validationMessages={
            errors.title?.message ? [{ message: errors.title.message }] : []
          }
        />
      </div>
      <TextArea
        value={textAreaValue}
        placeholder={t('Panel.Carousel.formCarousel.Description')}
        {...register('textArea')}
        variant={errors.textArea ? 'error' : undefined}
        validationMessages={
          errors.textArea?.message ? [{ message: errors.textArea.message }] : []
        }
      />
      <div className="hidden">
        <Textfield value={`${devices}`} {...register('device')} />
      </div>
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
              options={applicationExibition}
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
      </div>
      <div>
        <div className="flex items-center mb-xs">
          <span className="text-BODY-S font-Regular text-grey-500 mr-s">
            {t('Panel.Carousel.formCarousel.BannerAction')}
          </span>
          <hr className="w-[62%] text-grey-500" />
        </div>
        <Textfield
          value={redirectLinkValue}
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
          name="tabOption"
          control={control}
          render={({ field, fieldState }) => (
            <Selector
              placeholder={t('Panel.Carousel.formCarousel.OpenLinkIn')}
              value={tabOptionValue || ''}
              onChange={(value) => field.onChange(value)}
              options={tabOptions}
              variant={fieldState.error ? 'default' : undefined}
              validationMessages={
                errors.tabOption?.message
                  ? [{ message: errors.tabOption.message }]
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
          checked={isCheckboxChecked}
          onChange={handleCheckboxChange}
        />
      </div>
      {isCheckboxChecked === true && (
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
          <div className="flex gap-xxs pt-xxs self-stretch">
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
          width={160}
          variant="primary"
          disabled={
            !isValid ||
            isSubmitting ||
            (!initialDate &&
              !finalDate &&
              isCheckboxChecked &&
              !wasCheckboxClickedTwice) ||
            (applicationOptionsValue === 'upload' && !filesValue)
          }
        >
          {isCheckboxChecked
            ? t('Panel.Carousel.formCarousel.Schedule')
            : t('Panel.Carousel.formCarousel.Publish')}
        </Button>
      </div>
    </form>
  )
}

export default FormCarousel
