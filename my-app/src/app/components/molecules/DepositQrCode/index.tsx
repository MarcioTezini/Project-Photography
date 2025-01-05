import Textfield from '@/components/atoms/Textfield'
import { showToast } from '@/components/atoms/Toast'
import {
  DepositQrCodeResponseData,
  DepositStatusResponse,
  getDepositStatus,
} from '@/services/transactions/transactions'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import React, { useCallback, useEffect, useState } from 'react'
import { FiCopy } from 'react-icons/fi'
import { DepositQrCodeTimer } from '../DepositQrCodeTimer'
import useDepositDialogStore from '@/stores/DepositDialogStore'

interface IDepositQrCode {
  onCancel?: () => void
  qrCodeData: DepositQrCodeResponseData
  handleNextStep: () => void
}

export const DepositQrCode: React.FC<IDepositQrCode> = ({
  onCancel,
  qrCodeData,
  handleNextStep,
}) => {
  const t = useTranslations('Home.DepositQrCode')
  const {
    setDepositConfirmed,
    setDepositError,
    setQrCodeExpired,
    setErrorVariant,
  } = useDepositDialogStore()

  const [statusData, setStatusData] = useState<DepositStatusResponse>(
    {} as DepositStatusResponse,
  )
  const [counter, setCounter] = useState(0)

  const intervalTime = 10000
  const maxTime = 5 * 60
  const maxExecutions = maxTime / (intervalTime / 1000)

  const getStatusData = useCallback(async () => {
    const depositStatusResponse = await getDepositStatus(qrCodeData.id)
    const errorStatuses = [1, 3, 6, 7, 8, 9]

    if (errorStatuses.includes(depositStatusResponse.status)) {
      if (
        depositStatusResponse.status === 7 ||
        depositStatusResponse.status === 8
      ) {
        setErrorVariant(3)
      }
      setDepositError(true)
    } else if (depositStatusResponse.status === 2) {
      setDepositConfirmed(true)
      handleNextStep()
      onCancel?.()
    }
    setStatusData(depositStatusResponse)
  }, [
    qrCodeData.id,
    onCancel,
    setDepositError,
    setErrorVariant,
    setDepositConfirmed,
    handleNextStep,
  ])

  useEffect(() => {
    const verifyStatus = async () => {
      await getStatusData()
      setCounter((prevCounter) => prevCounter + 1)
    }
    const intervalId = setInterval(() => {
      if (counter < maxExecutions && statusData.status !== 2) {
        verifyStatus()
      } else {
        clearInterval(intervalId)
      }
    }, intervalTime)

    return () => clearInterval(intervalId)
  }, [counter, maxExecutions, statusData, getStatusData, onCancel])

  useEffect(() => {
    if (counter >= maxExecutions) {
      setQrCodeExpired(true)
    }
  }, [counter, maxExecutions, setQrCodeExpired])

  const handleCopy = () => {
    navigator.clipboard
      .writeText(qrCodeData.code)
      .then(() => {
        showToast('success', t('copySuccess'), 3000, 'bottom-left')
      })
      .catch(() => {
        showToast('error', t('copyError'), 3000, 'bottom-left')
      })
  }

  return (
    <div className="flex flex-col justify-center items-center gap-xs">
      <p className="text-grey-300 text-center text-LABEL-L font-Medium">
        {t('copyCode')}
      </p>
      <Textfield
        name="qr-code-value"
        placeholder={t('pixCodePlaceholder')}
        isDarkMode
        icon={
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              handleCopy()
            }}
          >
            <FiCopy size={24} className="text-grey-300" />
          </button>
        }
        value={qrCodeData.code}
        readOnly
      />
      <Image
        src={`data:image/png;base64,${qrCodeData.qrcode}`}
        alt="QR Code"
        width={186}
        height={186}
      />
      <div className="flex justify-center items-center gap-xxs">
        <span className="text-grey-300 text-center text-BODY-M font-Bold">
          {t('validFor')}
        </span>
        <DepositQrCodeTimer initialTime={300} />{' '}
      </div>
      <div className="flex justify-center items-start mt-xs">
        <Image src="/images/pix.svg" alt="Logo do Pix" width={92} height={32} />
      </div>
    </div>
  )
}
