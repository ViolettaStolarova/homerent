import { useState } from 'react'
import { useGetPropertiesQuery } from '@/shared/api/properties'
import { PropertyType, SortBy } from '@/shared/types'
import { SearchForm } from '@/features/search-form'
import { PropertyCard } from '@/entities/property-card'
import { Pagination } from '@/shared/ui/pagination'
import styles from './HomePage.module.scss'

export function HomePage() {
	const [filters, setFilters] = useState({
		page: 1,
		limit: 12,
		city: '',
		check_in: '',
		check_out: '',
		guests: undefined as number | undefined,
		property_type: undefined as PropertyType | undefined,
		min_price: undefined as number | undefined,
		max_price: undefined as number | undefined,
		sort_by: SortBy.DATE_DESC,
	})

	const { data, isLoading } = useGetPropertiesQuery(filters)

	const handleSearch = (
		searchFilters: Omit<typeof filters, 'page' | 'limit' | 'sort_by'>
	) => {
		setFilters(prev => ({
			...prev,
			...searchFilters,
			page: 1,
		}))
	}

	const handlePageChange = (page: number) => {
		setFilters({ ...filters, page })
	}

	return (
		<div className={styles.homePage}>
			<div className={styles.hero}>
				<h1 className={styles.title}>Найдите идеальное жилье для отдыха</h1>
				<SearchForm onSearch={handleSearch} />
			</div>

			<div className={styles.content}>
				<div className={styles.sortBar}>
					<select
						value={filters.sort_by}
						onChange={e =>
							setFilters({
								...filters,
								sort_by: e.target.value as SortBy,
								page: 1,
							})
						}
						className={styles.sortSelect}
					>
						<option value={SortBy.DATE_DESC}>По дате ↓ (новые)</option>
						<option value={SortBy.DATE_ASC}>По дате ↑ (старые)</option>
						<option value={SortBy.PRICE_ASC}>По цене ↑ (дешевле)</option>
						<option value={SortBy.PRICE_DESC}>По цене ↓ (дороже)</option>
						<option value={SortBy.RATING_DESC}>По рейтингу ↓ (выше)</option>
						<option value={SortBy.RATING_ASC}>По рейтингу ↑ (ниже)</option>
					</select>
				</div>

				{isLoading ? (
					<div className={styles.loading}>Загрузка...</div>
				) : data?.properties.length ? (
					<>
						<div className={styles.propertiesGrid}>
							{data.properties.map(property => (
								<PropertyCard key={property.id} property={property} />
							))}
						</div>
						{data.pagination.pages > 1 && (
							<Pagination
								currentPage={data.pagination.page}
								totalPages={data.pagination.pages}
								onPageChange={handlePageChange}
							/>
						)}
					</>
				) : (
					<div className={styles.empty}>Объявления не найдены</div>
				)}
			</div>
		</div>
	)
}
