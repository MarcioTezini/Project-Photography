import Button from '@/components/atoms/Button'
import Dialog from '@/components/molecules/Dialog'
import InfoBox from '@/components/molecules/InfoBox'
import { FiArrowLeft } from 'react-icons/fi'
import { useTranslations } from 'next-intl'
import { useCustomerStore } from '@/stores/useCustomerStore'

interface DialogDepositRulesProps {
  isOpen: boolean
  onClose: () => void
}

const DialogDepositRules: React.FC<DialogDepositRulesProps> = ({
  isOpen,
  onClose,
}) => {
  const t = useTranslations('Home.DepositDialog')
  const { customerData } = useCustomerStore()

  const text = (
    <span>
      {t('Text5')}
      <br />
      <br />
      {t.rich('Text5-1', {
        siteName: () => (
          <span className="text-fichasPay-main-400 font-Bold">
            {customerData?.name}
          </span>
        ),
      })}
    </span>
  )

  return (
    <Dialog
      title={t('Title')}
      open={isOpen}
      className="max-w-[620px]"
      onClose={onClose}
      isDarkMode
      fixedOnBottomInPositionCenter
      removeHeaderPaddingX
      maxWidthInSm
      footerContent={
        <Button
          isBrandButton
          size="lg"
          className="mx-auto"
          onClick={onClose}
          variant="text"
          type="button"
          preIcon={<FiArrowLeft width={20} height={20} />}
        >
          {t('Back')}
        </Button>
      }
    >
      <div className="max-h-[298px] flex flex-col mt-xm mb-m mx-m gap-s">
        <InfoBox title={t('Title1')} description={t('Text1')} />
        <InfoBox title={t('Title2')} description={t('Text2')} />
        <InfoBox title={t('Title3')} description={t('Text3')} />
        <InfoBox title={t('Title4')} description={t('Text4')} />
        <InfoBox title={t('Title5')} description={text} />
        <InfoBox title={t('Title6')} description={t('Text6')} />
        <InfoBox title={t('Title7')} description={t('Text7')} />
        <InfoBox title={t('Title8')} description={t('Text8')} />
        <InfoBox title={t('Title9')} description={t('Text9')} />
      </div>
    </Dialog>
  )
}

export default DialogDepositRules
