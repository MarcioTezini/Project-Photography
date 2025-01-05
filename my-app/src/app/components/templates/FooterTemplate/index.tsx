'use client'

import React from 'react'
import { FiHome } from 'react-icons/fi'
import PanelTemplate from '../PanelTemplate'
import { useTranslations } from 'next-intl'
import { ContentPage } from '@/components/molecules/ContentPage'
import SocialLinksForm from '@/components/organisms/FormFooter'

const FooterTemplate = () => {
  const t = useTranslations()

  return (
    <PanelTemplate
      title={t('Panel.Footer.titlePanel')}
      icon={<FiHome className="h-m w-m" />}
    >
      <div className="pb-xxxm">
        <ContentPage pageName={t('Panel.Footer.titlePage')}>
          <div>
            <SocialLinksForm />
          </div>
        </ContentPage>
      </div>
    </PanelTemplate>
  )
}

export default FooterTemplate
