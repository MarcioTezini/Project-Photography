'use client'

import Button from '@/components/atoms/Button'
import Tag from '@/components/atoms/Tag'
import { showToast } from '@/components/atoms/Toast'
import Dialog from '@/components/molecules/Dialog'
import PDFViewer from '@/components/molecules/PDFViewer'
import { signTerm } from '@/services/term/term'
import { useMe } from '@/stores/Me'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function DialogMembershipContract() {
  const [isLastPage, setIsLastPage] = useState(false)
  const [isOpen, setIsOpen] = useState(true)
  const { me } = useMe()
  const t = useTranslations('Panel.DialogMembershipContract')

  const pdfFile = '/documents/FichasPay_Contrato_Adesao.pdf'

  const handleLastPage = (currentPage: number, numberOfPages: number) => {
    if (currentPage === numberOfPages) {
      setIsLastPage(true)
    } else {
      setIsLastPage(false)
    }
  }

  const handleSignTerm = async () => {
    try {
      await signTerm()
      setIsOpen(false)
      showToast('success', t('successMessage'), 5000, 'bottom-left')
    } catch (error) {
      showToast('error', t('toastError'), 5000, 'bottom-left')
    }
  }

  const today = new Date().toLocaleDateString('pt-BR') // Formato: dd/mm/aaaa

  return (
    <Dialog
      position="aside"
      title={t('title')}
      open={isOpen}
      className="w-[531px]"
      onClose={() => null}
      headerContent={
        <div className="flex px-m py-s items-start self-stretch border-b border-solid border-grey-500 gap-s">
          <div className="flex flex-col justify-center items-start gap-xs">
            <p className="text-grey-900 self-stretch text-BODY-M font-Bold">
              {t('title')}
            </p>
            <span className="text-grey-900 text-BODY-XM font-Medium">
              {today}
            </span>
          </div>
          <Tag variant="warning">{t('mandatoryTag')}</Tag>
        </div>
      }
      hideCloseButton
    >
      <div className="pt-xm">
        <div className="flex flex-col h-[calc(100vh-300px)] sm:h-[calc(100vh-400px)]">
          <PDFViewer fileSrc={pdfFile} onPageChange={handleLastPage} />
        </div>
      </div>
      <div className="flex px-m py-s items-start self-stretch border-t border-solid border-grey-500 mt-xm">
        <div className="flex justify-between items-center gap-s w-full">
          <p className="text-grey-900 text-BODY-M font-Medium">
            {t('acceptTermsText')}{' '}
            <span className="text-grey-900 text-BODY-M font-Bold">
              {me?.user?.name}
            </span>
            , {t('acceptTermsSuffix')}
          </p>
          <Button disabled={!isLastPage} size="lg" onClick={handleSignTerm}>
            {t('buttonAccept')}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
