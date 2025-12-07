import { useToggleFavoriteMutation, useGetFavoritesQuery } from '@/shared/api/favorites'
import { Favorite, FavoriteBorder } from '@mui/icons-material'
import styles from './FavoriteButton.module.scss'

interface FavoriteButtonProps {
  propertyId: number
}

export function FavoriteButton({ propertyId }: FavoriteButtonProps) {
  const { data: favorites } = useGetFavoritesQuery()
  const [toggleFavorite] = useToggleFavoriteMutation()

  const isFavorite = favorites?.some((p) => p.id === propertyId) || false

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite({ property_id: propertyId })
  }

  return (
    <button onClick={handleClick} className={styles.button}>
      {isFavorite ? (
        <Favorite className={styles.icon} style={{ color: '#ff5a5f' }} />
      ) : (
        <FavoriteBorder className={styles.icon} />
      )}
    </button>
  )
}

