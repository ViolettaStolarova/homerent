import { useState } from 'react'
import { PropertyType } from '@/shared/types'
import styles from './SearchForm.module.scss'

interface SearchFormProps {
	onSearch: (filters: {
		city: string
		check_in: string
		check_out: string
		guests: number | undefined
		property_type: PropertyType | undefined
		min_price: number | undefined
		max_price: number | undefined
	}) => void
}

export function SearchForm({ onSearch }: SearchFormProps) {
	const [city, setCity] = useState('')
	const [checkIn, setCheckIn] = useState('')
	const [checkOut, setCheckOut] = useState('')
	const [guests, setGuests] = useState<number | undefined>(undefined)
	const [propertyType, setPropertyType] = useState<PropertyType | undefined>(
		undefined
	)
	const [minPrice, setMinPrice] = useState<number | undefined>(undefined)
	const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined)

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		onSearch({
			city,
			check_in: checkIn,
			check_out: checkOut,
			guests,
			property_type: propertyType,
			min_price: minPrice,
			max_price: maxPrice,
		})
	}

	return (
		<form onSubmit={handleSubmit} className={styles.form}>
			<div className={styles.fields}>
				<input
					type='text'
					placeholder='Город/адрес'
					value={city}
					onChange={e => setCity(e.target.value)}
					className={styles.input}
				/>
				<input
					type='date'
					placeholder='Заезд'
					value={checkIn}
					onChange={e => setCheckIn(e.target.value)}
					className={styles.input}
				/>
				<input
					type='date'
					placeholder='Выезд'
					value={checkOut}
					onChange={e => setCheckOut(e.target.value)}
					className={styles.input}
				/>
				<input
					type='number'
					placeholder='Гостей'
					min='1'
					value={guests || ''}
					onChange={e =>
						setGuests(e.target.value ? parseInt(e.target.value) : undefined)
					}
					className={styles.input}
				/>
				<select
					value={propertyType || ''}
					onChange={e =>
						setPropertyType((e.target.value as PropertyType) || undefined)
					}
					className={styles.input}
				>
					<option value=''>Все</option>
					<option value={PropertyType.APARTMENT}>Квартира</option>
					<option value={PropertyType.HOUSE}>Дом</option>
					<option value={PropertyType.ROOM}>Комната</option>
					<option value={PropertyType.COTTAGE}>Коттедж</option>
				</select>
				<div className={styles.priceRange}>
					<input
						type='number'
						placeholder='Мин. цена'
						min='0'
						value={minPrice || ''}
						onChange={e =>
							setMinPrice(e.target.value ? parseInt(e.target.value) : undefined)
						}
						className={styles.input}
					/>
					<span>-</span>
					<input
						type='number'
						placeholder='Макс. цена'
						min='0'
						value={maxPrice || ''}
						onChange={e =>
							setMaxPrice(e.target.value ? parseInt(e.target.value) : undefined)
						}
						className={styles.input}
					/>
				</div>
				<button type='submit' className={styles.button}>
					Найти
				</button>
			</div>
		</form>
	)
}
