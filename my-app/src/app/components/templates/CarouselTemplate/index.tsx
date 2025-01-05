/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiEdit,
  FiPlusCircle,
  FiSearch,
  FiTrash2,
} from 'react-icons/fi'
import PanelTemplate from '../PanelTemplate'
import Dialog from '@/components/molecules/Dialog'
import { useTranslations } from 'next-intl'
import { ContentPage } from '@/components/molecules/ContentPage'
import Textfield from '@/components/atoms/Textfield'
import Button from '@/components/atoms/Button'
import { deleteListCarousel } from '@/services/carousel/carousel'
import { useDebounce } from '@/hooks/useDebounce'
import { TableCarousel } from '@/components/organisms/TableCarousel'
import FormCarousel from '@/components/organisms/FormCarousel'
import { showToast } from '@/components/atoms/Toast'
import { useCarouselStore } from '@/stores/CarouselStore'
import { useSaveChangesDialogStore } from '@/stores/SaveChangesDialogStore'
import FormCarouselUpdate from '@/components/organisms/FormCarouselUpdate'
import { useClientStore } from '@/stores/ClientStore'

const CarouselTemplate = () => {
  const t = useTranslations()
  const isFirstRender = useRef(true)
  const { selectedClient } = useClientStore()
  const {
    setOpenAddCarouselDialog,
    setOpenRemoveCarouselDialog,
    openUpdateCarouselDialog,
    openRemoveCarouselDialog,
    searchDesktop,
    searchMobile,
    loadCarousel,
    setIsMobile,
    isMobile,
    setOpenUpdateCarouselDialog,
    selectedCarouselId,
    setSelectedCarouselId,
    setSearchDesktop,
    setSearchMobile,
    carouselDataDesktop,
    carouselDataMobile,
    rowCountDesktop,
    rowCountMobile,
    currentSortingDesktop,
    currentSortingMobile,
    currentPaginationDesktop,
    currentPaginationMobile,
  } = useCarouselStore()
  const [openFormCarousel, setOpenFormCarousel] = useState(false)
  const [currentDevice, setCurrentDevice] = useState<'desktop' | 'mobile'>(
    'desktop',
  )

  const {
    setIsSaveChangesDialogOpen,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    setSaveWithoutChangesFunction,
  } = useSaveChangesDialogStore()

  const infoByDevice = {
    desktop: {
      devices: 1,
      maxSizes: { width: 1920, height: 768 },
      title: t('Panel.Carousel.formCarousel.AddDesktopImage'),
      titleEdit: 'Editar Imagem Desktop',
    },
    mobile: {
      devices: 2,
      maxSizes: { width: 680, height: 600 },
      title: 'Adicionar Imagem Mobile',
      titleEdit: 'Editar Imagem Mobile',
    },
  }

  const currentInfoByDevice = infoByDevice[currentDevice]

  const handleOpenFormCarousel = (typeDevice: 'desktop' | 'mobile') => {
    setOpenFormCarousel(true)
    setCurrentDevice(typeDevice)
  }

  const loadDesktopCarouselDebounce = useDebounce(
    () => loadCarousel({ pageIndex: 0, pageSize: 25 }, currentSortingDesktop),
    1000,
  )

  const loadMobileCarouselDebounce = useDebounce(
    () => loadCarousel({ pageIndex: 0, pageSize: 25 }, currentSortingMobile, 2),
    1000,
  )

  useEffect(() => {
    loadCarousel({ pageIndex: 0, pageSize: 25 }, currentSortingDesktop).then(
      () => {
        setTimeout(() => {
          isFirstRender.current = false
        }, 1000)
      },
    )
  }, [])

  useEffect(() => {
    loadCarousel({ pageIndex: 0, pageSize: 25 }, currentSortingMobile, 2).then(
      () => {
        setTimeout(() => {
          isFirstRender.current = false
        }, 1000)
      },
    )
  }, [])

  useEffect(() => {
    if (!isFirstRender.current) {
      loadMobileCarouselDebounce()
      loadDesktopCarouselDebounce()
    }
  }, [selectedClient])

  useEffect(() => {
    if (!isFirstRender.current) {
      loadDesktopCarouselDebounce()
    }
  }, [searchDesktop])

  useEffect(() => {
    if (!isFirstRender.current) {
      loadMobileCarouselDebounce()
    }
  }, [searchMobile])

  const [tableKey, setTableKey] = useState(Date.now())

  const refreshData = useCallback(() => {
    setTableKey(Date.now())
    loadMobileCarouselDebounce()
    loadDesktopCarouselDebounce()
  }, [])

  const handleSearchDesktop = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchDesktop(e.target.value)
  }

  const handleSearchMobile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchMobile(e.target.value)
  }

  const handleCloseRemoveCarouselDialog = () =>
    setOpenRemoveCarouselDialog(false)
  const handleRemoveCarouselDialog = () => setOpenRemoveCarouselDialog(false)

  const handleRemoveAgent = async (id: number) => {
    try {
      const response = await deleteListCarousel(id)
      if (response.success) {
        showToast(
          'success',
          t('Panel.Carousel.Successes.bannerDeletedSuccessfully'),
          5000,
          'bottom-left',
        )

        refreshData()
      }
    } catch (error) {
      showToast(
        'error',
        t('Panel.Carousel.Errors.bannerDeletionFailed'),
        5000,
        'bottom-left',
      )
    }
    setOpenRemoveCarouselDialog(false)
  }

  const handleCloseDesk = () => {
    if (hasUnsavedChanges) {
      setIsSaveChangesDialogOpen(true)
      setSaveWithoutChangesFunction(() => setOpenFormCarousel(false))
    } else {
      setOpenFormCarousel(false)
    }
    setHasUnsavedChanges(false)
  }

  const handleDialogClose = () => {
    if (hasUnsavedChanges) {
      setIsSaveChangesDialogOpen(true)
      setSaveWithoutChangesFunction(() => setOpenUpdateCarouselDialog(false))
    } else {
      setOpenUpdateCarouselDialog(false)
    }
    setHasUnsavedChanges(false)
  }

  return (
    <PanelTemplate
      title={t('Panel.Carousel.CarouselTemplate.MyWhitelabel')}
      icon={<FiEdit className="h-m w-m" />}
    >
      <div className="pb-xxxm">
        <ContentPage
          pageName={t('Panel.Carousel.CarouselTemplate.SectionTitle')}
        >
          <div className="flex items-center justify-between sm:flex-col sm:gap-s sm:items-start">
            <div className="flex gap-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M18.5352 0.833496H1.46484C0.657109 0.833496 0 1.49673 0 2.31199V14.1399C0 14.9552 0.657109 15.6184 1.46484 15.6184H7.36328V15.9141C7.36328 16.7294 6.70617 17.3926 5.89844 17.3926H3.22266C2.41492 17.3926 1.75781 18.0559 1.75781 18.8711C1.75781 19.0345 1.88898 19.1668 2.05078 19.1668H17.9492C18.111 19.1668 18.2422 19.0345 18.2422 18.8711C18.2422 18.0559 17.5851 17.3926 16.7773 17.3926H14.1016C13.2938 17.3926 12.6367 16.7294 12.6367 15.9141V15.6184H18.5352C19.3429 15.6184 20 14.9552 20 14.1399V2.31199C20 1.49673 19.3429 0.833496 18.5352 0.833496ZM1.46484 1.42489H18.5352C19.0198 1.42489 19.4141 1.82287 19.4141 2.31199V12.6615H0.585938V2.31199C0.585938 1.82287 0.980195 1.42489 1.46484 1.42489ZM12.6683 17.3926H10.5859C10.4241 17.3926 10.293 17.525 10.293 17.6883C10.293 17.8517 10.4241 17.984 10.5859 17.984H16.7773C17.1593 17.984 17.4852 18.2312 17.6061 18.5754H2.39395C2.51484 18.2312 2.8407 17.984 3.22266 17.984H9.41406C9.57586 17.984 9.70703 17.8517 9.70703 17.6883C9.70703 17.525 9.57586 17.3926 9.41406 17.3926H7.33172C7.71238 17.0166 7.94922 16.4929 7.94922 15.9141V15.6184H12.0508V15.9141C12.0508 16.4929 12.2876 17.0166 12.6683 17.3926ZM18.5352 15.027H1.46484C0.980195 15.027 0.585938 14.6291 0.585938 14.1399V13.2529H19.4141V14.1399C19.4141 14.6291 19.0198 15.027 18.5352 15.027Z"
                  fill="#EFA144"
                />
              </svg>
              {t('Panel.Carousel.CarouselTemplate.ForDesktop')}
            </div>
            <div className="flex gap-s sm:flex-col sm:items-start text-BODY-XM font-Regular text-grey-700 w-full max-w-[500px] sm:max-w-full">
              <Button
                className="sm:mb-s"
                width={178}
                addIcon={<FiPlusCircle size="18" />}
                variant="primary"
                onClick={() => handleOpenFormCarousel('desktop')}
              >
                {t('Panel.Carousel.CarouselTemplate.AddImages')}
              </Button>
              <Textfield
                name="search-Desktop"
                placeholder={t('Panel.MyClients.searchPlaceholder')}
                icon={<FiSearch size={24} className="text-grey-600" />}
                onChange={handleSearchDesktop}
                value={searchDesktop}
              />
            </div>
          </div>
          <div className="mt-s">
            <TableCarousel
              key={tableKey}
              data={carouselDataDesktop}
              rowCount={rowCountDesktop}
              setIsMobile={setIsMobile}
              isMobile={false}
              onPaginationChange={loadCarousel}
              setOpenRemoveCarouselDialog={setOpenRemoveCarouselDialog}
              setOpenUpdateCarouselDialog={setOpenUpdateCarouselDialog}
              setSelectedCarouselId={setSelectedCarouselId}
              reloadData={loadDesktopCarouselDebounce}
              initialSorting={currentSortingDesktop}
              initialPagination={currentPaginationDesktop}
            />
          </div>
          <div className="flex items-center justify-between sm:flex-col sm:gap-s sm:items-start mt-xl">
            <div className="flex gap-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="20"
                viewBox="0 0 13 20"
                fill="none"
              >
                <path
                  d="M10.2143 0.490967H2.78589C2.26011 0.491559 1.75603 0.700689 1.38424 1.07247C1.01246 1.44426 0.803327 1.94834 0.802734 2.47413V17.5258C0.803327 18.0516 1.01246 18.5557 1.38424 18.9275C1.75603 19.2992 2.26011 19.5084 2.78589 19.509H10.2143C10.7401 19.5084 11.2442 19.2992 11.616 18.9275C11.9877 18.5557 12.1969 18.0516 12.1975 17.5258V2.47413C12.1969 1.94834 11.9877 1.44426 11.616 1.07247C11.2442 0.700689 10.7401 0.491559 10.2143 0.490967ZM8.73273 1.20287V1.66296C8.73257 1.7559 8.69556 1.84497 8.62983 1.91067C8.5641 1.97636 8.475 2.01332 8.38206 2.01342H4.61915C4.52623 2.01332 4.43715 1.97636 4.37145 1.91066C4.30575 1.84496 4.2688 1.75588 4.26869 1.66296V1.20287H8.73273ZM11.4854 17.5258C11.485 17.8628 11.3509 18.186 11.1126 18.4243C10.8743 18.6626 10.5511 18.7967 10.2141 18.7971H2.78589C2.44885 18.7967 2.12572 18.6626 1.8874 18.4243C1.64907 18.186 1.51501 17.8628 1.51464 17.5258V2.47413C1.51501 2.13708 1.64907 1.81395 1.8874 1.57563C2.12572 1.3373 2.44885 1.20325 2.78589 1.20287H3.55597V1.66296C3.55629 1.94462 3.66832 2.21465 3.86749 2.41381C4.06665 2.61297 4.33668 2.725 4.61833 2.72533H8.38125C8.66293 2.725 8.93298 2.61298 9.13217 2.41382C9.33136 2.21467 9.44344 1.94464 9.44382 1.66296V1.20287H10.2143C10.5513 1.2033 10.8744 1.33738 11.1127 1.5757C11.3509 1.81402 11.485 2.13712 11.4854 2.47413V17.5258Z"
                  fill="#EFA144"
                />
                <path
                  d="M8.68891 17.1013H4.31152C4.21711 17.1013 4.12658 17.1388 4.05982 17.2056C3.99307 17.2723 3.95557 17.3629 3.95557 17.4573C3.95557 17.5517 3.99307 17.6422 4.05982 17.709C4.12658 17.7757 4.21711 17.8132 4.31152 17.8132H8.68891C8.78332 17.8132 8.87385 17.7757 8.94061 17.709C9.00736 17.6422 9.04486 17.5517 9.04486 17.4573C9.04486 17.3629 9.00736 17.2723 8.94061 17.2056C8.87385 17.1388 8.78332 17.1013 8.68891 17.1013Z"
                  fill="#EFA144"
                />
              </svg>
              {t('Panel.Carousel.CarouselTemplate.ToMobile')}
            </div>
            <div className="flex gap-s sm:flex-col sm:items-start text-BODY-XM font-Regular text-grey-700 w-full max-w-[500px] sm:max-w-full">
              <Button
                width={178}
                addIcon={<FiPlusCircle size="18" />}
                variant="primary"
                onClick={() => handleOpenFormCarousel('mobile')}
              >
                {t('Panel.Carousel.CarouselTemplate.AddImages')}
              </Button>
              <Textfield
                name="search-Mobile"
                placeholder={t('Panel.MyClients.searchPlaceholder')}
                icon={<FiSearch size={24} className="text-grey-600" />}
                onChange={handleSearchMobile}
                value={searchMobile}
              />
            </div>
          </div>
          <div className="mt-s">
            <TableCarousel
              setOpenRemoveCarouselDialog={setOpenRemoveCarouselDialog}
              setOpenUpdateCarouselDialog={setOpenUpdateCarouselDialog}
              setSelectedCarouselId={setSelectedCarouselId}
              data={carouselDataMobile}
              rowCount={rowCountMobile}
              setIsMobile={setIsMobile}
              isMobile={true}
              onPaginationChange={(pagination, sorting) =>
                loadCarousel(pagination, sorting, 2)
              }
              reloadData={loadMobileCarouselDebounce}
              initialSorting={currentSortingMobile}
              initialPagination={currentPaginationMobile}
            />
          </div>
        </ContentPage>
      </div>
      <Dialog
        position="aside"
        title={currentInfoByDevice.title}
        open={openFormCarousel}
        className="w-[531px]"
        onClose={handleCloseDesk}
      >
        <FormCarousel
          setOpenFormCarousel={setOpenFormCarousel}
          setOpenAddCarouselDialog={setOpenAddCarouselDialog}
          onClose={handleCloseDesk}
          devices={currentInfoByDevice.devices}
          maxSizes={currentInfoByDevice.maxSizes}
          refreshData={refreshData}
        />
      </Dialog>
      <Dialog
        position="aside"
        title={isMobile ? 'Editar imagem mobile' : 'Editar imagem desktop'}
        open={openUpdateCarouselDialog}
        onClose={handleDialogClose}
        className="w-[531px]"
      >
        <FormCarouselUpdate
          onClose={handleDialogClose}
          maxSizes={currentInfoByDevice.maxSizes}
          id={selectedCarouselId}
          refreshData={refreshData}
          setOpenFormCarousel={setOpenFormCarousel}
          setOpenAddCarouselDialog={setOpenUpdateCarouselDialog}
        />
      </Dialog>
      <Dialog
        title={t('Panel.Carousel.CarouselTemplate.deleteImageTitle')}
        open={openRemoveCarouselDialog}
        onClose={handleRemoveCarouselDialog}
        className="max-w-[328px]"
      >
        <div className="flex flex-col items-center justify-center gap-s mb-s mt-s">
          <FiAlertTriangle className="w-[64px] h-[64px] text-notify-alert-normal" />
          <p className="w-9/12 text-BODY-XM font-Regular text-grey-900 text-center">
            {t('Panel.Carousel.CarouselTemplate.deleteImage')}
          </p>
          <div className="flex justify-center items-center gap-s self-stretch mt-xs">
            <Button
              preIcon={<FiArrowLeft className="w-[16px] h-[16px]" />}
              variant="text"
              onClick={handleCloseRemoveCarouselDialog}
            >
              {t('Panel.Whitelist.FormWhitelist.buttonBack')}
            </Button>
            <Button
              variant="warning"
              onClick={() => {
                if (selectedCarouselId !== null) {
                  handleRemoveAgent(selectedCarouselId)
                }
              }}
              addIcon={<FiTrash2 size={16} className="text-grey-300" />}
            >
              <label className="text-grey-300">
                {t('Panel.Whitelist.warningButton')}
              </label>
            </Button>
          </div>
        </div>
      </Dialog>
    </PanelTemplate>
  )
}

export default CarouselTemplate
