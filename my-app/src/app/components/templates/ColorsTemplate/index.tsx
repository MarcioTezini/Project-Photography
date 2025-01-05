'use client'

import { useState, useEffect, useRef } from 'react'
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiChevronDown,
  FiChevronUp,
  FiEdit,
  FiLoader,
} from 'react-icons/fi'
import PanelTemplate from '@/components/templates/PanelTemplate'
import Button from '@/components/atoms/Button'
import { ColorResult } from 'react-color'
import './styles.css'
import { getCustomerColors, saveColors } from '@/services/customer/customer'
import Dialog from '@/components/molecules/Dialog'
import { showToast } from '@/components/atoms/Toast'
import { useTranslations } from 'next-intl'
import { ColorSection } from '@/components/molecules/ColorSection'
import { useClientStore } from '@/stores/ClientStore'
import { useDebounce } from '@/hooks/useDebounce'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'
import { hexToRgb } from '@/utils/colorsUtils'

export interface IColors {
  fichasPay: {
    main: {
      [key: string]: string
    }
    secondary: {
      [key: string]: string
    }
    highlight: {
      [key: string]: string
    }
    a: {
      main: {
        [key: string]: string
      }
      secondary: {
        [key: string]: string
      }
      highlight: {
        [key: string]: string
      }
    }
  }
  grey: {
    [key: string]: string
  }
  notify: {
    warning: {
      [key: string]: string
    }
    alert: {
      [key: string]: string
    }
    success: {
      [key: string]: string
    }
    info: {
      [key: string]: string
    }
  }
}

export function Colors() {
  const [colors, setColors] = useState<Partial<IColors>>({})
  const [initialColors, setInitialColors] = useState<Partial<IColors>>({})
  const [isAdvancedOptionsOpen, setIsAdvancedOptionsOpen] = useState(false)
  const [isColorChanged, setIsColorChanged] = useState(false)
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const t = useTranslations()
  const { selectedClient } = useClientStore()
  const [isLoadingColors, setIsLoadingColors] = useState(true)
  const isFirstRender = useRef(true)

  const { setHasUnsavedChanges, setOnSubmit } = useSaveChangesDialogStore()

  const fetchCustomerData = async () => {
    setIsLoadingColors(true)
    try {
      const customerData = await getCustomerColors()
      const configs = customerData.data.configs

      const customerColors: Partial<IColors> = {
        fichasPay: {
          main: configs.colors.fichasPay.main,
          secondary: configs.colors.fichasPay.secondary,
          highlight: configs.colors.fichasPay.highlight,
          a: {
            main: configs.colors.fichasPay.a.main,
            secondary: configs.colors.fichasPay.a.secondary,
            highlight: configs.colors.fichasPay.a.highlight,
          },
        },
        grey: configs.colors.grey,
        notify: {
          warning: {
            600: configs.colors.notify.warning.darkest,
            500: configs.colors.notify.warning.dark,
            400: configs.colors.notify.warning.normal,
            300: configs.colors.notify.warning.light,
          },
          alert: {
            600: configs.colors.notify.alert.darkest,
            500: configs.colors.notify.alert.dark,
            400: configs.colors.notify.alert.normal,
            300: configs.colors.notify.alert.light,
          },
          success: {
            600: configs.colors.notify.success.darkest,
            500: configs.colors.notify.success.dark,
            400: configs.colors.notify.success.normal,
            300: configs.colors.notify.success.light,
          },
          info: {
            600: configs.colors.notify.info.darkest,
            500: configs.colors.notify.info.dark,
            400: configs.colors.notify.info.normal,
            300: configs.colors.notify.info.light,
          },
        },
      }

      setColors(customerColors)
      setInitialColors(customerColors)
      setIsLoadingColors(false)
    } catch (error) {
      setIsLoadingColors(false)
      showToast(
        'error',
        t('Panel.Colors.errorToastLoadMessage'),
        5000,
        'bottom-left',
      )
      console.error('Error fetching customer data:', error)
    }
  }

  const fetchCustomerDataDebounced = useDebounce(fetchCustomerData, 1000)

  useEffect(() => {
    fetchCustomerData().then(() => {
      setTimeout(() => {
        isFirstRender.current = false
      }, 1000)
    })
  }, [])

  useEffect(() => {
    if (!isFirstRender.current) {
      fetchCustomerDataDebounced()
    }
  }, [selectedClient])

  useEffect(() => {
    if (isColorChanged) {
      setHasUnsavedChanges(true)
      setOnSubmit(() => handleSaveChanges())
    } else {
      setHasUnsavedChanges(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isColorChanged])

  const handleColorChange = (path: string[], color: ColorResult) => {
    setColors((prevColors) => {
      const updatedColors = { ...prevColors }
      let currentLevel: { [key: string]: unknown } = updatedColors

      path.slice(0, -1).forEach((key) => {
        currentLevel = currentLevel[key] as { [key: string]: unknown }
      })
      currentLevel[path[path.length - 1]] = color.hex

      return updatedColors
    })

    setIsSaved(false)
  }

  useEffect(() => {
    const oldColors = initialColors
    const currentColors = colors

    setIsColorChanged(oldColors !== currentColors)
  }, [colors, initialColors])

  const handleSaveChanges = async () => {
    // Verifique se as cores principais existem antes de calcular as cores com opacidades
    const mainColor400 = colors.fichasPay?.main?.['400'] ?? ''
    const secondaryColor400 = colors.fichasPay?.secondary?.['400'] ?? ''
    const highlightColor400 = colors.fichasPay?.highlight?.['400'] ?? ''

    const jsonToSave = {
      colors: {
        fichasPay: {
          main: colors.fichasPay?.main ?? {},
          secondary: colors.fichasPay?.secondary ?? {},
          highlight: colors.fichasPay?.highlight ?? {},
          a: {
            main: {
              80: `rgba(${hexToRgb(mainColor400)}, 0.80)`,
              50: `rgba(${hexToRgb(mainColor400)}, 0.50)`,
              30: `rgba(${hexToRgb(mainColor400)}, 0.30)`,
              15: `rgba(${hexToRgb(mainColor400)}, 0.15)`,
              5: `rgba(${hexToRgb(mainColor400)}, 0.05)`,
            },
            secondary: {
              80: `rgba(${hexToRgb(secondaryColor400)}, 0.80)`,
              50: `rgba(${hexToRgb(secondaryColor400)}, 0.50)`,
              30: `rgba(${hexToRgb(secondaryColor400)}, 0.30)`,
              15: `rgba(${hexToRgb(secondaryColor400)}, 0.15)`,
              5: `rgba(${hexToRgb(secondaryColor400)}, 0.05)`,
            },
            highlight: {
              80: `rgba(${hexToRgb(highlightColor400)}, 0.80)`,
              50: `rgba(${hexToRgb(highlightColor400)}, 0.50)`,
              30: `rgba(${hexToRgb(highlightColor400)}, 0.30)`,
              15: `rgba(${hexToRgb(highlightColor400)}, 0.15)`,
              5: `rgba(${hexToRgb(highlightColor400)}, 0.05)`,
            },
          },
        },
        grey: colors.grey ?? {},
        notify: {
          warning: {
            darkest: colors.notify?.warning?.[600] ?? '',
            dark: colors.notify?.warning?.[500] ?? '',
            normal: colors.notify?.warning?.[400] ?? '',
            light: colors.notify?.warning?.[300] ?? '',
          },
          alert: {
            darkest: colors.notify?.alert?.[600] ?? '',
            dark: colors.notify?.alert?.[500] ?? '',
            normal: colors.notify?.alert?.[400] ?? '',
            light: colors.notify?.alert?.[300] ?? '',
          },
          success: {
            darkest: colors.notify?.success?.[600] ?? '',
            dark: colors.notify?.success?.[500] ?? '',
            normal: colors.notify?.success?.[400] ?? '',
            light: colors.notify?.success?.[300] ?? '',
          },
          info: {
            darkest: colors.notify?.info?.[600] ?? '',
            dark: colors.notify?.info?.[500] ?? '',
            normal: colors.notify?.info?.[400] ?? '',
            light: colors.notify?.info?.[300] ?? '',
          },
        },
      },
    }

    if (isColorChanged) {
      try {
        const response = await saveColors(jsonToSave)

        if (response.success) {
          setOpenUpdateDialog(false)
          setIsColorChanged(false)
          setIsSaved(true)
          showToast(
            'success',
            t('Panel.Colors.successToastMessage'),
            5000,
            'bottom-left',
          )
        } else {
          showToast(
            'error',
            t('Panel.Colors.errorToastMessage'),
            5000,
            'bottom-left',
          )
          throw new Error('Failed to save customer data')
        }
      } catch (error) {
        showToast(
          'error',
          t('Panel.Colors.errorToastMessage'),
          5000,
          'bottom-left',
        )
        console.error('Failed to save customer data')
      }
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

  const colorsFichasPayMainArray = Object.keys(
    colors.fichasPay?.main ?? {},
  ).reverse()
  const colorsFichasPaySecondaryArray = Object.keys(
    colors.fichasPay?.secondary ?? {},
  ).reverse()
  const colorsFichasPayHighlightArray = Object.keys(
    colors.fichasPay?.highlight ?? {},
  ).reverse()
  const colorsGreyArray = Object.keys(colors.grey ?? {}).reverse()
  const colorsNotifyWarning = Object.keys(
    colors.notify?.warning ?? {},
  ).reverse()
  const colorsNotifyAlert = Object.keys(colors.notify?.alert ?? {}).reverse()
  const colorsNotifySuccess = Object.keys(
    colors.notify?.success ?? {},
  ).reverse()
  const colorsNotifyInfo = Object.keys(colors.notify?.info ?? {}).reverse()

  return (
    <PanelTemplate
      title={t('Panel.Colors.title')}
      icon={<FiEdit className="h-m w-m" />}
    >
      <div className="flex p-s sm:px-xs sm:py-s flex-col justify-center items-center sm:items-center gap-xm self-stretch rounded-sm bg-grey-300 shadow-DShadow-Special-X">
        <div className="flex items-center gap-xs self-stretch">
          <h6 className="text-grey-900 font-Regular text-H6">
            {t('Panel.Colors.colors')}
          </h6>
        </div>
        <hr className="w-full text-grey-600" />
        {isLoadingColors ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <FiLoader className="animate-spin text-H3 text-grey-500" />
          </div>
        ) : (
          <>
            <div className="flex p-s w-full flex-col items-start gap-s self-stretch rounded-sm bg-grey-300 shadow-DShadow-Special-X">
              <div className="text-grey-900 text-BODY-XM font-Regular leading-4">
                {t('Panel.Colors.brand')}
              </div>
              <ColorSection
                title={t(`Panel.Colors.main`)}
                section="fichasPay"
                colorArray={colorsFichasPayMainArray}
                variant="main"
                colorValue={colors.fichasPay?.main ?? ''}
                colors={colors as IColors}
                handleColorChange={handleColorChange}
              />
              <ColorSection
                title={t(`Panel.Colors.secondary`)}
                section="fichasPay"
                colorArray={colorsFichasPaySecondaryArray}
                variant="secondary"
                colorValue={colors.fichasPay?.secondary ?? ''}
                colors={colors as IColors}
                handleColorChange={handleColorChange}
              />
              <ColorSection
                title={t(`Panel.Colors.highlight`)}
                section="fichasPay"
                colorArray={colorsFichasPayHighlightArray}
                variant="highlight"
                colorValue={colors.fichasPay?.highlight ?? ''}
                colors={colors as IColors}
                handleColorChange={handleColorChange}
              />
            </div>
            <div className="flex flex-col pb-s justify-between items-center self-stretch border-b border-solid border-grey-500">
              <div className="w-full flex justify-between">
                <div className="text-BODY-M font-Regular leading-5">
                  {t('Panel.Colors.advancedOptions')}
                </div>
                <div className="">
                  <button
                    onClick={() =>
                      setIsAdvancedOptionsOpen(!isAdvancedOptionsOpen)
                    }
                  >
                    {isAdvancedOptionsOpen ? (
                      <FiChevronDown
                        size={20}
                        className="text-fichasPay-main-400"
                      />
                    ) : (
                      <FiChevronUp size={20} />
                    )}
                  </button>
                </div>
              </div>
              {isAdvancedOptionsOpen && (
                <div className="flex mt-s p-s w-full flex-col items-start gap-s self-stretch rounded-sm bg-grey-300 shadow-DShadow-Special-X">
                  <div className="text-grey-900 text-BODY-XM font-Regular leading-4">
                    {t('Panel.Colors.systemColors')}
                  </div>
                  <ColorSection
                    title={t(`Panel.Colors.grey`)}
                    section="grey"
                    colorArray={colorsGreyArray}
                    variant="grey"
                    colorValue={colors.grey ?? ''}
                    colors={colors as IColors}
                    handleColorChange={handleColorChange}
                    spaceRight="-264px"
                  />
                  <ColorSection
                    title={t(`Panel.Colors.warning`)}
                    section="notify"
                    colorArray={colorsNotifyWarning}
                    variant="warning"
                    colorValue={colors.notify?.warning ?? ''}
                    colors={colors as IColors}
                    handleColorChange={handleColorChange}
                    spaceRight="-264px"
                  />
                  <ColorSection
                    title={t(`Panel.Colors.alert`)}
                    section="notify"
                    colorArray={colorsNotifyAlert}
                    variant="alert"
                    colorValue={colors.notify?.alert ?? ''}
                    colors={colors as IColors}
                    handleColorChange={handleColorChange}
                    spaceRight="-264px"
                  />
                  <ColorSection
                    title={t(`Panel.Colors.success`)}
                    section="notify"
                    colorArray={colorsNotifySuccess}
                    variant="success"
                    colorValue={colors.notify?.success ?? ''}
                    colors={colors as IColors}
                    handleColorChange={handleColorChange}
                    spaceRight="-264px"
                  />
                  <ColorSection
                    title={t(`Panel.Colors.info`)}
                    section="notify"
                    colorArray={colorsNotifyInfo}
                    variant="info"
                    colorValue={colors.notify?.info ?? ''}
                    colors={colors as IColors}
                    handleColorChange={handleColorChange}
                    spaceRight="-264px"
                  />
                </div>
              )}
            </div>
          </>
        )}

        <Button
          size="lg"
          width={160}
          variant="primary"
          preDisabled={isSaved || !isColorChanged}
          disabled={(!isColorChanged && !isSaved) || isLoadingColors}
          onClick={handleUpdateDialog}
          className="self-end sm:self-center"
        >
          {t('Panel.Colors.submitButtonText')}
        </Button>
        <Dialog
          title={t('Panel.Colors.submitButtonText')}
          open={openUpdateDialog}
          onClose={handleCloseUpdateDialog}
          className="sm:max-w-[328px] max-w-[400px]"
          removeHeaderPaddingX
        >
          <div className="flex flex-col items-center justify-center gap-s my-xm">
            <FiAlertTriangle className="w-[64px] h-[64px] text-notify-alert-normal" />
            <p className="text-BODY-XM font-Regular text-grey-900 text-center px-s w-11/12">
              {t('Panel.Colors.alertDialogInfo')}
            </p>
            <strong className="text-grey-900 text-BODY-XM">
              {t('Panel.Colors.alertDialogText')}
            </strong>
            <div className="flex justify-center items-center gap-s self-stretch mt-xs">
              <Button
                className="cursor-pointer"
                preIcon={<FiArrowLeft className="w-[16px] h-[16px]" />}
                variant="text"
                onClick={handleCloseUpdateDialog}
              >
                {t('Panel.Colors.backButtonText')}
              </Button>
              <Button
                className="cursor-pointer"
                variant="success"
                onClick={handleSaveChanges}
              >
                <span className="text-grey-300">
                  {t('Panel.Colors.submitButtonText')}
                </span>
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </PanelTemplate>
  )
}
