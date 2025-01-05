'use client'

import Image from 'next/image'
import { PokerSectionCard } from '../PokerSectionCard'
import { useMediaQuery } from 'react-responsive'
import { useLocale, useTranslations } from 'next-intl'

export function PokerSection() {
  const t = useTranslations('Home.PokerSection')
  const isSmallScreen = useMediaQuery({ query: '(max-width: 679px)' })
  const isMediumScreen = useMediaQuery({ query: '(max-width: 1365px)' })
  const locale = useLocale()

  return (
    <section
      id="poker"
      className="bg-[url('/images/bg-brand-content-1.jpeg')] bg-cover bg-no-repeat grid grid-cols-2 w-full py-xxl items-center gap-s justify-center md:flex sm:flex md:flex-col sm:flex-col md:px-xl sm:px-s"
    >
      <div className="flex flex-col justify-center items-start gap-xm ml-xl md:m-0 sm:m-0">
        <h1 className="text-grey-300 text-H4 font-Medium sm:text-H5">
          <span className="text-gaming-main-400 text-H4 font-Extrabold sm:text-H5">
            {t('SupremaPoker')},
          </span>{' '}
          {t('aMaiorLiga')} {!isSmallScreen && !isMediumScreen && <br />}
          {t('dePoker')} {isMediumScreen && <br />}
          {t('doMundo')}
        </h1>
        <p className="text-grey-300 text-BODY-M font-Medium sm:text-BODY-XM">
          {t('mesasAtivas')}{' '}
          <span className="text-grey-300 font-Extrabold text-BODY-M sm:text-BODY-XM">
            {t('experienciaPoker')}
          </span>
        </p>
        <div className="grid grid-cols-3 gap-s w-full sm:grid-cols-1">
          <PokerSectionCard
            iconSrc="/images/icons/icon-fichas.svg"
            iconWidth={37}
            iconHeight={50}
            text={
              <p className="text-grey-300 text-BODY-XM font-Medium text-center">
                {t('torneiosSatelites')}{' '}
                <span className="text-gaming-main-400 text-BODY-XM font-Extrabold text-center">
                  {t('aPartirDe')}
                </span>
              </p>
            }
          />
          <PokerSectionCard
            iconSrc="/images/icons/icon-players-table.svg"
            iconWidth={51}
            iconHeight={50}
            text={
              <p className="text-grey-300 text-BODY-XM font-Medium text-center">
                {t('ringGame')}{' '}
                <span className="text-gaming-main-400 text-BODY-XM font-Extrabold text-center">
                  {t('eMuitoMais')}
                </span>
              </p>
            }
          />
          <PokerSectionCard
            iconSrc="/images/icons/icon-table.svg"
            iconWidth={50}
            iconHeight={32}
            text={
              <p className="text-grey-300 text-BODY-XM font-Medium text-center">
                {t('multiTable')}{' '}
                <span className="text-gaming-main-400 text-BODY-XM font-Extrabold text-center">
                  {t('jogueMultimesas')}
                </span>
              </p>
            }
          />
        </div>
        <div className="flex w-full flex-col justify-center items-center gap-s">
          <h1 className="text-grey-300 text-H6 font-Medium md:text-BODY-L m:text-BODY-L text-center">
            {t('junteSeCampeoes')}{' '}
            <span className="text-gaming-main-400 text-H6 font-Extrabold md:text-BODY-L sm:text-BODY-L text-center">
              {t('baixeApp')}
            </span>
          </h1>
          <div className="grid grid-cols-3 md:grid-cols-2 sm:grid-cols-2 gap-s">
            <a
              href="https://apps.apple.com/br/app/suprema-poker/id1583176410"
              target="_blank"
            >
              <Image
                src={
                  locale === 'pt'
                    ? '/images/stores/apple-store-pt.svg'
                    : locale === 'en'
                      ? '/images/stores/apple-store-en.svg'
                      : '/images/stores/apple-store-es.svg'
                }
                width={205}
                height={67}
                alt=""
              />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.opt.supremapoker"
              target="_blank"
            >
              <Image
                src={
                  locale === 'pt'
                    ? '/images/stores/google-play-pt.svg'
                    : locale === 'en'
                      ? '/images/stores/google-play-en.svg'
                      : '/images/stores/google-play-es.svg'
                }
                width={205}
                height={67}
                alt=""
              />
            </a>
            <a
              href="https://supremapoker.net/download/supremapoker.exe"
              target="_blank"
              className="md:hidden sm:hidden"
            >
              <Image
                src={
                  locale === 'pt'
                    ? '/images/stores/windows-pt.svg'
                    : locale === 'en'
                      ? '/images/stores/windows-en.svg'
                      : '/images/stores/windows-es.svg'
                }
                width={205}
                height={67}
                alt=""
              />
            </a>
          </div>
        </div>
      </div>
      <div>
        <div className="flex justify-center md:mt-xxm sm:mt-xxm">
          <Image
            src="/images/duplo-smartphone.png"
            alt=""
            width={648}
            height={635}
          />
        </div>
      </div>
    </section>
  )
}
