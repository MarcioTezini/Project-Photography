'use client'

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  getSubscription,
  SubscriptionData,
} from '@/services/signature/signature'
import PanelTemplate from '../PanelTemplate'
import Button from '@/components/atoms/Button'
import Divider from '@/components/atoms/Divider'
import Textfield from '@/components/atoms/Textfield'
import Tag from '@/components/atoms/Tag'
import Selector from '@/components/atoms/Select'
import { FiAlertTriangle, FiArrowLeft, FiSettings } from 'react-icons/fi'
import { currencyWithPrefixMask } from '@/bosons/formatters/currencyWithPrefixFormatter'
import { phoneFormatter } from '@/bosons/formatters/phoneFormatter'
import { useDebounce } from '@/hooks/useDebounce'
import { useClientStore } from '@/stores/ClientStore'
import Dialog from '@/components/molecules/Dialog'
import { renewSubscription } from '@/services/customer/customer'
import { showToast } from '@/components/atoms/Toast'
import { useLocale, useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useMe } from '@/stores/Me'

const MediaQuery = dynamic(() => import('react-responsive'), {
  ssr: false,
})

const formatExpireDate = (dateString: string) => {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    hour12: false,
  }
  return (
    new Intl.DateTimeFormat('pt-BR', options).format(date).replace(',', '') +
    'hrs'
  )
}

function maskCpfCnpj(value: string): string {
  const cleanValue = value.replace(/\D/g, '')

  if (cleanValue.length <= 11) {
    return cleanValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  } else {
    return cleanValue
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
  }
}

export default function MySignatureTemplate() {
  const t = useTranslations('Panel.MySignature')
  const router = useRouter()
  const locale = useLocale()
  const { me } = useMe()

  const [signatureData, setSignatureData] = useState<SubscriptionData>()
  const [openDialog, setOpenDialog] = useState(false)

  const plans = me.plans.map((plan: { id: number; name: string }) => ({
    value: plan.id.toString(),
    label: plan.name,
  }))

  const { selectedClient } = useClientStore()

  const isFirstRender = useRef(true)

  const fetchSubscriptionData = async () => {
    try {
      const data = await getSubscription()
      if (data) {
        setSignatureData(data)
      } else {
        console.error(t('fetchSubscriptionError'))
      }
    } catch (error) {
      console.error(t('fetchSubscriptionErrorDetail'), error)
    }
  }

  const handleRedirect = () => {
    router.push(`/${locale}/painel/configs/my-wallet`)
  }

  const debouncedFetchSubscriptionData = useDebounce(
    fetchSubscriptionData,
    1000,
  )

  useEffect(() => {
    fetchSubscriptionData().then(() => {
      setTimeout(() => {
        isFirstRender.current = false
      }, 1000)
    })
  }, [])

  useEffect(() => {
    if (!isFirstRender.current) {
      debouncedFetchSubscriptionData()
    }
  }, [selectedClient])

  const selectedPlan = useMemo(() => {
    if (!signatureData?.plan?.id) return ''

    return (
      plans.find((option) => option.value === signatureData.plan.id.toString())
        ?.value || ''
    )
  }, [plans, signatureData])

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleRenewSubscription = async () => {
    try {
      await renewSubscription()
      await debouncedFetchSubscriptionData()
      handleCloseDialog()
      showToast('success', t('dataSavedSuccessfully'), 1000, 'bottom-left')
    } catch (error) {
      handleCloseDialog()
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

  return (
    <PanelTemplate
      title={t('title')}
      icon={<FiSettings className="h-m w-m" />}
      headerContent={<></>}
    >
      <Dialog
        title={t('renewSubscriptionDialogTitle')}
        open={openDialog}
        className="w-[400px]"
        onClose={handleCloseDialog}
      >
        <div className="flex flex-col items-center justify-center gap-s mb-xm pt-xm">
          <FiAlertTriangle className="w-[64px] h-[64px] text-notify-alert-normal" />
          <p className="text-BODY-XM font-Regular text-grey-900 text-center px-m">
            {t('renewSubscriptionDialogText')}
            <br />
            <span
              className="text-notify-info-normal text-BODY-XM font-Regular underline cursor-pointer"
              onClick={handleRedirect}
            >
              {t('myWalletMenu')}
            </span>
            .
          </p>
          <div className="flex px-s justify-center items-center gap-m self-stretch mt-s">
            <Button
              variant="text"
              size="lg"
              width={110}
              preIcon={<FiArrowLeft width={20} height={20} />}
              onClick={handleCloseDialog}
            >
              {t('backButtonText')}
            </Button>
            <Button
              variant="success"
              size="lg"
              width={110}
              onClick={handleRenewSubscription}
            >
              {t('renewButtonText')}
            </Button>
          </div>
        </div>
      </Dialog>
      <div className="flex py-xm px-s flex-col items-start gap-xm self-stretch rounded-sm bg-grey-300 shadow-DShadow-Special-X">
        <div className="flex justify-between items-center sm:items-start md:items-start self-stretch gap-m">
          <h1 className="text-grey-900 text-H6 font-Regular">
            {t('subscriptionDataTitle')}
          </h1>
          {signatureData?.plan?.name === 'Whitelabel' && (
            <Button
              variant="outline"
              onClick={() => setOpenDialog(true)}
              inputClassName="min-w-[150px] sm:min-w-[180px] [@media_(max-width:_390px)]:min-w-[150px]"
            >
              {t('renewSubscription')}
            </Button>
          )}
        </div>
        <Divider />
        <div className="flex flex-col items-start gap-xm self-stretch">
          <div className="flex flex-col items-start gap-xs self-stretch">
            <div className="flex items-center gap-xs self-stretch">
              <label className="text-grey-500 text-BODY-S font-Regular">
                {t('dataTitle')}
              </label>
              <Divider />
            </div>
            <div className="flex flex-col items-start gap-xs self-stretch">
              <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-1 items-start self-stretch gap-xs">
                <Textfield
                  name="cliente"
                  placeholder={t('clientNamePlaceholder')}
                  value={signatureData?.name || ''}
                  disabled
                />
                <Textfield
                  name="name"
                  placeholder={t('namePlaceholder')}
                  value={signatureData?.nameCorp || ''}
                  disabled
                />
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-1 items-start self-stretch gap-xs">
                <Textfield
                  name="document"
                  placeholder={t('documentPlaceholder')}
                  value={
                    signatureData?.document
                      ? maskCpfCnpj(signatureData.document)
                      : ''
                  }
                  disabled
                />
                <Textfield
                  name="email"
                  placeholder={t('emailPlaceholder')}
                  value={signatureData?.email || ''}
                  disabled
                />
                <Textfield
                  name="telefone"
                  placeholder={t('phonePlaceholder')}
                  value={
                    signatureData?.document
                      ? phoneFormatter.mask(signatureData?.phone)
                      : ''
                  }
                  disabled
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-xs self-stretch">
            <div className="flex items-center gap-xs self-stretch">
              <label className="text-grey-500 text-BODY-S font-Regular">
                {t('addressTitle')}
              </label>
              <Divider />
            </div>
            <div className="flex flex-col items-start gap-xs self-stretch">
              <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-1 items-start self-stretch gap-xs">
                <Textfield
                  name="endereço"
                  placeholder={t('addressPlaceholder')}
                  value={signatureData?.address || ''}
                  disabled
                />
                <Textfield
                  name="numero"
                  placeholder={t('numberPlaceholder')}
                  value={signatureData?.number || ''}
                  disabled
                />
                <Textfield
                  name="complemento"
                  placeholder={t('complementPlaceholder')}
                  value={signatureData?.neighborhood || ''}
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-1 md:grid-cols-1 items-start self-stretch gap-xs">
                <Textfield
                  name="cep"
                  placeholder={t('zipcodePlaceholder')}
                  value={signatureData?.zipcode || ''}
                  disabled
                />
                <Textfield
                  name="bairro"
                  placeholder={t('neighborhoodPlaceholder')}
                  value={signatureData?.neighborhood || ''}
                  disabled
                />
                <MediaQuery minWidth={680}>
                  <Textfield
                    name="cidade"
                    placeholder={t('cityPlaceholder')}
                    value={signatureData?.city || ''}
                    disabled
                  />
                  <Textfield
                    name="estado"
                    placeholder={t('statePlaceholder')}
                    value={signatureData?.country || ''}
                    disabled
                  />
                </MediaQuery>
                <MediaQuery maxWidth={679}>
                  <div className="grid sm:grid-flow-col sm:gap-xs">
                    <Textfield
                      name="cidade"
                      placeholder={t('cityPlaceholder')}
                      value={signatureData?.city || ''}
                      disabled
                    />
                    <Textfield
                      name="estado"
                      placeholder={t('statePlaceholder')}
                      value={signatureData?.country || ''}
                      disabled
                    />
                  </div>
                </MediaQuery>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-xs self-stretch">
            <div className="flex items-center gap-xs self-stretch">
              <label className="text-grey-500 text-BODY-S font-Regular">
                {t('subscriptionTitle')}
              </label>
              <Divider />
            </div>
            <div className="flex flex-col items-start gap-xs self-stretch">
              <div className="grid grid-cols-4 sm:grid-cols-1 md:grid-cols-1 items-center self-stretch gap-xs">
                <Selector
                  disabled
                  placeholder={t('planPlaceholder')}
                  options={plans}
                  value={selectedPlan}
                  onChange={() => null}
                />
                <Textfield
                  name="valor"
                  placeholder={t('valuePlaceholder')}
                  value={
                    currencyWithPrefixMask(
                      signatureData?.plan?.value.toString() as string,
                      true,
                    ) || ''
                  }
                  disabled
                />
                <Textfield
                  name="vencimento"
                  placeholder={t('expireDatePlaceholder')}
                  value={
                    signatureData?.expiredate
                      ? formatExpireDate(signatureData.expiredate)
                      : ''
                  }
                  disabled
                />
                <div className="p-xs items-center gap-xxs flex-1">
                  <div className="flex flex-col items-start gap-xxxs flex-1">
                    {signatureData && (
                      <>
                        <span className="flex h-[10px] flex-col justify-center self-stretch text-grey-700 text-LABEL-M font-Semibold">
                          {t('statusLabel')}
                        </span>
                        <Tag
                          variant={
                            signatureData?.status === 1 ? 'success' : 'warning'
                          }
                        >
                          {signatureData?.status === 1
                            ? t('statusActive')
                            : t('statusInactive')}
                        </Tag>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PanelTemplate>
  )
}
