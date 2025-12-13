import { Link } from 'react-router-dom'
import { useGetMyPropertiesQuery } from '@/shared/api/users'
import { useDeletePropertyMutation } from '@/shared/api/properties'
import styles from './PropertiesTab.module.scss'

export function PropertiesTab() {
	const { data: properties, isLoading } = useGetMyPropertiesQuery()
	const [deleteProperty] = useDeletePropertyMutation()

	const handleDelete = async (id: number) => {
		if (confirm('Вы уверены, что хотите удалить объявление?')) {
			try {
				await deleteProperty(id).unwrap()
			} catch (err) {
				console.error('Delete property error:', err)
			}
		}
	}

	if (isLoading) {
		return <div>Загрузка...</div>
	}

	return (
		<div className={styles.tab}>
			<div className={styles.header}>
				<h2>Мои объявления</h2>
				<Link to='/property/new' className={styles.addButton}>
					Добавить объявление
				</Link>
			</div>

			<div className={styles.properties}>
				{properties && properties.length > 0 ? (
					properties.map(property => (
						<div key={property.id} className={styles.propertyCard}>
							<img
								src={property.main_image || 'https://via.placeholder.com/200'}
								alt={property.title}
								className={styles.image}
							/>
							<div className={styles.content}>
								<h3>{property.title}</h3>
								<div className={styles.actions}>
									<Link
										to={`/property/edit/${property.id}`}
										className={styles.editButton}
									>
										Редактировать
									</Link>
									<button
										onClick={() => handleDelete(property.id)}
										className={styles.deleteButton}
									>
										Удалить
									</button>
								</div>
							</div>
						</div>
					))
				) : (
					<div className={styles.empty}>
						<p>У вас пока нет объявлений</p>
						<Link to='/property/new' className={styles.addButton}>
							Добавить объявление
						</Link>
					</div>
				)}
			</div>
		</div>
	)
}
