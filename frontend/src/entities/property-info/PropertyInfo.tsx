import { Property, Amenity } from '@/shared/types'
import { FavoriteButton } from '@/features/favorite-button'
import { useMeQuery } from '@/shared/api/auth'
import styles from './PropertyInfo.module.scss'

interface PropertyInfoProps {
	property: Property
}

const propertyTypeLabels: Record<string, string> = {
	apartment: 'Квартира',
	house: 'Дом',
	room: 'Комната',
	cottage: 'Коттедж',
}

const amenityLabels: Record<Amenity, string> = {
	wifi: 'Wi-Fi',
	kitchen: 'Кухня',
	tv: 'ТВ',
	washer: 'Стиральная машина',
	parking: 'Парковка',
	pool: 'Бассейн',
}

export function PropertyInfo({ property }: PropertyInfoProps) {
	const { data: userData } = useMeQuery()
	const isAuthenticated = !!userData?.user

	return (
		<div className={styles.info}>
			<div className={styles.header}>
				<div>
					<h1 className={styles.title}>{property.title}</h1>
					<div className={styles.meta}>
						<span className={styles.type}>
							{propertyTypeLabels[property.property_type]}
						</span>
						{property.rating && (
							<span className={styles.rating}>
								⭐ {Number(property.rating).toFixed(1)} (
								{property.review_count || 0} отзывов)
							</span>
						)}
					</div>
				</div>
				{isAuthenticated && <FavoriteButton propertyId={property.id} />}
			</div>

			<div className={styles.price}>
				{property.price_per_night.toLocaleString('ru-RU')} BYN{' '}
				<span>/ ночь</span>
			</div>

			<div className={styles.characteristics}>
				<div className={styles.characteristic}>
					<span className={styles.label}>Гостей:</span>
					<span className={styles.value}>{property.max_guests}</span>
				</div>
				<div className={styles.characteristic}>
					<span className={styles.label}>Спален:</span>
					<span className={styles.value}>{property.bedrooms}</span>
				</div>
				<div className={styles.characteristic}>
					<span className={styles.label}>Кроватей:</span>
					<span className={styles.value}>{property.beds}</span>
				</div>
				<div className={styles.characteristic}>
					<span className={styles.label}>Ванных:</span>
					<span className={styles.value}>{property.bathrooms}</span>
				</div>
			</div>

			{property.amenities && property.amenities.length > 0 && (
				<div className={styles.amenities}>
					<h3>Удобства</h3>
					<div className={styles.amenitiesList}>
						{property.amenities.map(amenity => (
							<div key={amenity} className={styles.amenity}>
								{amenityLabels[amenity as Amenity] || amenity}
							</div>
						))}
					</div>
				</div>
			)}

			<div className={styles.description}>
				<h3>Описание</h3>
				<p>{property.description}</p>
			</div>

			<div className={styles.location}>
				<h3>Расположение</h3>
				<p>{property.address}</p>
				<p className={styles.city}>{property.city}</p>
				<div className={styles.mapContainer}>
					<div className={styles.mapFrame}>
						<iframe
							className={styles.map}
							width='100%'
							height='400'
							frameBorder='0'
							scrolling='no'
							src={`https://maps.google.com/maps?q=${encodeURIComponent(
								property.address + ', ' + property.city
							)}&output=embed`}
							title='Карта расположения'
						/>
					</div>
					<a
						href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
							property.address + ', ' + property.city
						)}`}
						target='_blank'
						rel='noopener noreferrer'
						className={styles.mapLink}
					>
						Открыть в Google Maps →
					</a>
				</div>
			</div>
		</div>
	)
}
