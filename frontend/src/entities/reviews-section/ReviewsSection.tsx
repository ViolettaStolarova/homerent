import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Review } from '@/shared/types'
import { useCreateReviewMutation } from '@/shared/api/reviews'
import { useMeQuery } from '@/shared/api/auth'
import { Rating } from '@mui/material'
import styles from './ReviewsSection.module.scss'

interface ReviewsSectionProps {
  propertyId: number
  reviews: Review[]
  rating?: number
  reviewCount?: number
}

export function ReviewsSection({ propertyId, reviews, rating, reviewCount }: ReviewsSectionProps) {
  const navigate = useNavigate()
  const { data: userData } = useMeQuery()
  const [showForm, setShowForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [comment, setComment] = useState('')
  const [createReview, { isLoading }] = useCreateReviewMutation()

  const isAuthenticated = !!userData?.user

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createReview({
        property_id: propertyId,
        rating: reviewRating,
        comment: comment || undefined,
      }).unwrap()
      setShowForm(false)
      setComment('')
    } catch (err) {
      console.error('Review error:', err)
    }
  }

  return (
    <div className={styles.reviewsSection}>
      <div className={styles.header}>
        <h3>
          Отзывы {rating && `(${Number(rating).toFixed(1)})`} {reviewCount && `(${reviewCount})`}
        </h3>
        <button
          onClick={() => {
            if (!isAuthenticated) {
              navigate('/auth/login')
              return
            }
            setShowForm(!showForm)
          }}
          className={styles.addButton}
        >
          {showForm ? 'Отмена' : 'Оставить отзыв'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.reviewForm}>
          <div className={styles.field}>
            <label>Оценка</label>
            <Rating
              value={reviewRating}
              onChange={(_, value) => setReviewRating(value || 5)}
              size="large"
            />
          </div>
          <div className={styles.field}>
            <label>Комментарий</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className={styles.textarea}
            />
          </div>
          <button type="submit" disabled={isLoading} className={styles.submitButton}>
            {isLoading ? 'Отправка...' : 'Отправить'}
          </button>
        </form>
      )}

      <div className={styles.reviewsList}>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className={styles.review}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewAuthor}>
                  {review.full_name || review.username || 'Аноним'}
                </div>
                <Rating value={review.rating} readOnly size="small" />
              </div>
              {review.comment && <p className={styles.reviewComment}>{review.comment}</p>}
              <div className={styles.reviewDate}>
                {new Date(review.created_at).toLocaleDateString('ru-RU')}
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noReviews}>Пока нет отзывов</p>
        )}
      </div>
    </div>
  )
}

