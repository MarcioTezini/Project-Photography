import Button from '@/components/atoms/Button'
import Dialog from '@/components/molecules/Dialog'
import InfoBox from '@/components/molecules/InfoBox'
import { FiArrowLeft } from 'react-icons/fi'
import Divider from '@/components/atoms/Divider'
import { useTranslations } from 'next-intl'

interface TextSectionProps {
  children: React.ReactNode
  isTitle?: boolean
  isBold?: boolean
  className?: string
}

const TextSection: React.FC<TextSectionProps> = ({
  children,
  isTitle = false,
  isBold = false,
  className = '',
}) => {
  const baseClass = 'text-grey-300 text-BODY-XM font-Regular'
  const titleClass = isTitle ? 'font-Semibold' : ''
  const boldClass = isBold ? 'font-Bold' : ''
  return (
    <p className={`${baseClass} ${titleClass} ${boldClass} ${className}`}>
      {children}
    </p>
  )
}

interface LinkProps {
  href: string
  children: React.ReactNode
}

const Link: React.FC<LinkProps> = ({ href, children }) => (
  <a
    className="text-grey-300 text-BODY-XM font-Regular underline"
    href={href}
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
  </a>
)

interface DialogCookiesRulesProps {
  isOpen: boolean
  onClose: () => void
}

const DialogCookiesRules: React.FC<DialogCookiesRulesProps> = ({
  isOpen,
  onClose,
}) => {
  const t = useTranslations('Home.DialogCookiesRules')

  const renderTokenList = (tokens: string[], decimal: boolean) => (
    <ul className={`${decimal ? 'list-decimal' : 'list-disc'} ml-s`}>
      {tokens.map((token) => (
        <li key={token} className="text-grey-300 text-BODY-XM font-Regular">
          {t(token)}
        </li>
      ))}
    </ul>
  )

  const renderDefinitionSection = (titleKey: string, definitionKey: string) => (
    <>
      <h1 className="text-grey-300 text-BODY-XM font-Semibold">
        {t(titleKey)}
      </h1>
      <TextSection>{t(definitionKey)}</TextSection>
    </>
  )

  return (
    <Dialog
      title={t('title')}
      open={isOpen}
      className="max-w-[620px] z-[700]"
      onClose={onClose}
      isDarkMode
      removeHeaderPaddingX
      maxWidthInSm
      fixedOnBottomInPositionCenter
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
          {t('backButton')}
        </Button>
      }
    >
      <div className="max-h-[440px] flex flex-col pt-xm pb-m px-m gap-s">
        <TextSection>{t('infoText1')}</TextSection>
        <TextSection>{t('infoText2')}</TextSection>
        <TextSection>{t('infoText3')}</TextSection>
        <TextSection>{t('infoText4')}</TextSection>
        <TextSection>{t('infoText5')}</TextSection>
        <TextSection isTitle>{t('titleActivities')}</TextSection>
        <TextSection>{t('infoText6')}</TextSection>

        <div className="flex flex-col gap-xs">
          <h1 className="text-grey-300 text-BODY-XM font-Bold">
            {t('ownTrackersTitle')}
          </h1>
          <InfoBox
            hasAccordion
            title={t('registrationTitle')}
            description={
              <div className="flex flex-col gap-s">
                <TextSection>{t('registrationDescription1')}</TextSection>
                <h1 className="text-grey-300 text-BODY-XM font-Semibold">
                  {t('directRegistrationTitle')}
                </h1>
                <TextSection>{t('directRegistrationDescription')}</TextSection>
                <TextSection>{t('personalDataProcessed')}</TextSection>
                <TextSection>{t('extraPersonalDataProcessed')}</TextSection>
              </div>
            }
          />
        </div>

        <div className="flex flex-col gap-xs">
          <h1 className="text-grey-300 text-BODY-XM font-Bold">
            {t('thirdPartyTrackersTitle')}
          </h1>
          <InfoBox
            hasAccordion
            title={t('trafficOptimizationTitle')}
            description={
              <div className="flex flex-col gap-s">
                <TextSection>{t('trafficOptimizationDescription')}</TextSection>
                <h1 className="text-grey-300 text-BODY-XM font-Semibold">
                  {t('cloudflareTitle')}
                </h1>
                <TextSection>{t('cloudflareDescription')}</TextSection>
                <TextSection>{t('dataProcessed')}</TextSection>
                <TextSection>
                  {t('dataProcessingLocation')}{' '}
                  <Link href="https://www.cloudflare.com/pt-br/privacypolicy/">
                    {t('privacyPolicyLink')}.
                  </Link>
                </TextSection>
              </div>
            }
          />
          <InfoBox
            hasAccordion
            title={t('tagManagementTitle')}
            description={
              <div className="flex flex-col gap-s">
                <TextSection>{t('tagManagementDescription')}</TextSection>
                <h1 className="text-grey-300 text-BODY-XM font-Semibold">
                  {t('googleTagManagerTitle')}
                </h1>
                <TextSection>{t('googleTagManagerDescription')}</TextSection>
                <TextSection>{t('googleTagManagerDataProcessed')}</TextSection>
                <TextSection>
                  {t('dataProcessingLocation')}{' '}
                  <Link href="https://policies.google.com/privacy">
                    {t('privacyPolicyLink')}.
                  </Link>
                </TextSection>
              </div>
            }
          />
        </div>

        <div className="flex flex-col gap-s">
          <h1 className="text-grey-300 text-BODY-XM font-Bold">
            {t('otherActivitiesTitle')}
          </h1>
          <h1 className="text-grey-300 text-BODY-XM font-Semibold">
            {t('basicInteractionsTitle')}
          </h1>
          <TextSection>{t('basicInteractionsDescription')}</TextSection>
        </div>

        <InfoBox
          hasAccordion
          title={t('contactUserTitle')}
          description={
            <div className="flex flex-col gap-s">
              <h1 className="text-grey-300 text-BODY-XM font-Semibold">
                {t('contactFormTitle')}
              </h1>
              <TextSection>{t('contactFormDescription')}</TextSection>
              <TextSection>{t('personalDataContactForm')}</TextSection>
            </div>
          }
        />

        <div className="flex flex-col gap-s">
          <h1 className="text-grey-300 text-BODY-XM font-Semibold">
            {t('optimizeExperienceTitle')}
          </h1>
          <TextSection>{t('optimizeExperienceDescription')}</TextSection>
        </div>

        <InfoBox
          hasAccordion
          title={t('viewExternalContentTitle')}
          description={
            <div className="flex flex-col gap-s">
              <TextSection>{t('viewExternalContentDescription')}</TextSection>
              <TextSection>{t('viewExternalContentDescription2')}</TextSection>
              <h1 className="text-grey-300 text-BODY-XM font-Semibold">
                {t('googleFontsTitle')}
              </h1>
              <TextSection>{t('googleFontsDescription')}</TextSection>
              <TextSection>{t('googleFontsDataProcessed')}</TextSection>
              <TextSection>
                {t('dataProcessingLocation')}{' '}
                <Link href="https://policies.google.com/privacy">
                  {t('privacyPolicyLink')}.
                </Link>
              </TextSection>
              <h1 className="text-grey-300 text-BODY-XM font-Semibold">
                {t('googleMapsTitle')}
              </h1>
              <TextSection>{t('googleMapsDescription')}</TextSection>
              <TextSection>{t('googleMapsDataProcessed')}</TextSection>
              <TextSection>
                {t('dataProcessingLocation')}{' '}
                <Link href="https://policies.google.com/privacy">
                  {t('privacyPolicyLink')}.
                </Link>
              </TextSection>
            </div>
          }
        />

        <div className="flex flex-col gap-s">
          <h1 className="text-grey-300 text-BODY-XM font-Semibold">
            {t('measurementTitle')}
          </h1>
          <TextSection>{t('measurementDescription')}</TextSection>
        </div>

        <InfoBox
          hasAccordion
          title={t('statisticsTitle')}
          description={
            <div className="flex flex-col gap-s">
              <TextSection>{t('statisticsDescription')}</TextSection>
              <h1 className="text-grey-300 text-BODY-XM font-Semibold">
                {t('googleAnalyticsTitle')}
              </h1>
              <TextSection>
                {t('googleAnalyticsDescription')}
                <br />
                {t('googleAnalyticsDescription2')}
              </TextSection>
              <TextSection>{t('googleAnalyticsDataProcessed')}</TextSection>
              <TextSection>
                {t('dataProcessingLocation')}{' '}
                <Link href="https://policies.google.com/privacy">
                  {t('privacyPolicyLink')}
                </Link>
                {' - '}
                <Link href="https://tools.google.com/dlpage/gaoptout?hl=en">
                  {t('OptOut')}
                </Link>
              </TextSection>
              <TextSection>{t('analyticsStorageDuration')}</TextSection>
              {renderTokenList(
                ['ampToken', 'gaToken', 'gacToken', 'gatToken', 'gidToken'],
                true,
              )}
            </div>
          }
        />

        <InfoBox
          hasAccordion
          title={t('heatmapTitle')}
          description={
            <div className="flex flex-col gap-s">
              <TextSection>{t('heatmapDescription')}</TextSection>
              <TextSection>{t('heatmapDescription2')}</TextSection>
              <h1 className="text-grey-300 text-BODY-XM font-Semibold">
                {t('microsoftClarityTitle')}
              </h1>
              <TextSection>{t('microsoftClarityDescription')}</TextSection>
              <TextSection>{t('microsoftClarityDescription2')}</TextSection>
              <TextSection>{t('microsoftClarityDescription3')}</TextSection>
              <TextSection>
                {t('dataProcessingLocation')}{' '}
                <Link href="https://www.microsoft.com/en-us/privacy/privacystatement">
                  {t('privacyPolicyLink')};
                </Link>
                {' Brasil - '}
                <Link href="https://www.microsoft.com/pt-br/privacy/privacystatement">
                  {t('privacyPolicyLink')}.
                </Link>
              </TextSection>
              <TextSection>{t('analyticsStorageDuration')}</TextSection>
              {renderTokenList(
                [
                  'anonchkToken',
                  'clidToken',
                  'mrToken',
                  'muidToken',
                  'smToken',
                  'clckToken',
                  'clskToken',
                ],
                true,
              )}
            </div>
          }
        />

        <InfoBox
          hasAccordion
          title={t('anonymousStatsTitle')}
          description={
            <div className="flex flex-col gap-s">
              <TextSection>{t('anonymousStatsDescription')}</TextSection>
              <h1 className="text-grey-300 text-BODY-XM font-Semibold">
                {t('googleAnalyticsAnonTitle')}
              </h1>
              <TextSection>
                {t('googleAnalyticsAnonDescription')}
                <br />
                {t('googleAnalyticsAnonDescription2')}
              </TextSection>
              <TextSection>{t('googleAnalyticsAnonDescription3')}</TextSection>
              <TextSection>{t('googleAnalyticsDataProcessed')}</TextSection>
              <TextSection>
                {t('dataProcessingLocation')}{' '}
                <Link href="https://policies.google.com/privacy">
                  {t('privacyPolicyLink')}
                </Link>
                {' - '}
                <Link href="https://tools.google.com/dlpage/gaoptout?hl=en">
                  {t('OptOut')}
                </Link>
              </TextSection>
              <TextSection>{t('analyticsStorageDuration')}</TextSection>
              {renderTokenList(
                ['ampToken', 'gaToken', 'gacToken', 'gatToken', 'gidToken'],
                true,
              )}
            </div>
          }
        />

        <div className="flex flex-col gap-s">
          <h1 className="text-grey-300 text-BODY-XM font-Bold">
            {t('managePreferencesTitle')}
          </h1>
          <TextSection>{t('managePreferencesDescription1')}</TextSection>
          <TextSection>{t('managePreferencesDescription2')}</TextSection>
          <TextSection>{t('managePreferencesDescription3')}</TextSection>
          <TextSection>{t('managePreferencesDescription4')}</TextSection>
          <TextSection>{t('managePreferencesDescription5')}</TextSection>
          <TextSection>{t('managePreferencesDescription6')}</TextSection>
          <h1 className="text-grey-300 text-BODY-XM font-Bold">
            {t('locationTrackerSettingsTitle')}
          </h1>
          <TextSection>{t('locationTrackerSettingsDescription')}</TextSection>
          {renderTokenList(
            [
              'googleChrome',
              'mozillaFirefox',
              'appleSafari',
              'microsoftIE',
              'microsoftEdge',
              'brave',
              'opera',
            ],
            false,
          )}
          <TextSection>{t('mobileAppSettingsDescription')}</TextSection>
          <h1 className="text-grey-300 text-BODY-XM font-Bold">
            {t('consequencesOfDenyingTitle')}
          </h1>
          <TextSection>{t('consequencesOfDenyingDescription')}</TextSection>
          <TextSection>{t('trackerComplexityDescription')}</TextSection>
          <TextSection>{t('contactOwnerDescription')}</TextSection>
          <Divider className="bg-grey-800" />
        </div>
        <InfoBox
          hasAccordion
          title={t('definitionsAndLegalRefsTitle')}
          description={
            <div className="flex flex-col gap-s">
              {renderDefinitionSection(
                'personalDataTitle',
                'personalDataDefinition',
              )}
              {renderDefinitionSection('usageDataTitle', 'usageDataDefinition')}
              {renderDefinitionSection('userTitle', 'userDefinition')}
              {renderDefinitionSection(
                'dataSubjectTitle',
                'dataSubjectDefinition',
              )}
              {renderDefinitionSection(
                'dataProcessorTitle',
                'dataProcessorDefinition',
              )}
              {renderDefinitionSection(
                'dataControllerTitle',
                'dataControllerDefinition',
              )}
              {renderDefinitionSection('thisAppTitle', 'thisAppDefinition')}
              {renderDefinitionSection('serviceTitle', 'serviceDefinition')}
              {renderDefinitionSection('euTitle', 'euDefinition')}
              {renderDefinitionSection('cookieTitle', 'cookieDefinition')}
              {renderDefinitionSection('trackerTitle', 'trackerDefinition')}
              {renderDefinitionSection(
                'legalInfoTitle',
                'legalInfoDescription',
              )}
            </div>
          }
        />
        <div>
          <Divider className="bg-grey-800" />
        </div>
        <TextSection>{t('lastUpdated')}</TextSection>
      </div>
    </Dialog>
  )
}

export default DialogCookiesRules
