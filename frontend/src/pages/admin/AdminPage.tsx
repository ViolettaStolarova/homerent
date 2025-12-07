import { useState } from 'react'
import { useGetStatsQuery, useLazyExportDataQuery } from '@/shared/api/admin'
import styles from './AdminPage.module.scss'

export function AdminPage() {
  const { data: stats, isLoading } = useGetStatsQuery()
  const [exportData, { isLoading: isExporting }] = useLazyExportDataQuery()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [format, setFormat] = useState<'csv' | 'xlsx' | 'pdf'>('csv')

  const handleExport = async () => {
    try {
      const result = await exportData({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        format,
      }).unwrap()
      // Handle file download
    } catch (err) {
      console.error('Export error:', err)
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
            <div className={styles.statSubtext}>Новых за месяц: {stats?.users.new_this_month || 0}</div>
          </div>

          <div className={styles.statCard}>
            <h3>Объявления</h3>
            <div className={styles.statValue}>{stats?.properties.total || 0}</div>
            <div className={styles.statSubtext}>
              Новых за месяц: {stats?.properties.new_this_month || 0}
            </div>
          </div>

          <div className={styles.statCard}>
            <h3>Бронирования</h3>
            <div className={styles.statValue}>{stats?.bookings.total || 0}</div>
            <div className={styles.statSubtext}>Активных: {stats?.bookings.active || 0}</div>
          </div>
        </div>

        <div className={styles.exportSection}>
          <h2>Экспорт данных</h2>
          <div className={styles.exportForm}>
            <div className={styles.field}>
              <label>Начальная дата</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label>Конечная дата</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>Формат</label>
              <select value={format} onChange={(e) => setFormat(e.target.value as typeof format)}>
                <option value="csv">CSV</option>
                <option value="xlsx">XLSX</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <button onClick={handleExport} disabled={isExporting} className={styles.exportButton}>
              {isExporting ? 'Экспорт...' : 'Экспортировать'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

