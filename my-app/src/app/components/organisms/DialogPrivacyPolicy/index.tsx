import Button from '@/components/atoms/Button'
import Dialog from '@/components/molecules/Dialog'
import InfoBox from '@/components/molecules/InfoBox'
import { FiArrowLeft } from 'react-icons/fi'
import Divider from '@/components/atoms/Divider'
import { useTranslations } from 'next-intl'
import { useCustomerStore } from '@/stores/useCustomerStore'

interface TextSectionPrivacyProps {
  children: React.ReactNode
  isTitle?: boolean
  isBold?: boolean
  className?: string
}

const TextSectionPrivacy: React.FC<TextSectionPrivacyProps> = ({
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

interface DialogPrivacyPolicyProps {
  isOpen: boolean
  onClose: () => void
}

const DialogPrivacyPolicy: React.FC<DialogPrivacyPolicyProps> = ({
  isOpen,
  onClose,
}) => {
  const t = useTranslations('Home.DialogPrivacyPolicy')
  const { customerData } = useCustomerStore()

  const renderTokenList = (
    tokens: (string | { [bold: string]: string })[],
    decimal: boolean,
    withBold?: boolean,
  ) => (
    <ul className={`${decimal ? 'list-decimal' : 'list-disc'} ml-s`}>
      {tokens.map((token, index) => {
        if (typeof token === 'string') {
          return (
            <li key={token} className="text-grey-300 text-BODY-XM font-Regular">
              {t(token)}
            </li>
          )
        }
        if (withBold && typeof token === 'object') {
          const [boldText, normalText] = Object.entries(token)[0]
          return (
            <li key={index} className="text-grey-300 text-BODY-XM font-Regular">
              <span className="font-Semibold">{t(boldText)}</span>{' '}
              {t(normalText)}
            </li>
          )
        }
        return null
      })}
    </ul>
  )

  return (
    <Dialog
      title={t('title')}
      open={isOpen}
      className="max-w-[620px]"
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
        <TextSectionPrivacy>{t('infoText1')}</TextSectionPrivacy>
        <TextSectionPrivacy>{t('infoText2')}</TextSectionPrivacy>
        <div>
          <Divider className="bg-grey-800" />
        </div>
        <p className="text-grey-300 font-Bold text-BODY-XM">
          {t('infoText3')}{' '}
          <span className="text-fichasPay-main-400">{customerData?.name}</span>
        </p>
        {customerData?.configs.footer.email && (
          <p className="text-grey-300 font-Bold text-BODY-XM">
            {t('infoText4')}{' '}
            <span className="text-fichasPay-main-400">
              {customerData?.configs.footer.email}
            </span>
          </p>
        )}
        <div>
          <Divider className="bg-grey-800" />
        </div>
        <TextSectionPrivacy isTitle>{t('titleActivities')}</TextSectionPrivacy>
        <TextSectionPrivacy>{t('infoText5')}</TextSectionPrivacy>
        <TextSectionPrivacy>{t('infoText6')}</TextSectionPrivacy>
        <TextSectionPrivacy>{t('infoText7')}</TextSectionPrivacy>
        <TextSectionPrivacy>{t('infoText8')}</TextSectionPrivacy>
        <TextSectionPrivacy>{t('infoText9')}</TextSectionPrivacy>
        <TextSectionPrivacy>{t('infoText10')}</TextSectionPrivacy>
        <TextSectionPrivacy>{t('infoText11')}</TextSectionPrivacy>
        <div>
          <Divider className="bg-grey-800" />
        </div>

        <div className="flex flex-col gap-xs">
          <TextSectionPrivacy isTitle>
            {t('titleDataProcessing')}
          </TextSectionPrivacy>
          <TextSectionPrivacy isTitle>
            {t('subTitleDataProcessing')}
          </TextSectionPrivacy>
          <TextSectionPrivacy>{t('infoText12')}</TextSectionPrivacy>
          <TextSectionPrivacy isTitle>
            {t('subTitleLocation')}
          </TextSectionPrivacy>
          <TextSectionPrivacy>{t('infoText13')}</TextSectionPrivacy>
          <TextSectionPrivacy isTitle>
            {t('subTitleConservationPeriod')}
          </TextSectionPrivacy>
          <TextSectionPrivacy>{t('infoText14')}</TextSectionPrivacy>
        </div>
        <div>
          <Divider className="bg-grey-800" />
        </div>

        <div className="flex flex-col gap-xs">
          <TextSectionPrivacy isTitle>
            {t('titleDetailedInformation')}
          </TextSectionPrivacy>
          <TextSectionPrivacy>{t('infoText15')}</TextSectionPrivacy>
          <InfoBox
            hasAccordion
            title={t('ContactTheUserTitle')}
            description={
              <div className="flex flex-col gap-s">
                <h1 className="text-grey-300 text-BODY-XM font-Semibold">
                  {t('titleContactForm')}
                </h1>
                <TextSectionPrivacy>{t('infoText16')}</TextSectionPrivacy>
                <TextSectionPrivacy>{t('infoText17')}</TextSectionPrivacy>
              </div>
            }
          />
          <InfoBox
            hasAccordion
            title={t('StatisticsTitle')}
            description={
              <div className="flex flex-col gap-s">
                <TextSectionPrivacy>{t('infoText18')}</TextSectionPrivacy>
                <h1 className="text-grey-300 text-BODY-XM font-Semibold">
                  {t('titleGoogleAnalytics')}
                </h1>
                <TextSectionPrivacy>{t('infoText19')}</TextSectionPrivacy>
                <TextSectionPrivacy>{t('infoText20')}</TextSectionPrivacy>
                <TextSectionPrivacy>{t('infoText21')}</TextSectionPrivacy>
                <TextSectionPrivacy>{t('infoText22')}</TextSectionPrivacy>
                <TextSectionPrivacy>
                  {t('dataProcessingLocation')}{' '}
                  <Link href="https://policies.google.com/privacy">
                    {t('privacyPolicyLink')}
                  </Link>{' '}
                  <Link href="https://tools.google.com/dlpage/gaoptout?hl=de">
                    {t('OptOut')}.
                  </Link>
                </TextSectionPrivacy>
              </div>
            }
          />
        </div>

        <InfoBox
          hasAccordion
          title={t('TagManagementTitle')}
          description={
            <div className="flex flex-col gap-s">
              <TextSectionPrivacy>{t('infoText23')}</TextSectionPrivacy>
              <h1 className="text-grey-300 text-BODY-XM font-Semibold">
                {t('TagManagementTitleLLC')}
              </h1>
              <TextSectionPrivacy>{t('infoText24')}</TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText22')}</TextSectionPrivacy>
              <TextSectionPrivacy>
                {t('dataProcessingLocation')}{' '}
                <Link href="https://policies.google.com/privacy">
                  {t('privacyPolicyLink')}
                </Link>
                .
              </TextSectionPrivacy>
            </div>
          }
        />

        <InfoBox
          hasAccordion
          title={t('HeatMappingTitle')}
          description={
            <div className="flex flex-col gap-s">
              <TextSectionPrivacy>{t('infoText25')}</TextSectionPrivacy>
              <h1 className="text-grey-300 text-BODY-XM font-Semibold">
                {t('clarityTitle')}
              </h1>
              <TextSectionPrivacy>{t('infoText26')}</TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText27')}</TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText28')}</TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText22')}</TextSectionPrivacy>
              <TextSectionPrivacy>
                {t('dataProcessingLocation')}{' '}
                <Link href="https://www.microsoft.com/en-us/privacy/privacystatement">
                  {t('privacyPolicyLink')};
                </Link>{' '}
                {t('dataProcessingLocationBrazil')}{' '}
                <Link href="https://www.microsoft.com/en-us/privacy/privacystatement">
                  - {t('privacyPolicyLink')}.
                </Link>
              </TextSectionPrivacy>
            </div>
          }
        />

        <InfoBox
          hasAccordion
          title={t('TrafficOptimizationTitle')}
          description={
            <div className="flex flex-col gap-s">
              <TextSectionPrivacy>{t('infoText29')}</TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText30')}</TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText31')}</TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText32')}</TextSectionPrivacy>
              <TextSectionPrivacy isTitle>
                {t('cloudflareTitle')}
              </TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText33')}</TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText34')}</TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText35')}</TextSectionPrivacy>
              <TextSectionPrivacy>
                {t('dataProcessingLocation')}{' '}
                <Link href="https://www.cloudflare.com/privacypolicy/">
                  {t('privacyPolicyLink')}
                </Link>
                .
              </TextSectionPrivacy>
              <TextSectionPrivacy isTitle>
                {t('jsDelivrTitle')}
              </TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText36')}</TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText37')}</TextSectionPrivacy>
              <TextSectionPrivacy>
                {t('dataProcessingLocationPol')}{' '}
                <Link href="https://www.jsdelivr.com/terms/privacy-policy">
                  {t('privacyPolicyLink')}
                </Link>
                .
              </TextSectionPrivacy>
            </div>
          }
        />

        <InfoBox
          hasAccordion
          title={t('authenticationRecordTitle')}
          description={
            <div className="flex flex-col gap-s">
              <TextSectionPrivacy>{t('infoText38')}</TextSectionPrivacy>
              <TextSectionPrivacy isTitle>
                {t('registrationAppTitle')}
              </TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText39')}</TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText40')}</TextSectionPrivacy>
            </div>
          }
        />

        <InfoBox
          hasAccordion
          title={t('infrastructureMonitoringTitle')}
          description={
            <div className="flex flex-col gap-s">
              <TextSectionPrivacy>{t('infoText41')}</TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText42')}</TextSectionPrivacy>
              <TextSectionPrivacy isTitle>
                {t('newRelicTitle')}
              </TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText43')}</TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText44')}</TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText45')}</TextSectionPrivacy>
              <TextSectionPrivacy>
                {t('dataProcessingLocation')}{' '}
                <Link href="https://newrelic.com/termsandconditions/privacy">
                  {t('privacyPolicyLink')}
                </Link>
                .
              </TextSectionPrivacy>
            </div>
          }
        />

        <InfoBox
          hasAccordion
          title={t('externalPlatformsTitle')}
          description={
            <div className="flex flex-col gap-s">
              <TextSectionPrivacy>{t('infoText46')}</TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText47')}</TextSectionPrivacy>
              <TextSectionPrivacy isTitle>
                {t('googleFonts')}
              </TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText48')}</TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText49')}</TextSectionPrivacy>
              <TextSectionPrivacy>
                {t('dataProcessingLocation')}{' '}
                <Link href="https://policies.google.com/privacy">
                  {t('privacyPolicyLink')}
                </Link>
                .
              </TextSectionPrivacy>
              <TextSectionPrivacy isTitle>{t('googleMaps')}</TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText50')}</TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText22')}</TextSectionPrivacy>
              <TextSectionPrivacy>
                {t('dataProcessingLocation')}{' '}
                <Link href="https://policies.google.com/privacy">
                  {t('privacyPolicyLink')}
                </Link>
                .
              </TextSectionPrivacy>
            </div>
          }
        />
        <div>
          <Divider className="bg-grey-800" />
        </div>
        <div className="flex flex-col gap-s">
          <TextSectionPrivacy isTitle>{t('policyCookies')}</TextSectionPrivacy>
          <TextSectionPrivacy>{t('infoText51')}</TextSectionPrivacy>
        </div>
        <div>
          <Divider className="bg-grey-800" />
        </div>

        <div className="flex flex-col gap-s">
          <TextSectionPrivacy isTitle>{t('infoUserTitle')}</TextSectionPrivacy>
          <TextSectionPrivacy isTitle>
            {t('SubinfoUserTitle')}
          </TextSectionPrivacy>
          <TextSectionPrivacy>{t('infoText52')}</TextSectionPrivacy>
          {renderTokenList(
            [
              'infoText53',
              'infoText54',
              'infoText55',
              'infoText56',
              'infoText57',
            ],
            false,
          )}
          <TextSectionPrivacy>{t('infoText58')}</TextSectionPrivacy>
          <TextSectionPrivacy isTitle>
            {t('retentionTimeInfo')}
          </TextSectionPrivacy>
          <TextSectionPrivacy>{t('infoText59')}</TextSectionPrivacy>
          <TextSectionPrivacy>{t('infoText60')}</TextSectionPrivacy>
          {renderTokenList(['infoText61', 'infoText62'], false)}
          <TextSectionPrivacy>{t('infoText63')}</TextSectionPrivacy>
          <TextSectionPrivacy>{t('infoText64')}</TextSectionPrivacy>
        </div>
        <div className="flex flex-col gap-s">
          <TextSectionPrivacy isTitle>
            {t('DataProtectionRegulationTitle')}
          </TextSectionPrivacy>
          <TextSectionPrivacy>{t('infoText65')}</TextSectionPrivacy>
          <TextSectionPrivacy>{t('infoText66')}</TextSectionPrivacy>
          {renderTokenList(
            [
              { infoText67: 'infoText68' },
              { infoText69: 'infoText70' },
              { infoText71: 'infoText72' },
              { infoText73: 'infoText74' },
              { infoText75: 'infoText76' },
              { infoText77: 'infoText78' },
              { infoText79: 'infoText80' },
            ],
            false,
            true,
          )}
          <TextSectionPrivacy>{t('infoText82')}</TextSectionPrivacy>
          <TextSectionPrivacy isTitle>
            {t('objectToProcessingTitle')}
          </TextSectionPrivacy>
          <TextSectionPrivacy>{t('infoText83')}</TextSectionPrivacy>
          <TextSectionPrivacy>{t('infoText84')}</TextSectionPrivacy>
          <TextSectionPrivacy isTitle>
            {t('howToExerciseTitle')}
          </TextSectionPrivacy>
          <TextSectionPrivacy>{t('infoText85')}</TextSectionPrivacy>
          <div>
            <Divider className="bg-grey-800" />
          </div>
        </div>
        <div className="flex flex-col gap-s">
          <TextSectionPrivacy isTitle>
            {t('additionalInformationOnDataTitle')}
          </TextSectionPrivacy>
          <TextSectionPrivacy isTitle>{t('infoText86')}</TextSectionPrivacy>
          <TextSectionPrivacy>{t('infoText87')}</TextSectionPrivacy>
          <TextSectionPrivacy>{t('infoText88')}</TextSectionPrivacy>
          <TextSectionPrivacy isTitle>{t('infoText89')}</TextSectionPrivacy>
          <TextSectionPrivacy>{t('infoText90')}</TextSectionPrivacy>
          <TextSectionPrivacy isTitle>{t('infoText92')}</TextSectionPrivacy>
          <TextSectionPrivacy>{t('infoText93')}</TextSectionPrivacy>
          <TextSectionPrivacy isTitle>{t('infoText94')}</TextSectionPrivacy>
          <TextSectionPrivacy>{t('infoText95')}</TextSectionPrivacy>
          <TextSectionPrivacy isTitle>{t('infoText96')}</TextSectionPrivacy>
          <TextSectionPrivacy>{t('infoText97')}</TextSectionPrivacy>
          <TextSectionPrivacy>{t('infoText98')}</TextSectionPrivacy>
        </div>
        <div>
          <Divider className="bg-grey-800" />
        </div>

        <InfoBox
          hasAccordion
          title={t('definitionsAndlegalreferencesTitle')}
          description={
            <div className="flex flex-col gap-s">
              <TextSectionPrivacy isTitle>{t('infoText99')}</TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText100')}</TextSectionPrivacy>
              <TextSectionPrivacy isTitle>
                {t('infoText101')}
              </TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText102')}</TextSectionPrivacy>
              <TextSectionPrivacy isTitle>
                {t('infoText103')}
              </TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText104')}</TextSectionPrivacy>
              <TextSectionPrivacy isTitle>
                {t('infoText105')}
              </TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText106')}</TextSectionPrivacy>
              <TextSectionPrivacy isTitle>
                {t('infoText107')}
              </TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText108')}</TextSectionPrivacy>
              <TextSectionPrivacy isTitle>
                {t('infoText110')}
              </TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText111')}</TextSectionPrivacy>
              <TextSectionPrivacy isTitle>
                {t('infoText112')}
              </TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText113')}</TextSectionPrivacy>
              <TextSectionPrivacy isTitle>
                {t('infoText114')}
              </TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText115')}</TextSectionPrivacy>
              <TextSectionPrivacy isTitle>
                {t('infoText116')}
              </TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText117')}</TextSectionPrivacy>
              <TextSectionPrivacy isTitle>
                {t('infoText118')}
              </TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText119')}</TextSectionPrivacy>
              <TextSectionPrivacy isTitle>
                {t('infoText120')}
              </TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText121')}</TextSectionPrivacy>
              <TextSectionPrivacy isTitle>
                {t('infoText122')}
              </TextSectionPrivacy>
              <TextSectionPrivacy>{t('infoText123')}</TextSectionPrivacy>
            </div>
          }
        />
        <div>
          <Divider className="bg-grey-800" />
        </div>
        <TextSectionPrivacy>{t('infoText124')}</TextSectionPrivacy>
      </div>
    </Dialog>
  )
}

export default DialogPrivacyPolicy
