import { CarouselList } from '@/services/carousel/carousel'
import { CarouselTable } from './type'

const formatterCarouselListToTable = (
  carousels: CarouselList[],
): CarouselTable[] => {
  return carousels.map((carousel) => {
    return {
      id: carousel.id,
      name: carousel.name,
      interval: carousel.interval,
      show: carousel.show,
      sorder: carousel.sorder,
      published: carousel.published,
    }
  })
}

export { formatterCarouselListToTable }
