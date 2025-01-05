import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { useMediaQuery } from 'react-responsive'

export function CachetaSection() {
  const t = useTranslations('Home.CachetaSection')
  const isSmallScreen = useMediaQuery({ query: '(max-width: 679px)' })
  const isMediumScreen = useMediaQuery({ query: '(max-width: 1365px)' })
  const locale = useLocale()

  return (
    <section
      id="cacheta"
      className="grid lg:grid-cols-2 grid-cols-2 sm:grid-cols-1 md:flex md:flex-col bg-cacheta-background-gradient w-full py-xxl px-xl sm:px-s items-center gap-s md:gap-xm sm:gap-xm justify-center"
    >
      <div className="flex justify-center">
        <Image src="/images/img-cacheta.png" alt="" width={545} height={500} />
      </div>
      <div className="flex flex-col w-full justify-center gap-xm items-center">
        <h1 className="text-grey-900 text-H4 sm:text-H5 font-Semibold sm:font-Medium sm:mt-xm">
          {t('header.cachetaBrasilParte1')}
          {!isSmallScreen && <br />} {t('header.cachetaBrasilParte2')}{' '}
          <span className="text-cacheta-secondary-300 text-H4 sm:text-H5 font-Extrabold">
            {t('header.cachetaBrasilParte3')}
          </span>
        </h1>
        <p className="text-grey-900 text-BODY-M sm:text-BODY-XM font-Medium">
          {t('description.usuariosAtivos')}
          {!isSmallScreen && !isMediumScreen && <br />}
          {t('description.modalidades')}
        </p>
        <p className="text-grey-900 text-BODY-L md:text-BODY-M sm:text-BODY-M font-Bold">
          {t('engajamento.jogabilidadeEnvolvente')}
          {!isSmallScreen && !isMediumScreen && <br />}
          {t('engajamento.naPalmaDaMao')}
        </p>
        <div className="flex justify-start items-center flex-shrink-0 gap-s">
          <a
            target="_blank"
            href="https://apps.apple.com/br/app/cacheta-league/id1582103209"
          >
            <Image
              src={
                locale === 'pt'
                  ? '/images/stores/apple-store-pt-dark.svg'
                  : locale === 'en'
                    ? '/images/stores/apple-store-en-dark.svg'
                    : '/images/stores/apple-store-es-dark.svg'
              }
              width={206}
              height={67}
              alt={t('lojas.appleStoreAlt')}
            />
          </a>
          <a
            target="_blank"
            href="https://play.google.com/store/apps/details?id=com.kk.cacheta&hl=pt_BR&gl=US"
          >
            <Image
              src={
                locale === 'pt'
                  ? '/images/stores/google-play-pt-dark.svg'
                  : locale === 'en'
                    ? '/images/stores/google-play-en-dark.svg'
                    : '/images/stores/google-play-es-dark.svg'
              }
              width={206}
              height={67}
              alt={t('lojas.googlePlayAlt')}
            />
          </a>
        </div>
      </div>
    </section>
  )
}
