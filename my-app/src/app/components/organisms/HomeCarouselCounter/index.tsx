interface HomeCarouselCounterProps {
  activeSlide: number
  slideCount: number
}

export function HomeCarouselCounter({
  activeSlide,
  slideCount,
}: HomeCarouselCounterProps) {
  return (
    <div className="flex absolute left-1/2 translate-x-[-50%] gap-s justify-center items-center mt-xxxm">
      {Array.from({ length: slideCount }, (_, index) =>
        index === activeSlide ? (
          <div
            key={index}
            className="flex p-[12px] flex-col justify-center items-center gap-[12px] border-[3px] border-solid border-grey-300 rounded-xxl"
          >
            <span className="text-grey-300 text-BODY-M font-Extrabold">
              {activeSlide + 1}
            </span>
          </div>
        ) : (
          <div
            key={index}
            className="flex w-xxs h-xxs flex-col justify-center items-center gap-[12px] border-[3px] border-solid border-grey-300 rounded-xxl"
          >
            {' '}
          </div>
        ),
      )}
    </div>
  )
}
