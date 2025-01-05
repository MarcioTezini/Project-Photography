import Button from '@/components/atoms/Button'
import Textfield from '@/components/atoms/Textfield'
import { showToast } from '@/components/atoms/Toast'
import { Timer } from '@/components/molecules/Timer'
import { IDepositStatus } from '@/entities/deposit'
import depositService from '@/services/deposit/deposit'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import React, { useCallback, useEffect, useState } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { IoMdCopy } from 'react-icons/io'
import { PiClockCountdownFill } from 'react-icons/pi'

interface IQrCode {
  onCancel?: () => void
  qrCodeData: {
    id: string
    code: string
    qrcode: string
  }
}

export const QrCode: React.FC<IQrCode> = ({ onCancel, qrCodeData }) => {
  const t = useTranslations()

  const [statusData, setStatusData] = useState<IDepositStatus>(
    {} as IDepositStatus,
  )
  const [counter, setCounter] = useState(0)

  const intervalTime = 10000
  const maxTime = 5 * 60
  const maxExecutions = maxTime / (intervalTime / 1000)

  const getStatusData = useCallback(async () => {
    const depositStatusResponse = await depositService.getStatus({
      id: qrCodeData.id,
    })
    if (depositStatusResponse.data.statusCode === 2) {
      onCancel?.()
      showToast(
        'success',
        t('Panel.MyWallet.deposit.successes.depositSuccessMessage'),
        5000,
        'bottom-left',
      )
    }
    setStatusData(depositStatusResponse.data)
  }, [qrCodeData.id, onCancel, t])

  useEffect(() => {
    const verifyStatus = async () => {
      await getStatusData()
      setCounter((prevCounter) => prevCounter + 1)
    }
    const intervalId = setInterval(() => {
      if (counter < maxExecutions && statusData.statusCode !== 2) {
        verifyStatus()
      } else {
        clearInterval(intervalId)
      }
    }, intervalTime)

    return () => clearInterval(intervalId)
  }, [counter, maxExecutions, statusData, getStatusData, onCancel])

  const handleCopy = () => {
    navigator.clipboard
      .writeText(qrCodeData.code)
      .then(() => {
        showToast('success', 'Código copiado com sucesso!', 3000, 'bottom-left')
      })
      .catch(() => {
        showToast('error', t('Falha ao copiar o código'), 3000, 'bottom-left')
      })
  }

  return (
    <div className="flex flex-col items-center w-full max-w-[328px] mx-auto mt-xm">
      <div className="w-full flex items-center gap-xs">
        <span className="w-full max-w-fit text-BODY-S font-Regular text-grey-500">
          {t('Panel.MyWallet.deposit.qrCode.title')}
        </span>
        <hr className="mt-1 border-t-1 border-grey-500 w-full" />
      </div>

      <div className="mt-s">
        <div className="flex align-middle justify-center border border-solid border-grey-900 rounded-xxs w-[150px] h-[150px]">
          <Image
            src={`data:image/png;base64,${qrCodeData.qrcode}`}
            alt="QR Code"
            width={135}
            height={135}
          />
        </div>
        <div className="flex items-center justify-center gap-xxs mt-xs">
          <PiClockCountdownFill />
          <Timer initialTime={maxTime} />
        </div>
      </div>
      <div className="text-BODY-S font-Regular text-grey-800 mt-s text-center">
        <span>
          <strong>{t('Panel.MyWallet.deposit.qrCode.copyAndPaste')}</strong>{' '}
          {t('Panel.MyWallet.deposit.qrCode.useCode')}
        </span>
      </div>
      <div className="w-full max-w-[280px] mt-xs">
        <Textfield
          name="qr-code-value"
          placeholder={'Código Pix'}
          icon={
            <button onClick={handleCopy}>
              <IoMdCopy size={24} className="text-fichasPay-main-400" />
            </button>
          }
          value={qrCodeData.code}
          readOnly
        />
      </div>
      <div className="flex items-center gap-s justify-center mt-m">
        <Button
          variant="text"
          type="button"
          size="lg"
          onClick={onCancel}
          preIcon={<FiArrowLeft width={20} height={20} />}
        >
          {t('Panel.MyWallet.deposit.back')}
        </Button>
      </div>
    </div>
  )
}
