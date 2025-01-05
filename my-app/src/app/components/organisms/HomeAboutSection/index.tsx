import { useCustomerStore } from '@/stores/useCustomerStore'
import { Chip } from '../HomeChips'
export function HomeAboutSection() {
  const { configs } = useCustomerStore()

  const createMarkup = (html: string) => {
    const styledHtml = html.replace(
      /<strong>(.*?)<\/strong>/g,
      '<strong class="text-fichasPay-main-400">$1</strong>',
    )
    return { __html: styledHtml }
  }

  function extrairSvgApenas(codigoSvg: string) {
    const svgMatch = codigoSvg.match(/<svg[\s\S]*<\/svg>/i)
    return svgMatch ? svgMatch[0] : ''
  }

  const defaultImage = ''
  const card1 =
    configs?.images?.cardsIcon1 && configs.images.cardsIcon1.includes('https')
      ? configs.images.cardsIcon1
      : extrairSvgApenas(configs?.images.cardsIcon1 || defaultImage)

  const card2 =
    configs?.images?.cardsIcon2 && configs.images.cardsIcon2.includes('https')
      ? configs.images.cardsIcon2
      : extrairSvgApenas(configs?.images.cardsIcon2 || defaultImage)

  const card3 =
    configs?.images?.cardsIcon3 && configs.images.cardsIcon3.includes('https')
      ? configs.images.cardsIcon3
      : extrairSvgApenas(configs?.images.cardsIcon3 || defaultImage)

  const sectionStyle =
    configs?.content.siteBackgroundConfig === 'Imagem de fundo' &&
    configs.images.siteBgImage
      ? {
          backgroundImage: `url('${configs.images.siteBgImage}')`,
          backgroundSize: 'cover',
        }
      : undefined

  return (
    <section
      id="about"
      style={sectionStyle}
      className={`${
        configs?.content.siteBackgroundConfig === 'Sólido' &&
        'bg-fichasPay-secondary-400'
      } flex flex-col w-full pt-[160px] px-xl pb-xxl items-center gap-xl justify-center sm:px-s sm:pt-[160px]`}
    >
      <div
        className="flex flex-col max-w-[870px] pb-xxs justify-center items-center text-grey-300 text-center text-H4 font-Medium sm:text-H4"
        dangerouslySetInnerHTML={
          configs?.content.title
            ? createMarkup(configs.content.title)
            : undefined
        }
      />
      <div
        className="flex flex-col max-w-[870px] pb-xxs justify-center items-center text-grey-300 text-center text-BODY-M font-Regular sm:text-BODY-XM"
        dangerouslySetInnerHTML={
          configs?.content.supportingText
            ? createMarkup(configs.content.supportingText)
            : undefined
        }
      />
      {configs?.content.hasCards === true && (
        <div className="grid grid-cols-3 md:grid-cols-1 sm:grid-cols-1 gap-s sm:mt-0 md:mt-0">
          <Chip
            iconSrc={card1 || ''}
            iconWidth={180}
            iconHeight={180}
            text={
              <p
                className="text-grey-300 text-center text-BODY-M font-Regular m-[20px] sm:text-BODY-XM"
                dangerouslySetInnerHTML={createMarkup(
                  configs?.content.cardsIcon1Text || '',
                )}
              />
            }
          />
          <Chip
            iconSrc={card2 || ''}
            iconWidth={180}
            iconHeight={180}
            text={
              <p
                className="text-grey-300 text-center text-BODY-M font-Regular m-[20px] sm:text-BODY-XM"
                dangerouslySetInnerHTML={createMarkup(
                  configs?.content.cardsIcon2Text || '',
                )}
              />
            }
          />
          <Chip
            iconSrc={card3 || ''}
            iconWidth={180}
            iconHeight={180}
            text={
              <p
                className="text-grey-300 text-center text-BODY-M font-Regular m-[20px] sm:text-BODY-XM"
                dangerouslySetInnerHTML={createMarkup(
                  configs?.content.cardsIcon3Text || '',
                )}
              />
            }
          />
        </div>
      )}
      {/* <div className="lg:grid xl:grid lg:grid-cols-2 xl:grid-cols-2 md:flex md:flex-col w-full pt-xl px-xl sm:px-s items-center gap-xxl md:gap-xm sm:gap-xm justify-center">
        <div className="flex justify-center">
          <Image
            src="/images/img-home-about-section.png"
            alt=""
            width={545}
            height={500}
          />
        </div>
        <div className="flex flex-col w-full justify-center gap-xm self-stretch">
          <h1 className="text-grey-300 text-H4 sm:text-H5 md:text-H5 font-Regular sm:font-Medium sm:mt-xm self-stretch">
            {t('heading')}{' '}
            <span className="text-fichasPay-main-400 text-H4 sm:text-H5 md:text-H5 font-Bold">
              {t('highlight')}
              {!isMediumScreen && !isSmallScreen && <br />}
            </span>{' '}
            {t('distance')}
          </h1>
          <p className="text-grey-300 text-BODY-M sm:text-BODY-XM md:text-BODY-XM font-Regular self-stretch">
            {t('description')}
          </p>
        </div>
      </div> */}
    </section>
  )
}
