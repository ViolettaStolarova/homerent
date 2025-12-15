import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Property, UnavailableDate } from '@/shared/types'
import { useCreateBookingMutation } from '@/shared/api/bookings'
import { useMeQuery } from '@/shared/api/auth'
import styles from './BookingForm.module.scss'

interface BookingFormProps {
	property: Property
	unavailableDates: UnavailableDate[]
}

export function BookingForm({ property, unavailableDates }: BookingFormProps) {
	const navigate = useNavigate()
	const { data: userData } = useMeQuery()
	const [checkIn, setCheckIn] = useState<Date | null>(null)
	const [checkOut, setCheckOut] = useState<Date | null>(null)
	const [guests, setGuests] = useState(1)
	const [createBooking, { isLoading }] = useCreateBookingMutation()

	const isAuthenticated = !!userData?.user

	const { handleSubmit } = useForm()

	const isDateBlocked = (date: Date) => {
		return unavailableDates.some(range => {
			const start = new Date(range.check_in)
			const end = new Date(range.check_out)
			return date >= start && date <= end
		})
	}

	const calculateTotal = () => {
		if (!checkIn || !checkOut) return 0
		const nights = Math.ceil(
			(checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
		)
		return nights * property.price_per_night
	}

	const onSubmit = async () => {
		if (!isAuthenticated) {
			navigate('/auth/login')
			return
		}

		if (!checkIn || !checkOut) return

		try {
			await createBooking({
				property_id: property.id,
				check_in: checkIn.toISOString().split('T')[0],
				check_out: checkOut.toISOString().split('T')[0],
				guests,
			}).unwrap()
			setCheckIn(null)
			setCheckOut(null)
			setGuests(1)
		} catch (err: any) {
			console.error('Booking error:', err)
			const errorMessage =
				err?.data?.error ||
				'Ошибка при создании бронирования. Попробуйте позже.'
			alert(errorMessage)
		}
	}

	return (
		<div className={styles.bookingForm}>
			<div className={styles.price}>
				{property.price_per_night.toLocaleString('ru-RU')} BYN{' '}
				<span>/ ночь</span>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
				<div className={styles.datePicker}>
					<label>Даты</label>
					<div className={styles.dates}>
						<DatePicker
							selected={checkIn}
							onChange={date => setCheckIn(date)}
							selectsStart
							startDate={checkIn}
							endDate={checkOut}
							minDate={new Date()}
							filterDate={date => !isDateBlocked(date)}
							placeholderText='Заезд'
							className={styles.input}
						/>
						<DatePicker
							selected={checkOut}
							onChange={date => setCheckOut(date)}
							selectsEnd
							startDate={checkIn}
							endDate={checkOut}
							minDate={checkIn || new Date()}
							filterDate={date => !isDateBlocked(date)}
							placeholderText='Выезд'
							className={styles.input}
						/>
					</div>
				</div>

				<div className={styles.field}>
					<label>Гостей</label>
					<input
						type='number'
						min='1'
						max={property.max_guests}
						value={guests}
						onChange={e => setGuests(parseInt(e.target.value) || 1)}
						className={styles.input}
					/>
				</div>

				{checkIn && checkOut && (
					<div className={styles.total}>
						<div className={styles.totalRow}>
							<span>
								{property.price_per_night.toLocaleString('ru-RU')} ×{' '}
								{Math.ceil(
									(checkOut.getTime() - checkIn.getTime()) /
										(1000 * 60 * 60 * 24)
								)}{' '}
								ночей
							</span>
							<span>{calculateTotal().toLocaleString('ru-RU')} BYN</span>
						</div>
						<div className={styles.totalRow}>
							<strong>Итого</strong>
							<strong>{calculateTotal().toLocaleString('ru-RU')} BYN</strong>
						</div>
					</div>
				)}

				<button
					type='submit'
					disabled={isLoading || !checkIn || !checkOut}
					className={styles.button}
					onClick={e => {
						if (!isAuthenticated) {
							e.preventDefault()
							navigate('/auth/login')
						}
					}}
				>
					{isLoading ? 'Бронирование...' : 'Забронировать'}
				</button>

				<p className={styles.warning}>
					После бронирования вы получите подтверждение от хозяина
				</p>
			</form>
		</div>
	)
}
