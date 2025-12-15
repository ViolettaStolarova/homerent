import { useState } from 'react'
import { useGetStatsQuery, useExportDataMutation } from '@/shared/api/admin'
import styles from './AdminPage.module.scss'

export function AdminPage() {
	const { data: stats, isLoading } = useGetStatsQuery()
	const [exportData, { isLoading: isExporting }] = useExportDataMutation()
	const [startDate, setStartDate] = useState('')
	const [endDate, setEndDate] = useState('')
	const [format, setFormat] = useState<'csv'>('csv')

	const handleExport = async () => {
		if (!startDate || !endDate) {
			alert('Пожалуйста, выберите начальную и конечную даты')
			return
		}

		try {
			const blob = await exportData({
				start_date: startDate,
				end_date: endDate,
				format,
			}).unwrap()

			const url = window.URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `homerent_export_${startDate}_${endDate}.${format}`
			document.body.appendChild(a)
			a.click()
			window.URL.revokeObjectURL(url)
			document.body.removeChild(a)
		} catch (err: any) {
			console.error('Export error:', err)
			const errorMessage =
				err?.data?.error || err?.message || 'Ошибка при экспорте данных'
			if (typeof errorMessage === 'string') {
				try {
					const parsed = JSON.parse(errorMessage)
					alert(parsed.error || errorMessage)
				} catch {
					alert(errorMessage)
				}
			} else {
				alert('Ошибка при экспорте данных')
			}
		}
	}

	if (isLoading) {
		return <div className={styles.loading}>Загрузка...</div>
	}

	return (
		<div className={styles.adminPage}>
			<div className={styles.container}>
				<h1 className={styles.title}>Админ-панель</h1>

				<div className={styles.stats}>
					<div className={styles.statCard}>
						<h3>Пользователи</h3>
						<div className={styles.statValue}>{stats?.users.total || 0}</div>
						<div className={styles.statSubtext}>
							Новых за месяц: {stats?.users.new_this_month || 0}
						</div>
					</div>

					<div className={styles.statCard}>
						<h3>Объявления</h3>
						<div className={styles.statValue}>
							{stats?.properties.total || 0}
						</div>
						<div className={styles.statSubtext}>
							Новых за месяц: {stats?.properties.new_this_month || 0}
						</div>
					</div>

					<div className={styles.statCard}>
						<h3>Бронирования</h3>
						<div className={styles.statValue}>{stats?.bookings.total || 0}</div>
						<div className={styles.statSubtext}>
							Активных: {stats?.bookings.active || 0}
						</div>
					</div>
				</div>

				<div className={styles.exportSection}>
					<h2>Экспорт данных</h2>
					<div className={styles.exportForm}>
						<div className={styles.field}>
							<label>Начальная дата</label>
							<input
								type='date'
								value={startDate}
								onChange={e => setStartDate(e.target.value)}
							/>
						</div>
						<div className={styles.field}>
							<label>Конечная дата</label>
							<input
								type='date'
								value={endDate}
								onChange={e => setEndDate(e.target.value)}
							/>
						</div>
						<div className={styles.field}>
							<label>Формат</label>
							<select
								value={format}
								onChange={e => setFormat(e.target.value as typeof format)}
							>
								<option value='csv'>CSV</option>
							</select>
						</div>
						<button
							onClick={handleExport}
							disabled={isExporting || !startDate || !endDate}
							className={styles.exportButton}
						>
							{isExporting ? 'Экспорт...' : 'Экспортировать'}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
