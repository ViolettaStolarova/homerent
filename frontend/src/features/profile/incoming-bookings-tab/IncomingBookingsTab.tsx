import { useState } from 'react'
import { useGetIncomingBookingsQuery } from '@/shared/api/users'
import {
	useConfirmBookingMutation,
	useRejectBookingMutation,
} from '@/shared/api/bookings'
import styles from './IncomingBookingsTab.module.scss'

export function IncomingBookingsTab() {
	const [filter, setFilter] = useState<'all' | 'confirmed' | 'rejected'>('all')
	const { data, isLoading } = useGetIncomingBookingsQuery({ filter })
	const [confirmBooking] = useConfirmBookingMutation()
	const [rejectBooking] = useRejectBookingMutation()

	const handleConfirm = async (id: number) => {
		try {
			await confirmBooking(id).unwrap()
		} catch (err) {
			console.error('Confirm booking error:', err)
		}
	}

	const handleReject = async (id: number) => {
		if (confirm('Вы уверены, что хотите отклонить бронирование?')) {
			try {
				await rejectBooking(id).unwrap()
			} catch (err) {
				console.error('Reject booking error:', err)
			}
		}
	}

	if (isLoading) {
		return <div>Загрузка...</div>
	}

	const bookings = data?.bookings || []
	const unreadCount = data?.unread_count || 0

	return (
		<div className={styles.tab}>
			<div className={styles.header}>
				<h2>
					Бронирования на мои объявления
					{unreadCount > 0 && (
						<span className={styles.badge}>{unreadCount}</span>
					)}
				</h2>
				<select
					value={filter}
					onChange={e => setFilter(e.target.value as typeof filter)}
				>
					<option value='all'>Все</option>
					<option value='confirmed'>Подтвержденные</option>
					<option value='rejected'>Отклоненные</option>
				</select>
			</div>

			<div className={styles.bookings}>
				{bookings.length > 0 ? (
					<table className={styles.table}>
						<thead>
							<tr>
								<th>Объявление</th>
								<th>Гость</th>
								<th>Даты</th>
								<th>Гостей</th>
								<th>Стоимость</th>
								<th>Статус</th>
								<th>Действия</th>
							</tr>
						</thead>
						<tbody>
							{bookings.map(booking => (
								<tr key={booking.id}>
									<td>{booking.title}</td>
									<td>{booking.guest_name}</td>
									<td>
										{new Date(booking.check_in).toLocaleDateString('ru-RU')} -{' '}
										{new Date(booking.check_out).toLocaleDateString('ru-RU')}
									</td>
									<td>{booking.guests}</td>
									<td>
										{booking.total_price?.toLocaleString('ru-RU') || 0} BYN
									</td>
									<td>{booking.status}</td>
									<td>
										{booking.status === 'pending' && (
											<div className={styles.actions}>
												<button
													onClick={() => handleConfirm(booking.id)}
													className={styles.confirmButton}
												>
													Подтвердить
												</button>
												<button
													onClick={() => handleReject(booking.id)}
													className={styles.rejectButton}
												>
													Отклонить
												</button>
											</div>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				) : (
					<div className={styles.empty}>Нет бронирований</div>
				)}
			</div>
		</div>
	)
}
