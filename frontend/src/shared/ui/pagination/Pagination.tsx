import styles from './Pagination.module.scss'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visiblePages = pages.filter(
    (page) =>
      page === 1 ||
      page === totalPages ||
      (page >= currentPage - 1 && page <= currentPage + 1)
  )

  return (
    <div className={styles.pagination}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.button}
      >
        Назад
      </button>
      {visiblePages.map((page, index) => (
        <div key={page}>
          {index > 0 && visiblePages[index - 1] !== page - 1 && (
            <span className={styles.dots}>...</span>
          )}
          <button
            onClick={() => onPageChange(page)}
            className={`${styles.button} ${currentPage === page ? styles.active : ''}`}
          >
            {page}
          </button>
        </div>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={styles.button}
      >
        Вперед
      </button>
    </div>
  )
}

