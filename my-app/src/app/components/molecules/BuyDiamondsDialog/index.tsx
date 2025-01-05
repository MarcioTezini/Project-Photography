import Button from '@/components/atoms/Button'
import { FiArrowLeft } from 'react-icons/fi'
import Dialog from '../Dialog'
import Image from 'next/image'
import buyDiamondsImage from '../../../../public/images/buyDiamondsDialogImage.svg'
import { useBuyDiamondsDialogStore } from '@/stores/BuyDiamondsDialogStore'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function BuyDiamondsDialog() {
  const { open, handleClose } = useBuyDiamondsDialogStore()
  const t = useTranslations('Home.BuyDiamondsDialog')

  return (
    <Dialog
      title={t('title')}
      open={open}
      className="w-[400px]"
      onClose={handleClose}
      fixedOnBottomInPositionCenter
      maxWidthInSm
      isDarkMode
    >
      <div className="flex flex-col items-center pt-xm px-s pb-m gap-s self-stretch">
        <Image src={buyDiamondsImage} width={150} height={123} alt="" />
        <p className="text-grey-300 text-center text-BODY-XM font-Bold">
          {t('description')}{' '}
          <span className="text-fichasPay-main-400 text-center text-BODY-XM font-Bold">
            {t('highlight')}
          </span>
        </p>
        <p className="text-grey-300 text-center text-BODY-XM font-Regular">
          <span className="text-grey-300 text-center text-BODY-XM font-Bold">
            {t('attention')}:
          </span>{' '}
          {t('warning')}
        </p>
        <p className="text-grey-300 text-center text-BODY-XM font-Bold">
          {t('proceed')}
        </p>
        <div className="flex px-s justify-center items-center gap-s">
          <Button
            isBrandButton
            size="lg"
            preIcon={<FiArrowLeft width={20} height={20} />}
            variant="text"
            width={120}
            onClick={handleClose}
          >
            {t('back')}
          </Button>
          <Link
            href="https://pokerbyte.com.br/Revenda"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" isBrandButton width={160} onClick={handleClose}>
              {t('next')}
            </Button>
          </Link>
        </div>
      </div>
    </Dialog>
  )
}
