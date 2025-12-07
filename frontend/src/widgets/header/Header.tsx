import { Link } from 'react-router-dom'
import { useMeQuery } from '@/shared/api/auth'
import { UserMenu } from '@/features/user-menu'
import styles from './Header.module.scss'

export function Header() {
  const { data, isLoading } = useMeQuery()

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoText}>Homerent</span>
        </Link>
        <nav className={styles.nav}>
          {isLoading ? (
            <div>Загрузка...</div>
          ) : data?.user ? (
            <UserMenu user={data.user as { id: number; full_name: string; avatar_url?: string; role: string }} />
          ) : (
            <div className={styles.authLinks}>
              <Link to="/auth/login" className={styles.link}>
                Войти
              </Link>
              <Link to="/auth/register" className={styles.link}>
                Регистрация
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

