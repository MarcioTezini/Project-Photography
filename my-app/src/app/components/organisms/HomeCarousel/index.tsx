'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import SwiperCore from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import Image from 'next/image'
import { Navigation, Autoplay } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/autoplay'

import './styles.css'
import { useHomeStore } from '@/stores/HomeStore'
import { HomeCarouselCounter } from '../HomeCarouselCounter'
import { useCustomerStore } from '@/stores/useCustomerStore'
import { Carousel } from '@/services/customer/customer'
import dynamic from 'next/dynamic'
import { useMediaQuery } from 'react-responsive'

const MediaQuery = dynamic(() => import('react-responsive'), {
  ssr: false,
})

// Definir Swiper com os módulos necessários
export function HomeCarousel() {
  const { slideCount, activeSlide, isLoggedIn } = useHomeStore()
  const { configs } = useCustomerStore()
  const isSmallScreen = useMediaQuery({ query: '(max-width: 679px)' })

  const setSlideCount = useHomeStore((state) => state.setSlideCount)
  const setActiveSlide = useHomeStore((state) => state.setActiveSlide)

  const [autoplayDelay, setAutoplayDelay] = useState(5000)
  const swiperRef = useRef<SwiperCore | null>(null)

  // Função para filtrar slides
  const getFilteredSlides = useMemo(() => {
    if (!configs?.carousel) return []

    return configs.carousel.filter((slide: Carousel) => {
      if (slide.show === 1 && isLoggedIn) return true
      if (slide.show === 2 && !isLoggedIn) return true
      if (slide.show === 3) return true
      return false
    })
  }, [configs, isLoggedIn])

  useEffect(() => {
    const filteredSlides = getFilteredSlides

    const count = isSmallScreen
      ? filteredSlides.filter((slide: Carousel) => slide.device === 2).length
      : filteredSlides.filter((slide: Carousel) => slide.device === 1).length

    setSlideCount(count)

    const firstSlide = isSmallScreen
      ? filteredSlides.find((slide: Carousel) => slide.device === 2)
      : filteredSlides.find((slide: Carousel) => slide.device === 1)

    if (firstSlide?.interval) {
      setAutoplayDelay(firstSlide.interval * 1000)
    }
  }, [getFilteredSlides, setSlideCount, isSmallScreen])

  // Este useEffect será acionado sempre que o autoplayDelay for atualizado
  useEffect(() => {
    if (
      swiperRef.current &&
      swiperRef.current.params?.autoplay &&
      typeof swiperRef.current.params.autoplay === 'object'
    ) {
      swiperRef.current.autoplay.stop()
      swiperRef.current.params.autoplay.delay = autoplayDelay
      swiperRef.current.autoplay.start()
    }
  }, [autoplayDelay])

  const handleSlideChange = (swiper: SwiperCore) => {
    // Se o índice estiver fora do esperado, ignore a mudança
    if (swiper.activeIndex >= slideCount || swiper.activeIndex < 0) return

    setActiveSlide(swiper.activeIndex)

    const filteredSlides = isSmallScreen
      ? getFilteredSlides.filter((slide: Carousel) => slide.device === 2)
      : getFilteredSlides.filter((slide: Carousel) => slide.device === 1)

    const currentSlide = filteredSlides[swiper.activeIndex]

    const newDelay = currentSlide?.interval
      ? currentSlide.interval * 1000
      : 5000
    setAutoplayDelay(newDelay)

    if (
      swiperRef.current &&
      swiperRef.current.params?.autoplay &&
      typeof swiperRef.current.params.autoplay === 'object'
    ) {
      swiperRef.current.autoplay.stop()
      swiperRef.current.params.autoplay.delay = newDelay
      swiperRef.current.autoplay.start()
    }
  }

  const renderSlides = (device: number) => {
    const filteredSlides = getFilteredSlides
      .filter((slide: Carousel) => slide.device === device)
      .sort((a: Carousel, b: Carousel) => a.sorder - b.sorder)

    return filteredSlides.map((slide: Carousel) => (
      <SwiperSlide key={slide.id}>
        <Image
          className={
            slide.link && slide.link !== '' ? 'hover:cursor-pointer' : ''
          }
          src={slide.url}
          width={device === 1 ? 1920 : 600}
          height={device === 1 ? 768 : 680}
          alt={`Imagem do Banner - ${slide.id}`}
          quality={100}
          priority
          onClick={() => {
            if (slide.link && slide.link !== '') {
              if (slide.target === '_blank') {
                window.open(slide.link, '_blank')
              } else {
                window.location.href = slide.link
              }
            }
          }}
        />
      </SwiperSlide>
    ))
  }

  return (
    <>
      {/* Swiper para Desktop */}
      <MediaQuery minWidth={680}>
        <Swiper
          navigation={true}
          modules={[Navigation, Autoplay]}
          onSlideChange={handleSlideChange}
          className="max-h-[768px]"
          autoplay={{ delay: autoplayDelay }}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
        >
          {renderSlides(1)}
        </Swiper>
      </MediaQuery>

      {/* Swiper para Mobile */}
      <MediaQuery maxWidth={679}>
        <div className="hidden sm:block">
          <Swiper
            navigation={true}
            modules={[Navigation, Autoplay]}
            onSlideChange={handleSlideChange}
            className="max-h-[600px]"
            autoplay={{ delay: autoplayDelay }}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
          >
            {renderSlides(2)}
          </Swiper>
        </div>
      </MediaQuery>

      {/* Contador do Carousel */}
      {slideCount > 1 && (
        <HomeCarouselCounter
          activeSlide={activeSlide}
          slideCount={slideCount}
        />
      )}
    </>
  )
}
