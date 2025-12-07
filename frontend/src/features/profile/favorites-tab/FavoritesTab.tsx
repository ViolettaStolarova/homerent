import { useGetFavoritesQuery } from '@/shared/api/favorites'
import { PropertyCard } from '@/entities/property-card'
import styles from './FavoritesTab.module.scss'

export function FavoritesTab() {
  const { data: favorites, isLoading } = useGetFavoritesQuery()

  if (isLoading) {
    return <div>Загрузка...</div>
  }

  return (
    <div className={styles.tab}>
      <h2>Избранное</h2>
      {favorites && favorites.length > 0 ? (
        <div className={styles.propertiesGrid}>
          {favorites.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>Нет избранных объявлений</div>
      )}
    </div>
  )
}

