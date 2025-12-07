import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
	useGetBookingsQuery,
	useCancelBookingMutation,
} from '@/shared/api/bookings'
import { BookingStatus } from '@/shared/types'
import styles from './BookingsTab.module.scss'

export function BookingsTab() {
	const [filter, setFilter] = useState<BookingStatus | 'all'>('all')
	const { data: bookings, isLoading } = useGetBookingsQuery({
		filter,
		type: 'my_bookings',
	})
	const [cancelBooking] = useCancelBookingMutation()

	const handleCancel = async (id: number) => {
		if (confirm('Вы уверены, что хотите отменить бронирование?')) {
			try {
				await cancelBooking(id).unwrap()
			} catch (err) {
				console.error('Cancel booking error:', err)
			}
		}
	}

	const getStatusColor = (status: BookingStatus) => {
		switch (status) {
			case BookingStatus.CONFIRMED:
				return '#4caf50'
			case BookingStatus.PENDING:
				return '#ff9800'
			case BookingStatus.CANCELLED:
				return '#f44336'
			case BookingStatus.COMPLETED:
				return '#2196f3'
			default:
				return '#666'
		}
	}

	if (isLoading) {
		return <div>Загрузка...</div>
	}

	return (
		<div className={styles.tab}>
			<div className={styles.header}>
				<h2>Мои бронирования</h2>
				<select
					value={filter}
					onChange={e => setFilter(e.target.value as BookingStatus | 'all')}
				>
					<option value='all'>Все</option>
					<option value={BookingStatus.PENDING}>Предстоящие</option>
					<option value={BookingStatus.COMPLETED}>Завершенные</option>
					<option value={BookingStatus.CANCELLED}>Отмененные</option>
				</select>
			</div>

			<div className={styles.bookings}>
				{bookings && bookings.length > 0 ? (
					bookings.map(booking => (
						<div key={booking.id} className={styles.bookingCard}>
							<img
								src={booking.main_image || 'https://via.placeholder.com/200'}
								alt={booking.title}
								className={styles.image}
							/>
							<div className={styles.content}>
								<h3>{booking.title}</h3>
								<div className={styles.dates}>
									{new Date(booking.check_in).toLocaleDateString('ru-RU')} -{' '}
									{new Date(booking.check_out).toLocaleDateString('ru-RU')}
								</div>
								<div
									className={styles.status}
									style={{ color: getStatusColor(booking.status) }}
								>
									{booking.status === BookingStatus.PENDING && 'Предстоящее'}
									{booking.status === BookingStatus.CONFIRMED && 'Подтверждено'}
									{booking.status === BookingStatus.COMPLETED && 'Завершенное'}
									{booking.status === BookingStatus.CANCELLED && 'Отмененное'}
								</div>
								<div className={styles.price}>
									{booking.total_price?.toLocaleString('ru-RU') || 0} BYN
								</div>
								<div className={styles.actions}>
									{[BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(
										booking.status
									) && (
										<button
											onClick={() => handleCancel(booking.id)}
											className={styles.cancelButton}
										>
											Отменить
										</button>
									)}
									<Link
										to={`/property/${booking.property_id}`}
										className={styles.linkButton}
									>
										Перейти к объявлению
									</Link>
								</div>
							</div>
						</div>
					))
				) : (
					<div className={styles.empty}>Нет бронирований</div>
				)}
			</div>
		</div>
	)
}
