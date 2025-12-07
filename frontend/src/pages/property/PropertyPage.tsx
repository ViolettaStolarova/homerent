import { useParams } from 'react-router-dom'
import { useGetPropertyQuery } from '@/shared/api/properties'
import { PropertyGallery } from '@/entities/property-gallery'
import { PropertyInfo } from '@/entities/property-info'
import { BookingForm } from '@/features/booking-form'
import { OwnerInfo } from '@/entities/owner-info'
import { ReviewsSection } from '@/entities/reviews-section'
import styles from './PropertyPage.module.scss'

export function PropertyPage() {
  const { id } = useParams<{ id: string }>()
  const { data: property, isLoading } = useGetPropertyQuery(Number(id))

  if (isLoading) {
    return <div className={styles.loading}>Загрузка...</div>
  }

  if (!property) {
    return <div className={styles.error}>Объявление не найдено</div>
  }

  return (
    <div className={styles.propertyPage}>
      <div className={styles.container}>
        <PropertyGallery images={property.images || []} />
        <div className={styles.content}>
          <div className={styles.mainContent}>
            <PropertyInfo property={property} />
            <OwnerInfo
              ownerName={property.owner_name || ''}
              ownerSince={property.owner_since || ''}
            />
            <ReviewsSection
              propertyId={property.id}
              reviews={property.reviews || []}
              rating={property.rating}
              reviewCount={property.review_count}
            />
          </div>
          <div className={styles.sidebar}>
            <BookingForm
              property={property}
              unavailableDates={property.unavailable_dates || []}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

