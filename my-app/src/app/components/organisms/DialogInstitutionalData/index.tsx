import Button from '@/components/atoms/Button'
import Dialog from '@/components/molecules/Dialog'
import { useCustomerStore } from '@/stores/useCustomerStore'
import { useTranslations } from 'next-intl'
import { FiArrowLeft } from 'react-icons/fi'

interface DialogInstitutionalDataProps {
  isOpen: boolean
  onClose: () => void
}

const DialogInstitutionalData: React.FC<DialogInstitutionalDataProps> = ({
  isOpen,
  onClose,
}) => {
  const t = useTranslations('Home.institutionalData')
  const { customerData } = useCustomerStore()

  return (
    <Dialog
      title={t('title') + `${customerData?.name}`}
      open={isOpen}
      className="max-w-[620px]"
      onClose={onClose}
      isDarkMode
      removeHeaderPaddingX
      fixedOnBottomInPositionCenter
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
          Voltar
        </Button>
      }
    >
      <div className="max-h-[302px] text-BODY-XM text-grey-300">
        {/* topico 1 */}
        <div className="flex flex-col gap-s p-m">
          <p className="font-Bold text-grey-300">{t('Topic1')}</p>
          <p>{t('topic1Text1')}</p>
          <p>{t('topic1Text2')}</p>
          <p>
            {t('topic1Text3')}
            <span className="font-Bold text-fichasPay-main-400">
              {customerData?.name}
            </span>
            {t('topic1Text4')}
          </p>
        </div>
        {/* topico 2 */}
        <div className="flex flex-col gap-s p-m">
          <p className="font-Bold text-grey-300">{t('Topic2')}</p>
          <p>{t('topic2Text1')}</p>
          <ul>
            <li>{t('topic2Text2')}</li>
            <li>{t('topic2Text3')}</li>
            <li>{t('topic2Text4')}</li>
            <li>{t('topic2Text5')}</li>
            <li>{t('topic2Text6')}</li>
          </ul>
          <p>{t('topic2Text7')}</p>
        </div>
        {/* topico 3 */}
        <div className="flex flex-col gap-s p-m">
          <p className="font-Bold text-grey-300">{t('Topic3')}</p>
          <ul>
            <li className="mb-xs">{t('topic3Text1')}</li>
            <li className="mb-xs decoration-solid">{t('topic3Text2')}</li>
            <li className="mb-xs">{t('topic3Text3')}</li>
            <li className="mb-xs">{t('topic3Text4')}</li>
            <li>{t('topic3Text5')}</li>
          </ul>
        </div>
        {/* topico 4 */}
        <div className="flex flex-col gap-s p-m">
          <p className="font-Bold text-grey-300">{t('Topic4')}</p>
          <p>{t('topic4Text1')}</p>
        </div>
        {/* topico 5 */}
        <div className="flex flex-col gap-s p-m">
          <p className="font-Bold text-grey-300">{t('Topic5')}</p>
          <p>{t('topic5Text1')}</p>
        </div>
        {/* topico 6 */}
        <div className="flex flex-col gap-s p-m">
          <p className="font-Bold text-grey-300">{t('Topic6')}</p>
          <p>{t('topic6Text1')}</p>
        </div>
        {/* topico 7 */}
        <div className="flex flex-col gap-s p-m">
          <p className="font-Bold text-grey-300">{t('Topic7')}</p>
          <p>{t('topic7Text1')}</p>
          <p>{t('topic7Text2')}</p>
          <p>{t('topic7Text3')}</p>
          <p>{t('topic7Text4')}</p>
          <p>{t('topic7Text5')}</p>
          <p>{t('topic7Text6')}</p>
        </div>
        {/* topico 8 */}
        <div className="flex flex-col gap-s p-m">
          <p className="font-Bold text-grey-300">{t('Topic8')}</p>
          <p>{t('topic8Text1')}</p>
        </div>
        {/* topico 9 */}
        <div className="flex flex-col gap-s p-m">
          <p className="font-Bold text-grey-300">{t('Topic9')}</p>
          <p>{t('topic9Text1')}</p>
        </div>
        {/* topico Modificações */}
        <div className="flex flex-col gap-s p-m">
          <p className="font-Bold text-grey-300">{t('Topic10')}</p>
          <p>{t('topic10Text1')}</p>
        </div>
        {/* topico Lei aplicavel */}
        <div className="flex flex-col gap-s p-m">
          <p className="font-Bold text-grey-300">{t('Topic11')}</p>
          <p>{t('topic11Text1')}</p>
        </div>
        <div className="flex flex-col gap-s p-m">
          <hr className="text-grey-800 " />
          <p>{t('lastUpdated')}</p>
        </div>
      </div>
    </Dialog>
  )
}

export default DialogInstitutionalData
