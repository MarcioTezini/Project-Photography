import Button from '@/components/atoms/Button'
import Dialog from '@/components/molecules/Dialog'
import InfoBox from '@/components/molecules/InfoBox'
import { FiArrowLeft } from 'react-icons/fi'
import info from './info'
import { useTranslations } from 'next-intl'
import { Children } from 'react'

interface DialogWithdrawalRulesProps {
  isOpen: boolean
  onClose: () => void
}

const DialogWithdrawalRules: React.FC<DialogWithdrawalRulesProps> = ({
  isOpen,
  onClose,
}) => {
  const t = useTranslations()
  const { generateWithdrawalRulesSections } = info
  const withdrawalRulesSections = generateWithdrawalRulesSections(t)

  return (
    <Dialog
      title={t('Home.WithdrawalRules.title')}
      open={isOpen}
      className="max-w-[620px]"
      onClose={onClose}
      fixedOnBottomInPositionCenter
      removeHeaderPaddingX
      maxWidthInSm
      isDarkMode
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
          Voltar
        </Button>
      }
    >
      <div className="max-h-[300px] mt-xm">
        {Children.toArray(
          withdrawalRulesSections.map((section) => (
            <div className="pb-s mx-s">
              <InfoBox
                title={section.title}
                description={section.description}
              />
            </div>
          )),
        )}
      </div>
    </Dialog>
  )
}

export default DialogWithdrawalRules
