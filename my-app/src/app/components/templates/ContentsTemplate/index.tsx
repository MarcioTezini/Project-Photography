/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import {
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowLeft,
  FiEdit,
} from 'react-icons/fi'
import PanelTemplate from '../PanelTemplate'
import Divider from '@/components/atoms/Divider'
import { PanelAccordion } from '@/components/molecules/Accordion'
import Selector from '@/components/atoms/Select'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import Button from '@/components/atoms/Button'
import Textfield from '@/components/atoms/Textfield'
import Checkbox from '@/components/atoms/Checkbox'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { Tooltip } from '@/components/atoms/Tooltip'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ReactSortable } from 'react-sortablejs'
import Image from 'next/image'
import sortableIcon from '../../../../public/images/icons/icon-sortable-item.svg'
import { Dropzone } from '@/components/atoms/Dropzone'
import Switch from '@/components/atoms/Switch'
import TextEditor from '@/components/molecules/TextEditor'
import { saveContentConfig, saveContentImages } from '@/services/config'
import { showToast } from '@/components/atoms/Toast'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'
import { getUserData } from '@/services/user/user'
import { useDebounce } from '@/hooks/useDebounce'
import { useClientStore } from '@/stores/ClientStore'
import { useTranslations } from 'next-intl'
import Dialog from '@/components/molecules/Dialog'
import { isEqual } from 'lodash'

const menuBackgroundOptions = [
  { value: 'Sólido', label: 'Sólido (cor secundária)' },
  { value: 'Gradiente', label: 'Gradiente (transparente)' },
]

const siteBackgroundOptions = [
  { value: 'Sólido', label: 'Sólido (cor secundária)' },
  { value: 'Imagem de fundo', label: 'Imagem de fundo' },
]

interface ItemType {
  id: number
  name: string
  checked: boolean
  order: number
}

export default function ContentsTemplate() {
  const t = useTranslations('Panel.Contents')

  const formContentsSchema = z
    .object({
      menuBackgroundConfig: z
        .string()
        .min(1, t('validation.menuBackgroundConfig')),
      siteBackgroundConfig: z
        .string()
        .min(1, t('validation.siteBackgroundConfig')),
      siteTitle: z
        .string()
        .min(1, t('validation.siteTitle'))
        .refine(
          (val) =>
            !/([\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{1F780}-\u{1F7FF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}])/gu.test(
              val,
            ),
          {
            message: t('noEmojisAllowed'),
          },
        ),
      cacheta: z.boolean().optional(),
      poker: z.boolean().optional(),
      buyDiamonds: z.boolean().optional(),
      siteBgImage: z.any().optional(),
      hasAbout: z.boolean().optional(),
      hasCards: z.boolean().optional(),
      title: z.string().optional(),
      supportingText: z.string().optional(),
      cardsIcon1: z.any().optional(),
      cardsIcon2: z.any().optional(),
      cardsIcon3: z.any().optional(),
      cardsIcon1Text: z.string().optional(),
      cardsIcon2Text: z.string().optional(),
      cardsIcon3Text: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      // Conditional validation for siteBgImage
      if (data.siteBackgroundConfig === 'Imagem de fundo') {
        const siteBgImage = data.siteBgImage

        if (
          !siteBgImage ||
          (Array.isArray(siteBgImage) && siteBgImage.length === 0)
        ) {
          ctx.addIssue({
            path: ['siteBgImage'],
            message: t('validation.siteBgImage'),
            code: z.ZodIssueCode.custom,
          })
        }
      }

      // Conditional validation for hasAbout
      if (data.hasAbout) {
        if (!data.title) {
          ctx.addIssue({
            path: ['title'],
            message: t('validation.title'),
            code: z.ZodIssueCode.custom,
          })
        }

        if (!data.supportingText) {
          ctx.addIssue({
            path: ['supportingText'],
            message: t('validation.supportingText'),
            code: z.ZodIssueCode.custom,
          })
        }
      }

      // Conditional validation for hasCards
      if (data.hasCards) {
        if (!data.cardsIcon1 || data.cardsIcon1.length === 0) {
          ctx.addIssue({
            path: ['cardsIcon1'],
            message: t('validation.cardsIcon1'),
            code: z.ZodIssueCode.custom,
          })
        }
        if (!data.cardsIcon1Text) {
          ctx.addIssue({
            path: ['cardsIcon1Text'],
            message: t('validation.cardsIcon1Text'),
            code: z.ZodIssueCode.custom,
          })
        }
        if (!data.cardsIcon2 || data.cardsIcon2.length === 0) {
          ctx.addIssue({
            path: ['cardsIcon2'],
            message: t('validation.cardsIcon2'),
            code: z.ZodIssueCode.custom,
          })
        }
        if (!data.cardsIcon2Text) {
          ctx.addIssue({
            path: ['cardsIcon2Text'],
            message: t('validation.cardsIcon2Text'),
            code: z.ZodIssueCode.custom,
          })
        }
        if (!data.cardsIcon3 || data.cardsIcon3.length === 0) {
          ctx.addIssue({
            path: ['cardsIcon3'],
            message: t('validation.cardsIcon3'),
            code: z.ZodIssueCode.custom,
          })
        }
        if (!data.cardsIcon3Text) {
          ctx.addIssue({
            path: ['cardsIcon3Text'],
            message: t('validation.cardsIcon3Text'),
            code: z.ZodIssueCode.custom,
          })
        }
      }
    })

  type FormContentsSchema = z.infer<typeof formContentsSchema>

  const [state, setState] = useState<ItemType[]>([
    { id: 1, name: 'App Cacheta', checked: false, order: 1 },
    { id: 2, name: 'App Poker', checked: false, order: 2 },
    { id: 3, name: 'Comprar diamantes', checked: false, order: 3 },
  ])
  const [initialValues, setInitialValues] = useState<FormContentsSchema | null>(
    null,
  )

  const [openSaveChangesDialog, setOpenSaveChangesDialog] = useState(false)
  const [isConfigsOpen, setIsConfigsOpen] = useState(false)
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [isCardsOpen, setIsCardsOpen] = useState(false)
  const [isFormChanged, setIsFormChanged] = useState(false)
  const isFirstRender = useRef(true)
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [isOrderChanged, setIsOrderChanged] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)

  const { setHasUnsavedChanges, setOnSubmit } = useSaveChangesDialogStore()
  const { selectedClient } = useClientStore()

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    setError,
    clearErrors,
    getValues,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormContentsSchema>({
    resolver: zodResolver(formContentsSchema),
    mode: 'onChange',
    defaultValues: {
      buyDiamonds: false,
      cacheta: false,
      poker: false,
      cardsIcon1Text: '',
      cardsIcon2Text: '',
      cardsIcon3Text: '',
      supportingText: '',
      siteTitle: '',
      menuBackgroundConfig: '',
      siteBackgroundConfig: '',
      siteBgImage: null,
      hasAbout: false,
      hasCards: false,
      cardsIcon1: [],
      cardsIcon2: [],
      title: '',
    },
  })

  const fetchMeData = async () => {
    try {
      const me = await getUserData()

      if (me) {
        const fetchedValues = {
          cardsIcon1: me?.data?.configs?.images?.cardsIcon1 || [],
          cardsIcon2: me?.data?.configs?.images?.cardsIcon2 || [],
          cardsIcon3: me?.data.configs?.images?.cardsIcon3 || [],
          siteBgImage: me?.data?.configs?.images?.siteBgImage || [],
          hasCards: me?.data?.configs?.content?.hasCards || false,
          hasAbout: me?.data?.configs?.content?.hasAbout || false,
          menuBackgroundConfig:
            me?.data?.configs?.content.menuBackgroundConfig || '',
          siteBackgroundConfig:
            me?.data?.configs?.content?.siteBackgroundConfig || '',
          siteTitle: me?.data?.configs?.content?.siteTitle || '',
          cacheta: me?.data?.configs?.content?.cacheta?.visible,
          poker: me?.data?.configs?.content?.poker?.visible,
          buyDiamonds: me?.data?.configs?.content?.buyDiamonds?.visible,
          cardsIcon1Text: me?.data?.configs?.content?.cardsIcon1Text || '',
          cardsIcon2Text: me?.data?.configs?.content?.cardsIcon2Text || '',
          cardsIcon3Text: me?.data?.configs?.content?.cardsIcon3Text || '',
          supportingText: me?.data?.configs?.content?.supportingText || '',
          title: me?.data?.configs?.content?.title || '',
        }

        const initialOrder = {
          cacheta: me?.data?.configs?.content?.cacheta || {
            visible: false,
            order: 1,
          },
          poker: me?.data?.configs?.content?.poker || {
            visible: false,
            order: 2,
          },
          buyDiamonds: me?.data?.configs?.content?.buyDiamonds || {
            visible: false,
            order: 3,
          },
        }

        // Atualizando o estado 'state' com base na ordem retornada e ordenando
        const orderedState = [
          {
            id: 1,
            name: 'App Cacheta',
            checked: initialOrder.cacheta.visible,
            order: initialOrder.cacheta.order,
          },
          {
            id: 2,
            name: 'App Poker',
            checked: initialOrder.poker.visible,
            order: initialOrder.poker.order,
          },
          {
            id: 3,
            name: 'Comprar diamantes',
            checked: initialOrder.buyDiamonds.visible,
            order: initialOrder.buyDiamonds.order,
          },
        ].sort((a, b) => a.order - b.order)

        setState(orderedState)

        setInitialValues(fetchedValues)
        setIsDataLoaded(true)
        setIsFormChanged(false)
        clearErrors()
      }
    } catch (error) {
      console.error('Error fetching me data:', error)
    }
  }

  const fetchMeDataDebounced = useDebounce(fetchMeData, 1000)

  useEffect(() => {
    reset()
    fetchMeData().then(() => {
      setTimeout(() => {
        isFirstRender.current = false
      }, 1000)
    })
  }, [])

  useEffect(() => {
    if (!isFirstRender.current) {
      reset()
      setInitialValues(null)
      fetchMeDataDebounced()
      setIsConfigsOpen(false)
      setIsAboutOpen(false)
      setIsCardsOpen(false)
    }
  }, [selectedClient])

  const watchedValues = watch()

  const siteBackgroundConfig = watch('siteBackgroundConfig')
  const menuBackgroundConfig = watch('menuBackgroundConfig')
  const siteTitle = watch('siteTitle')
  const cacheta = watch('cacheta')
  const poker = watch('poker')
  const buyDiamonds = watch('buyDiamonds')
  const hasAbout = watch('hasAbout')
  const hasCards = watch('hasCards')

  const handleCheckboxChange = (
    id: number,
    fieldName: keyof FormContentsSchema,
    isChecked: boolean,
  ) => {
    setState((prevState) =>
      prevState.map((item) =>
        item.id === id ? { ...item, checked: isChecked } : item,
      ),
    )
    setValue(fieldName, isChecked)
  }

  const updateOrder = (updatedState: ItemType[]) => {
    // Reordena o estado com base na nova ordem
    const reorderedState = updatedState.map((item, index) => ({
      ...item,
      order: index + 1, // Atualize a ordem com base na nova posição
    }))

    // Verifique se a nova ordem dos itens é diferente da ordem original
    const hasOrderChanged = reorderedState.some((item, index) => {
      return item.id !== state[index].id || item.order !== state[index].order
    })

    // Atualize o estado reordenado
    setState(reorderedState)

    // Atualiza a flag de mudança de ordem
    setIsOrderChanged(hasOrderChanged)
  }

  const onDropzoneChange = (
    file: File | null,
    onChange: (file: File[]) => void,
    fieldName: keyof FormContentsSchema,
  ) => {
    if (!file) {
      // Caso não tenha um arquivo selecionado, ou a imagem seja removida
      setError(fieldName, {
        type: 'manual',
        message: t('selectImage'),
      })
      onChange([])
      return // Para evitar continuar com a validação quando não houver arquivo
    }

    const fileExtension = `image/${file.name.split('.').pop()?.toLowerCase() ?? ''}`
    const validFormats =
      fieldName === 'siteBgImage'
        ? ['image/png', 'image/jpg', 'image/jpeg']
        : ['image/png', 'image/svg+xml', 'image/svg%2bxml']

    const fileFormat = file.type ? file.type : fileExtension

    if (!validFormats.includes(fileFormat)) {
      setError(fieldName, {
        type: 'manual',
        message: t('invalidImageFormat'),
      })
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      if (e.target?.result) {
        const base64Data = e.target.result as string
        const img = new window.Image()
        img.src = base64Data
        img.onload = () => {
          const width = img?.width
          const height = img?.height

          const validSizes = {
            siteBgImage: {
              width: 1920,
              height: 1600,
            },
            cardsIcon1: {
              width: 180,
              height: 180,
            },
            cardsIcon2: {
              width: 180,
              height: 180,
            },
            cardsIcon3: {
              width: 180,
              height: 180,
            },
          }

          const { width: validWidth, height: validHeight } =
            validSizes[fieldName as keyof typeof validSizes]

          if (width <= validWidth && height <= validHeight) {
            onChange([file])
            clearErrors(fieldName)
          } else {
            setError(fieldName, {
              type: 'manual',
              message: t('invalidImageSize', {
                validWidth,
                validHeight,
              }),
            })
          }
        }
      }
    }

    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (initialValues) {
      // Defina os valores iniciais dos campos quando initialValues estiver disponível
      setValue('menuBackgroundConfig', initialValues.menuBackgroundConfig || '')
      setValue('siteBackgroundConfig', initialValues.siteBackgroundConfig || '')
      setValue('siteTitle', initialValues.siteTitle || '')

      if (initialValues.hasCards) {
        setValue('hasCards', initialValues.hasCards)
      }

      if (initialValues.hasAbout) {
        setValue('hasAbout', initialValues.hasAbout)
      }

      if (initialValues.cardsIcon1Text) {
        setValue('cardsIcon1Text', initialValues.cardsIcon1Text)
      }

      if (initialValues.cardsIcon2Text) {
        setValue('cardsIcon2Text', initialValues.cardsIcon2Text)
      }

      if (initialValues.cardsIcon3Text) {
        setValue('cardsIcon3Text', initialValues.cardsIcon3Text)
      }

      if (initialValues.poker) {
        setValue('poker', initialValues.poker)
      }

      if (initialValues.buyDiamonds) {
        setValue('buyDiamonds', initialValues.buyDiamonds)
      }

      if (initialValues.cacheta) {
        setValue('cacheta', initialValues.cacheta)
      }

      if (initialValues.supportingText) {
        setValue('supportingText', initialValues.supportingText)
      }

      if (initialValues.title) {
        setValue('title', initialValues.title)
      }

      if (initialValues.cardsIcon1) {
        setValue('cardsIcon1', initialValues.cardsIcon1)
      }

      if (initialValues.cardsIcon2) {
        setValue('cardsIcon2', initialValues.cardsIcon2)
      }

      if (initialValues.cardsIcon3) {
        setValue('cardsIcon3', initialValues.cardsIcon3)
      }

      if (initialValues.siteBgImage) {
        setValue('siteBgImage', initialValues.siteBgImage)
      }
    }
  }, [initialValues])

  useEffect(() => {
    const formValues = getValues()

    if (initialValues !== null && isDataLoaded) {
      // Verifica se os valores do formulário mudaram
      const hasFormValuesChanged = !isEqual(initialValues, formValues)

      // Verifica se a ordem foi alterada ou os valores do formulário mudaram
      if (hasFormValuesChanged || isOrderChanged) {
        setIsFormChanged(true)
      } else {
        setIsFormChanged(false)
      }
    }
  }, [watchedValues, isOrderChanged, initialValues, isDataLoaded, getValues])

  async function handleFormContents(data: FormContentsSchema) {
    // Inclua a ordem dos checkboxes nos dados enviados, garantindo que todos os valores sejam enviados
    const modifiedData = {
      ...data,
      buyDiamonds: {
        visible: data.buyDiamonds ?? false,
        order:
          state.find((item) => item.name === 'Comprar diamantes')?.order ?? 0,
      },
      cacheta: {
        visible: data.cacheta ?? false,
        order: state.find((item) => item.name === 'App Cacheta')?.order ?? 0,
      },
      poker: {
        visible: data.poker ?? false,
        order: state.find((item) => item.name === 'App Poker')?.order ?? 0,
      },
    }

    try {
      // Verifique se as imagens foram alteradas comparando os arrays
      const siteBgImageChanged =
        modifiedData.siteBgImage?.[0] !== initialValues?.siteBgImage?.[0]
      const cardsIcon1Changed =
        modifiedData.cardsIcon1?.[0] !== initialValues?.cardsIcon1?.[0]
      const cardsIcon2Changed =
        modifiedData.cardsIcon2?.[0] !== initialValues?.cardsIcon2?.[0]
      const cardsIcon3Changed =
        modifiedData.cardsIcon3?.[0] !== initialValues?.cardsIcon3?.[0]

      // Chamada para upload das imagens apenas se elas forem alteradas
      if (
        siteBgImageChanged ||
        cardsIcon1Changed ||
        cardsIcon2Changed ||
        cardsIcon3Changed
      ) {
        await saveContentImages(
          siteBgImageChanged ? modifiedData.siteBgImage?.[0] : null,
          cardsIcon1Changed ? modifiedData.cardsIcon1?.[0] : null,
          cardsIcon2Changed ? modifiedData.cardsIcon2?.[0] : null,
          cardsIcon3Changed ? modifiedData.cardsIcon3?.[0] : null,
        )
      }

      // Remova as imagens de `modifiedData` antes de enviá-lo ao saveContentConfig
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        siteBgImage, // Remova do objeto antes do envio
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        cardsIcon1, // Remova do objeto antes do envio
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        cardsIcon2, // Remova do objeto antes do envio
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        cardsIcon3, // Remova do objeto antes do envio
        ...contentConfigData // O restante dos dados será enviado
      } = modifiedData

      // Chamada para salvar configurações, sem enviar as imagens
      await saveContentConfig({
        ...contentConfigData,
        // Certifique-se de que está passando todos os valores, inclusive os defaults
        buyDiamonds: contentConfigData.buyDiamonds ?? {
          visible: false,
          order: 3,
        },
        cacheta: contentConfigData.cacheta ?? { visible: false, order: 1 },
        poker: contentConfigData.poker ?? { visible: false, order: 2 },
        siteTitle: contentConfigData.siteTitle ?? '',
        menuBackgroundConfig: contentConfigData.menuBackgroundConfig ?? '',
        siteBackgroundConfig: contentConfigData.siteBackgroundConfig ?? '',
        supportingText: contentConfigData.supportingText ?? '',
        title: contentConfigData.title ?? '',
        cardsIcon1Text: contentConfigData.cardsIcon1Text ?? '',
        cardsIcon2Text: contentConfigData.cardsIcon2Text ?? '',
        cardsIcon3Text: contentConfigData.cardsIcon3Text ?? '',
        // Continue passando valores padrão, conforme necessário...
      })

      // Atualize a interface do usuário após a conclusão
      await fetchMeData()
      setHasUnsavedChanges(false)
      setIsConfigsOpen(false)
      setIsAboutOpen(false)
      setIsCardsOpen(false)

      showToast('success', t('successMessage'), 1000, 'bottom-left')
    } catch (error) {
      showToast('error', t('errorMessage'), 1000, 'bottom-left')
    }
  }

  const handleDialogOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setOpenSaveChangesDialog(true)
  }

  useEffect(() => {
    if (initialValues === null && isValid) {
      // Caso não tenha dados no initialValues e o formulário seja válido
      setHasUnsavedChanges(true)
      setOnSubmit(() => handleSubmit(handleFormContents)())
    } else if (initialValues !== null && isValid && isFormChanged) {
      // Caso tenha dados no initialValues e o formulário seja válido e alterado
      setHasUnsavedChanges(true)
      setOnSubmit(() => handleSubmit(handleFormContents)())
    } else {
      // Caso contrário, não há mudanças para salvar
      setHasUnsavedChanges(false)
    }
  }, [isValid, handleSubmit, initialValues, isFormChanged])

  const saveChangesForm = useCallback(async () => {
    if (formRef.current) {
      if (isValid) {
        await handleSubmit(handleFormContents)()
        setOpenSaveChangesDialog(false)
      } else {
        setOpenSaveChangesDialog(false)
      }
    }
  }, [handleSubmit, handleFormContents, isFormChanged])

  const checkboxLabels = {
    cacheta: t('checkboxLabels.cacheta'),
    poker: t('checkboxLabels.poker'),
    buyDiamonds: t('checkboxLabels.buyDiamonds'),
  }

  return (
    <PanelTemplate
      title={t('title')}
      icon={<FiEdit className="h-m w-m" />}
      headerContent={<></>}
    >
      <form
        ref={formRef}
        onSubmit={handleSubmit(handleFormContents)}
        className="flex p-s flex-col justify-end items-end gap-xm rounded-sm bg-grey-300 shadow-DShadow-Special-X"
      >
        <div className="flex items-center gap-xs self-stretch">
          <h1 className="text-grey-900 text-H6 font-Regular">{t('content')}</h1>
        </div>
        <Divider />
        <div className="flex flex-col gap-s w-full">
          <div className="flex flex-col pb-s items-start w-full gap-s">
            <PanelAccordion
              title={t('configurations')}
              open={isConfigsOpen}
              onChange={(isOpen) => {
                setIsConfigsOpen(isOpen)
              }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-1 items-start gap-xl sm:gap-xm self-stretch py-s">
                <div className="flex flex-col items-start gap-xm self-stretch">
                  <Selector
                    {...register('menuBackgroundConfig')}
                    value={menuBackgroundConfig}
                    placeholder={t('menuBackgroundConfig')}
                    options={menuBackgroundOptions}
                    width={460}
                    onChange={async (value) => {
                      setValue('menuBackgroundConfig', value)
                      await trigger('menuBackgroundConfig')
                    }}
                    maxWidth
                  />
                  <Selector
                    {...register('siteBackgroundConfig')}
                    value={siteBackgroundConfig}
                    placeholder={t('siteBackgroundConfig')}
                    options={siteBackgroundOptions}
                    width={460}
                    onChange={async (value) => {
                      setValue('siteBackgroundConfig', value)
                      await trigger('siteBackgroundConfig')
                    }}
                    maxWidth
                  />
                  <Controller
                    name="siteBgImage"
                    control={control}
                    render={({ field }) => (
                      <>
                        {siteBackgroundConfig === 'Imagem de fundo' && (
                          <div className="w-full">
                            <Dropzone
                              className={
                                errors.siteBgImage
                                  ? 'border-notify-warning-normal'
                                  : 'border-notify-alert-normal'
                              }
                              accept={{ 'image/*': ['.jpg', '.jpeg', '.png'] }}
                              primaryText={t('addImage')}
                              secondaryText={t('imageFormats')}
                              width={180}
                              height={180}
                              value={
                                initialValues?.siteBgImage as string | undefined
                              }
                              onChange={(file) =>
                                onDropzoneChange(
                                  file,
                                  field.onChange,
                                  'siteBgImage',
                                )
                              }
                              resolutionNumber="1920x1600px"
                              typeResolutionText={t('imageResolution')}
                              validationMessages={
                                errors.siteBgImage?.message
                                  ? [
                                      {
                                        message:
                                          errors.siteBgImage.message.toString(),
                                      },
                                    ]
                                  : []
                              }
                            />
                          </div>
                        )}
                      </>
                    )}
                  />
                </div>
                <div className="flex flex-col items-start self-stretch w-full">
                  <Textfield
                    maxLength={40}
                    value={siteTitle}
                    placeholder={t('siteTitlePlaceholder')}
                    {...register('siteTitle')}
                    validationMessages={
                      errors.siteTitle?.message
                        ? [{ message: errors.siteTitle.message.toString() }]
                        : []
                    }
                    inputClassname="w-full"
                  />
                  <div className="flex flex-col items-start gap-xs">
                    <label className="text-grey-800 text-center text-BODY-S font-Regular mt-xm">
                      {t('show')}
                    </label>
                  </div>
                  <ReactSortable
                    list={state}
                    setList={(newState) => updateOrder(newState)}
                    animation={150}
                    className="flex flex-col justify-center items-start gap-s mt-xs"
                  >
                    {state.map((item) => (
                      <div key={item.id} className="flex items-center gap-xs">
                        <Image
                          src={sortableIcon}
                          alt={t('sortableIconAlt')}
                          className="cursor-grab"
                        />
                        {item.name === 'App Cacheta' && (
                          <Checkbox
                            {...register('cacheta')}
                            checked={cacheta}
                            onChange={(e) =>
                              handleCheckboxChange(
                                item.id,
                                'cacheta',
                                e.target.checked,
                              )
                            }
                          />
                        )}
                        {item.name === 'App Poker' && (
                          <Checkbox
                            {...register('poker')}
                            checked={poker}
                            onChange={(e) =>
                              handleCheckboxChange(
                                item.id,
                                'poker',
                                e.target.checked,
                              )
                            }
                          />
                        )}
                        {item.name === 'Comprar diamantes' && (
                          <Checkbox
                            {...register('buyDiamonds')}
                            checked={buyDiamonds}
                            onChange={(e) =>
                              handleCheckboxChange(
                                item.id,
                                'buyDiamonds',
                                e.target.checked,
                              )
                            }
                          />
                        )}
                        <label className="text-grey-800 text-BODY-M font-Regular cursor-grab">
                          {item.name === 'App Cacheta' &&
                            checkboxLabels.cacheta}
                          {item.name === 'App Poker' && checkboxLabels.poker}
                          {item.name === 'Comprar diamantes' &&
                            checkboxLabels.buyDiamonds}
                        </label>
                        <TooltipPrimitive.Provider delayDuration={0}>
                          <Tooltip
                            content={
                              <p>
                                {item.name === 'App Cacheta' &&
                                  t('cachetaTooltip')}
                                {item.name === 'App Poker' && t('pokerTooltip')}
                                {item.name === 'Comprar diamantes' &&
                                  t('buyDiamondsTooltip')}
                              </p>
                            }
                            defaultOpen={false}
                            contentMarginLeft="110px"
                          >
                            <FiAlertCircle className="w-6 h-6 cursor-pointer" />
                          </Tooltip>
                        </TooltipPrimitive.Provider>
                      </div>
                    ))}
                  </ReactSortable>
                </div>
              </div>
            </PanelAccordion>
            <Divider />
          </div>
          <div className="flex flex-col py-s items-start w-full gap-s">
            <PanelAccordion
              title={t('about')}
              open={isAboutOpen}
              onChange={(isOpen) => {
                setIsAboutOpen(isOpen)
              }}
              headerContent={
                <>
                  <TooltipPrimitive.Provider delayDuration={0}>
                    <Tooltip
                      content={
                        <div>
                          <p>{t('aboutTooltip')}</p>
                          <br />
                          <p>
                            <strong>{t('requiredField')}</strong>{' '}
                            {t('titleAndTextRequired')}
                          </p>
                        </div>
                      }
                      defaultOpen={false}
                      contentMarginLeft="110px"
                    >
                      <FiAlertCircle className="w-6 h-6 cursor-pointer" />
                    </Tooltip>
                  </TooltipPrimitive.Provider>
                  <div className="ml-xs">
                    <Switch
                      {...register('hasAbout')}
                      checked={hasAbout}
                      onChange={async (e) => {
                        setValue('hasAbout', e.target.checked)
                        await trigger('title')
                        await trigger('supportingText')

                        if (e.target.checked) {
                          setIsAboutOpen(true)
                        }
                      }}
                    />
                  </div>
                </>
              }
            >
              <div className="grid grid-cols-2 sm:grid-cols-1 items-center gap-xm self-stretch w-full mt-s mb-xm">
                <div className="flex flex-col items-start gap-xs self-stretch w-full">
                  <label className="text-grey-900 text-BODY-S font-Regular">
                    {t('aboutTitle')}
                  </label>
                  <div className="w-full">
                    <Controller
                      name="title"
                      control={control}
                      render={({ field }) => (
                        <TextEditor
                          variant={errors.title && 'error'}
                          maxLength={100}
                          value={field.value || ''}
                          onChange={field.onChange}
                          validationMessages={
                            errors.title?.message
                              ? [
                                  {
                                    message: errors.title.message.toString(),
                                  },
                                ]
                              : []
                          }
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-start gap-xs self-stretch w-full">
                  <label className="text-grey-900 text-BODY-S font-Regular">
                    {t('supportingText')}
                  </label>
                  <div className="w-full">
                    <Controller
                      name="supportingText"
                      control={control}
                      render={({ field }) => (
                        <TextEditor
                          variant={errors.supportingText && 'error'}
                          maxLength={300}
                          value={field.value || ''}
                          onChange={field.onChange}
                          validationMessages={
                            errors.supportingText?.message
                              ? [
                                  {
                                    message:
                                      errors.supportingText.message.toString(),
                                  },
                                ]
                              : []
                          }
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </PanelAccordion>
            <Divider />
          </div>
          <div className="flex flex-col py-s items-start w-full gap-s">
            <PanelAccordion
              title={t('cards')}
              open={isCardsOpen}
              onChange={(isOpen) => {
                setIsCardsOpen(isOpen)
              }}
              headerContent={
                <>
                  <TooltipPrimitive.Provider delayDuration={0}>
                    <Tooltip
                      content={
                        <div>
                          <p>{t('cardsTooltip')}</p>
                          <br />
                          <p>
                            <strong>{t('requiredField')}</strong>{' '}
                            {t('imageAndTextRequired')}
                          </p>
                          <br />
                          <p>{t('svgIcons')}</p>
                        </div>
                      }
                      defaultOpen={false}
                      contentMarginLeft="110px"
                    >
                      <FiAlertCircle className="w-6 h-6 cursor-pointer" />
                    </Tooltip>
                  </TooltipPrimitive.Provider>
                  <div className="ml-xs">
                    <Switch
                      {...register('hasCards')}
                      checked={hasCards}
                      onChange={async (e) => {
                        setValue('hasCards', e.target.checked)
                        await trigger('cardsIcon1')
                        await trigger('cardsIcon2')
                        await trigger('cardsIcon3')
                        await trigger('cardsIcon1Text')
                        await trigger('cardsIcon2Text')
                        await trigger('cardsIcon3Text')

                        if (e.target.checked) {
                          setIsCardsOpen(true)
                        }
                      }}
                    />
                  </div>
                </>
              }
            >
              <div className="grid grid-cols-3 sm:grid-cols-1 items-start gap-s mt-s">
                <div className="flex flex-col gap-xs">
                  <Controller
                    name="cardsIcon1"
                    control={control}
                    render={({ field }) => (
                      <Dropzone
                        className={
                          errors.cardsIcon1
                            ? 'border-notify-warning-normal'
                            : 'border-notify-alert-normal'
                        }
                        accept={{ 'image/*': ['.png', '.svg', '.svg%2bxml'] }}
                        primaryText={t('addImage')}
                        secondaryText={'png, svg'}
                        width={180}
                        height={180}
                        value={initialValues?.cardsIcon1 as string | undefined}
                        onChange={(file) =>
                          onDropzoneChange(file, field.onChange, 'cardsIcon1')
                        }
                        resolutionNumber="180x180px"
                        typeResolutionText={t('imageResolution')}
                        validationMessages={
                          errors.cardsIcon1?.message
                            ? [
                                {
                                  message: errors.cardsIcon1.message.toString(),
                                },
                              ]
                            : []
                        }
                        reserveSpaceForMessages
                      />
                    )}
                  />
                  <Controller
                    name="cardsIcon1Text"
                    control={control}
                    render={({ field }) => (
                      <TextEditor
                        variant={errors.cardsIcon1Text && 'error'}
                        maxLength={130}
                        value={field.value || ''}
                        onChange={field.onChange}
                        validationMessages={
                          errors.cardsIcon1Text?.message
                            ? [
                                {
                                  message:
                                    errors.cardsIcon1Text.message.toString(),
                                },
                              ]
                            : []
                        }
                      />
                    )}
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <Controller
                    name="cardsIcon2"
                    control={control}
                    render={({ field }) => (
                      <Dropzone
                        className={
                          errors.cardsIcon2
                            ? 'border-notify-warning-normal'
                            : 'border-notify-alert-normal'
                        }
                        accept={{ 'image/*': ['.png', '.svg', '.svg%2bxml'] }}
                        primaryText={t('addImage')}
                        secondaryText={'png, svg'}
                        width={180}
                        height={180}
                        value={initialValues?.cardsIcon2 as string | undefined}
                        onChange={(file) =>
                          onDropzoneChange(file, field.onChange, 'cardsIcon2')
                        }
                        resolutionNumber="180x180px"
                        typeResolutionText={t('imageResolution')}
                        validationMessages={
                          errors.cardsIcon2?.message
                            ? [
                                {
                                  message: errors.cardsIcon2.message.toString(),
                                },
                              ]
                            : []
                        }
                        reserveSpaceForMessages
                      />
                    )}
                  />
                  <Controller
                    name="cardsIcon2Text"
                    control={control}
                    render={({ field }) => (
                      <TextEditor
                        variant={errors.cardsIcon2Text && 'error'}
                        maxLength={130}
                        value={field.value || ''}
                        onChange={field.onChange}
                        validationMessages={
                          errors.cardsIcon2Text?.message
                            ? [
                                {
                                  message:
                                    errors.cardsIcon2Text.message.toString(),
                                },
                              ]
                            : []
                        }
                      />
                    )}
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <Controller
                    name="cardsIcon3"
                    control={control}
                    render={({ field }) => (
                      <Dropzone
                        className={
                          errors.cardsIcon3
                            ? 'border-notify-warning-normal'
                            : 'border-notify-alert-normal'
                        }
                        accept={{ 'image/*': ['.png', '.svg', '.svg%2bxml'] }}
                        primaryText={t('addImage')}
                        secondaryText={'png, svg'}
                        width={180}
                        height={180}
                        value={initialValues?.cardsIcon3 as string | undefined}
                        onChange={(file) =>
                          onDropzoneChange(file, field.onChange, 'cardsIcon3')
                        }
                        resolutionNumber="180x180px"
                        typeResolutionText={t('imageResolution')}
                        validationMessages={
                          errors.cardsIcon3?.message
                            ? [
                                {
                                  message: errors.cardsIcon3.message.toString(),
                                },
                              ]
                            : []
                        }
                        reserveSpaceForMessages
                      />
                    )}
                  />
                  <Controller
                    name="cardsIcon3Text"
                    control={control}
                    render={({ field }) => (
                      <TextEditor
                        variant={errors.cardsIcon3Text && 'error'}
                        maxLength={130}
                        value={field.value || ''}
                        onChange={field.onChange}
                        validationMessages={
                          errors.cardsIcon3Text?.message
                            ? [
                                {
                                  message:
                                    errors.cardsIcon3Text.message.toString(),
                                },
                              ]
                            : []
                        }
                      />
                    )}
                  />
                </div>
              </div>
            </PanelAccordion>
            <Divider />
          </div>
        </div>
        <Button
          width={137}
          preDisabled={
            !isValid ||
            isSubmitting ||
            (!isFormChanged && initialValues !== null)
          }
          onClick={handleDialogOpen}
        >
          {t('saveChanges')}
        </Button>
      </form>

      <Dialog
        title={t('saveChangesDialogTitle')}
        open={openSaveChangesDialog}
        onClose={() => setOpenSaveChangesDialog(false)}
        className="sm:max-w-[328px] max-w-[400px]"
        removeHeaderPaddingX
      >
        <div className="flex flex-col items-center justify-center gap-s my-xm">
          <FiAlertTriangle className="w-[64px] h-[64px] text-notify-alert-normal" />
          <p className="text-BODY-XM font-Regular text-grey-900 text-center px-s w-11/12">
            {t('saveChangesDialogDescription')}
          </p>
          <strong className="text-grey-900 text-BODY-XM">
            {t('saveChangesDialogQuestion')}
          </strong>
          <div className="flex justify-center items-center gap-s self-stretch mt-xs">
            <Button
              className="cursor-pointer"
              preIcon={<FiArrowLeft className="w-[16px] h-[16px]" />}
              variant="text"
              onClick={(e) => {
                e.preventDefault()
                setOpenSaveChangesDialog(false)
              }}
            >
              {t('saveChangesDialogBack')}
            </Button>
            <Button
              className="cursor-pointer"
              variant="success"
              onClick={saveChangesForm}
            >
              <label className="text-grey-300">
                {t('saveChangesDialogSave')}
              </label>
            </Button>
          </div>
        </div>
      </Dialog>
    </PanelTemplate>
  )
}
