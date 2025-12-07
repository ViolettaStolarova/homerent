import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import { PropertyImage } from '@/shared/types'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import styles from './PropertyGallery.module.scss'

interface PropertyGalleryProps {
  images: PropertyImage[]
}

export function PropertyGallery({ images }: PropertyGalleryProps) {
  if (!images.length) {
    return (
      <div className={styles.gallery}>
        <img
          src="https://via.placeholder.com/800x500"
          alt="No image"
          className={styles.image}
        />
      </div>
    )
  }

  return (
    <div className={styles.gallery}>
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        className={styles.swiper}
      >
        {images.map((image) => (
          <SwiperSlide key={image.id}>
            <img src={image.image_url} alt="Property" className={styles.image} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

