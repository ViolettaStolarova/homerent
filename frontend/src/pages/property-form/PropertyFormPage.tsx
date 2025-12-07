import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { PropertyType, Amenity } from '@/shared/types'
import {
	useGetPropertyQuery,
	useCreatePropertyMutation,
	useUpdatePropertyMutation,
} from '@/shared/api/properties'
import styles from './PropertyFormPage.module.scss'

const schema = yup.object({
	property_type: yup.string().required('Тип обязателен'),
	title: yup.string().required('Заголовок обязателен'),
	description: yup
		.string()
		.min(500, 'Минимум 500 символов')
		.required('Описание обязательно'),
	address: yup.string().required('Адрес обязателен'),
	city: yup.string().required('Город обязателен'),
	max_guests: yup.number().min(1).required(),
	bedrooms: yup.number().min(0).required(),
	beds: yup.number().min(1).required(),
	bathrooms: yup.number().min(1).required(),
	price_per_night: yup.number().min(1).required(),
	amenities: yup.array().of(yup.string()),
	images: yup.array().of(yup.string()),
})

export function PropertyFormPage() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const isEdit = !!id
	const { data: property, isLoading: isLoadingProperty } = useGetPropertyQuery(
		Number(id) || 0,
		{ skip: !id }
	)
	const [createProperty] = useCreatePropertyMutation()
	const [updateProperty] = useUpdatePropertyMutation()

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm({
		resolver: yupResolver(schema),
		defaultValues: property
			? {
					property_type: property.property_type,
					title: property.title,
					description: property.description,
					address: property.address,
					city: property.city,
					max_guests: property.max_guests,
					bedrooms: property.bedrooms,
					beds: property.beds,
					bathrooms: property.bathrooms,
					price_per_night: property.price_per_night,
					amenities: property.amenities || [],
					images: property.images?.map(img => img.image_url) || [],
			  }
			: undefined,
	})

	const amenities = watch('amenities') || []

	const toggleAmenity = (amenity: Amenity) => {
		const current = amenities as string[]
		if (current.includes(amenity)) {
			setValue(
				'amenities',
				current.filter(a => a !== amenity)
			)
		} else {
			setValue('amenities', [...current, amenity])
		}
	}

	const onSubmit = async (data: unknown) => {
		const formData = data as {
			property_type: PropertyType
			title: string
			description: string
			address: string
			city: string
			max_guests: number
			bedrooms: number
			beds: number
			bathrooms: number
			price_per_night: number
			amenities: string[]
			images: string[]
		}

		try {
			if (isEdit && id) {
				await updateProperty({ id: Number(id), data: formData }).unwrap()
			} else {
				await createProperty(formData).unwrap()
			}
			navigate('/profile/properties')
		} catch (err) {
			console.error('Property save error:', err)
		}
	}

	if (isEdit && isLoadingProperty) {
		return <div>Загрузка...</div>
	}

	return (
		<div className={styles.formPage}>
			<div className={styles.container}>
				<h1 className={styles.title}>
					{isEdit ? 'Редактировать объявление' : 'Добавить объявление'}
				</h1>
				<form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
					<div className={styles.section}>
						<h2>Основная информация</h2>
						<div className={styles.fields}>
							<div className={styles.field}>
								<label>Тип недвижимости</label>
								<select {...register('property_type')}>
									<option value=''>Выберите тип</option>
									<option value={PropertyType.APARTMENT}>Квартира</option>
									<option value={PropertyType.HOUSE}>Дом</option>
									<option value={PropertyType.ROOM}>Комната</option>
									<option value={PropertyType.COTTAGE}>Коттедж</option>
								</select>
								{errors.property_type && (
									<span className={styles.error}>
										{errors.property_type.message}
									</span>
								)}
							</div>

							<div className={styles.field}>
								<label>Заголовок</label>
								<input type='text' {...register('title')} />
								{errors.title && (
									<span className={styles.error}>{errors.title.message}</span>
								)}
							</div>

							<div className={styles.field}>
								<label>Описание (минимум 500 символов)</label>
								<textarea {...register('description')} rows={6} />
								{errors.description && (
									<span className={styles.error}>
										{errors.description.message}
									</span>
								)}
							</div>

							<div className={styles.field}>
								<label>Адрес</label>
								<input type='text' {...register('address')} />
								{errors.address && (
									<span className={styles.error}>{errors.address.message}</span>
								)}
							</div>

							<div className={styles.field}>
								<label>Город</label>
								<input type='text' {...register('city')} />
								{errors.city && (
									<span className={styles.error}>{errors.city.message}</span>
								)}
							</div>

							<div className={styles.grid}>
								<div className={styles.field}>
									<label>Гостей</label>
									<input
										type='number'
										min='1'
										{...register('max_guests', { valueAsNumber: true })}
									/>
								</div>
								<div className={styles.field}>
									<label>Спален</label>
									<input
										type='number'
										min='0'
										{...register('bedrooms', { valueAsNumber: true })}
									/>
								</div>
								<div className={styles.field}>
									<label>Кроватей</label>
									<input
										type='number'
										min='1'
										{...register('beds', { valueAsNumber: true })}
									/>
								</div>
								<div className={styles.field}>
									<label>Ванных</label>
									<input
										type='number'
										min='1'
										{...register('bathrooms', { valueAsNumber: true })}
									/>
								</div>
							</div>

							<div className={styles.field}>
								<label>Цена за ночь (BYN)</label>
								<input
									type='number'
									min='1'
									{...register('price_per_night', { valueAsNumber: true })}
								/>
								{errors.price_per_night && (
									<span className={styles.error}>
										{errors.price_per_night.message}
									</span>
								)}
							</div>
						</div>
					</div>

					<div className={styles.section}>
						<h2>Удобства</h2>
						<div className={styles.amenities}>
							{Object.values(Amenity).map(amenity => (
								<label key={amenity} className={styles.amenityCheckbox}>
									<input
										type='checkbox'
										checked={amenities.includes(amenity)}
										onChange={() => toggleAmenity(amenity)}
									/>
									<span>
										{amenity === Amenity.WIFI && 'Wi-Fi'}
										{amenity === Amenity.KITCHEN && 'Кухня'}
										{amenity === Amenity.TV && 'ТВ'}
										{amenity === Amenity.WASHER && 'Стиральная машина'}
										{amenity === Amenity.PARKING && 'Парковка'}
										{amenity === Amenity.POOL && 'Бассейн'}
									</span>
								</label>
							))}
						</div>
					</div>

					<div className={styles.section}>
						<h2>Фотографии</h2>
						<p className={styles.helpText}>
							Загрузите до 15 фотографий. Первая фотография будет главной.
							Максимальный размер файла: 10MB.
						</p>
						<input
							type='file'
							multiple
							accept='image/*'
							className={styles.fileInput}
						/>
						<p className={styles.note}>
							Примечание: Загрузка файлов требует дополнительной реализации на
							backend
						</p>
					</div>

					<button type='submit' className={styles.submitButton}>
						{isEdit ? 'Сохранить изменения' : 'Опубликовать'}
					</button>
				</form>
			</div>
		</div>
	)
}
