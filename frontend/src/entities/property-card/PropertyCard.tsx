import { Link } from 'react-router-dom'
import { Property } from '@/shared/types'
import { FavoriteButton } from '@/features/favorite-button'
import { useMeQuery } from '@/shared/api/auth'
import styles from './PropertyCard.module.scss'

interface PropertyCardProps {
	property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
	const { data: userData } = useMeQuery()
	const isAuthenticated = !!userData?.user

	const propertyTypeLabels: Record<string, string> = {
		apartment: 'Квартира',
		house: 'Дом',
		room: 'Комната',
		cottage: 'Коттедж',
	}

	return (
		<Link to={`/property/${property.id}`} className={styles.card}>
			<div className={styles.imageContainer}>
				<img
					src={property.main_image || 'https://via.placeholder.com/300x200'}
					alt={property.title}
					className={styles.image}
				/>
				{isAuthenticated && (
					<div className={styles.favoriteButton}>
						<FavoriteButton propertyId={property.id} />
					</div>
				)}
			</div>
			<div className={styles.content}>
				<div className={styles.header}>
					<span className={styles.type}>
						{propertyTypeLabels[property.property_type] ||
							property.property_type}
					</span>
					{property.rating && (
						<span className={styles.rating}>
							⭐ {Number(property.rating).toFixed(1)} (
							{property.review_count || 0})
						</span>
					)}
				</div>
				<h3 className={styles.title}>{property.title}</h3>
				<div className={styles.price}>
					{property.price_per_night.toLocaleString('ru-RU')} BYN{' '}
					<span className={styles.night}>/ ночь</span>
				</div>
			</div>
		</Link>
	)
}
