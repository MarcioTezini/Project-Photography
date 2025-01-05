import { useCustomerStore } from '@/stores/useCustomerStore'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useState } from 'react'
import {
  FaAmazon,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaSpotify,
  FaTelegram,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
} from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import DialogWithdrawalRules from '../DialogWithdrawalRules'
import DialogInstitutionalData from '../DialogInstitutionalData'
import DialogDepositRules from '../DialogDepositRules'
import DialogCookiesRules from '../DialogCookiesRules'
import DialogPrivacyPolicy from '../DialogPrivacyPolicy'
import { useHomeStore } from '@/stores/HomeStore'

interface HomeFooterProps {
  biggerPadding?: boolean
}

export function HomeFooter({
  biggerPadding = false,
}: Readonly<HomeFooterProps>) {
  const { configs } = useCustomerStore()
  const t = useTranslations('Home.footer')
  const [openDialogDepositRules, setOpenDialogDepositRules] = useState(false)
  const [openDialogCookiesRules, setOpenDialogCookiesRules] = useState(false)
  const { modalPrivacyPolicyOpen, setModalPrivacyPolicyOpen } = useHomeStore()
  const [isOpenWithdrawalRulesDialog, setOpenWithdrawalRulesDialog] =
    useState(false)

  const [isOpenInstitutionalDataDialog, setOpenInstitutionalDataDialog] =
    useState(false)

  const handleCloseDialogDepositRules = () => {
    setOpenDialogDepositRules(false)
  }

  const handleCloseDialogCookiesRules = () => {
    setOpenDialogCookiesRules(false)
  }

  const handleCloseDialogPrivacyPolicy = () => {
    setModalPrivacyPolicyOpen(false)
  }

  const handleOpenInstitutionalDataDialog = () => {
    setOpenInstitutionalDataDialog(true)
  }

  const handleCloseWithdrawalRulesDialog = () => {
    setOpenWithdrawalRulesDialog(false)
  }

  const handleCloseInstitutionalDataDialog = () => {
    setOpenInstitutionalDataDialog(false)
  }

  return (
    <div
      id="footer"
      className={`flex bg-fichasPay-secondary-400 w-full p-xl sm:pl-l xl:px-xxl flex-col items-center gap-xl ${biggerPadding && 'pt-xxl'}`}
    >
      <div className="flex w-full justify-between items-start md:grid md:grid-cols-1 sm:grid sm:grid-cols-1 gap-xl">
        <div className="flex flex-col items-center justify-center gap-xm">
          {configs?.logos?.logoFooter && (
            <Image
              src={configs?.logos?.logoFooter}
              alt="Logo do Fichas Pay"
              width={205}
              height={90}
            />
          )}
          <p className="text-grey-300 text-BODY-S font-Regular text-center">
            <span className="text-grey-300 text-BODY-S font-Bold">
              {configs?.footer.companyName}
            </span>
            <br />
            {configs?.footer?.address?.street &&
              `${configs.footer.address.street}`}
            {configs?.footer?.address?.number &&
              `, ${configs.footer.address.number}`}
            {configs?.footer?.address?.complement &&
              `, ${configs.footer.address.complement}`}
            <br />
            {configs?.footer?.address?.neighborhood &&
              `${configs.footer.address.neighborhood}, `}
            {configs?.footer?.address?.city && `${configs.footer.address.city}`}
            {configs?.footer?.address?.state &&
              `/${configs.footer?.address?.state}`}
            <br />
            {configs?.footer?.address?.postalCode &&
              `CEP: ${configs.footer.address.postalCode}`}
            <br />
            <br />
            {configs?.footer.taxId && `CNPJ ${configs.footer.taxId}`}
            <br />
            {configs?.footer.email && `${configs.footer.email}`}
          </p>
        </div>
        <div className="flex flex-col items-center gap-s">
          <div className="flex flex-col justify-start md:text-center sm:text-center gap-s">
            <span className="text-grey-300 text-BODY-XM font-Extrabold">
              {t('terms')}
            </span>
            <p
              className="text-grey-300 text-BODY-XM font-Regular cursor-pointer"
              onClick={() => {
                setOpenDialogDepositRules(true)
              }}
            >
              {t('rulesDeposit')}
            </p>
            <p
              className="text-grey-300 text-BODY-XM font-Regular cursor-pointer"
              onClick={() => {
                setOpenWithdrawalRulesDialog(true)
              }}
            >
              {t('rulesWithdraw')}
            </p>
            <p
              className="text-grey-300 text-BODY-XM font-Regular cursor-pointer"
              onClick={() => setModalPrivacyPolicyOpen(true)}
            >
              {t('privacyPolicy')}
            </p>
            <p
              className="text-grey-300 text-BODY-XM font-Regular cursor-pointer"
              onClick={() => {
                setOpenDialogCookiesRules(true)
              }}
            >
              {t('cookiesPolicy')}
            </p>
            <p
              className="text-grey-300 text-BODY-XM font-Regular cursor-pointer"
              onClick={handleOpenInstitutionalDataDialog}
            >
              {t('termsOfUse')}
            </p>
          </div>
        </div>
        <div className="flex items-end sm:items-center gap-xm justify-center">
          <Image
            src="/images/pix.svg"
            alt="Logo do Pix"
            width={165}
            height={58}
          />
          <div className="flex h-l w-l sm:w-xxxm sm:h-xxxm justify-center items-center rounded-xxl border-2 border-solid border-grey-300">
            <span className="text-grey-300 text-BODY-M font-Black mr-xxxs mt-xxxs">
              +18
            </span>
          </div>
        </div>
        {configs?.footer.socialLinks &&
          configs?.footer.socialLinks.length > 0 && (
            <div className="flex flex-col h-full justify-center items-center gap-m">
              <label className="text-grey-300 text-BODY-XM font-Bold">
                {t('followUs')}
              </label>
              <div className="flex flex-col h-full justify-center items-center gap-s">
                <div className="flex flex-wrap justify-center items-start gap-s max-w-[210px]">
                  {configs?.footer?.socialLinks?.map((link) => {
                    let SocialIcon
                    switch (link.platform) {
                      case 'facebook':
                        SocialIcon = FaFacebook
                        break
                      case 'twitter':
                        SocialIcon = FaXTwitter
                        break
                      case 'instagram':
                        SocialIcon = FaInstagram
                        break
                      case 'linkedin':
                        SocialIcon = FaLinkedin
                        break
                      case 'telegram':
                        SocialIcon = FaTelegram
                        break
                      case 'youtube':
                        SocialIcon = FaYoutube
                        break
                      case 'spotify':
                        SocialIcon = FaSpotify
                        break
                      case 'tikTok':
                        SocialIcon = FaTiktok
                        break
                      case 'whatsApp':
                        SocialIcon = FaWhatsapp
                        break
                      case 'alexa':
                        SocialIcon = FaAmazon
                        break
                      default:
                        return null
                    }

                    return (
                      <a
                        href={link.url}
                        key={link.id}
                        className="rounded-xxl border border-solid border-grey-300 p-[10px] text-center"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <SocialIcon size={18} className="text-grey-300" />
                      </a>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
      </div>
      <label className="text-grey-300 text-BODY-S font-Regular sm:text-center">
        {t('copyright')} {configs?.footer.companyName}{' '}
        <span className="sm:hidden">-</span>{' '}
        <br className="md:hidden xl:hidden lg:hidden" /> {t('copyright2')}
      </label>
      <DialogDepositRules
        isOpen={openDialogDepositRules}
        onClose={handleCloseDialogDepositRules}
      />
      <DialogPrivacyPolicy
        isOpen={modalPrivacyPolicyOpen}
        onClose={handleCloseDialogPrivacyPolicy}
      />
      <DialogCookiesRules
        isOpen={openDialogCookiesRules}
        onClose={handleCloseDialogCookiesRules}
      />
      <DialogWithdrawalRules
        isOpen={isOpenWithdrawalRulesDialog}
        onClose={handleCloseWithdrawalRulesDialog}
      />
      <DialogInstitutionalData
        isOpen={isOpenInstitutionalDataDialog}
        onClose={handleCloseInstitutionalDataDialog}
      />
    </div>
  )
}
